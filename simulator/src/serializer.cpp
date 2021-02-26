#include <algorithm>
#include <functional>

#include <iostream>
#include <fstream>
#include <cstdlib>
#include <filesystem>

#include "serializer.h"

#ifndef __EMSCRIPTEN__
#include "miniz.h"
#endif

using namespace std;
using namespace std::filesystem;

// Fare sequenzialmente 
// write_potentials
// write_bodies
// write energies
Serializer::Serializer(string file_name, string out_dir) {
    this->byte_written = 0;
    this->name_index = 0;
    this->potential_index = 0;
    this->num_iteration = 0;
    this->out_dir = out_dir;
    create_directory(out_dir);
    
    this->file_name = out_dir + '/' + file_name;

    // Apro file binario dei corpi
    this->open_file();
    // Apro il file info
    outfile_info.open(info_file_name, std::ios::out);
    // Apro il file delle energie
    outfile_energies.open(energies_file_name, std::ios::out);
    
    //cout << "Serializer: init" << endl;

    outfile_info << "{ "<< endl;
    write_attr("version", file_version, false);
    write_attr("infoFileName", info_file_name, false);
    write_attr("energiesFileName", energies_file_name, false);
    write_attr("simFileName", bin_file_name, false);
}

Serializer::~Serializer() {
    //cout << "Serializer: end" << endl;
    //cout << "Serializer: number iterations = " << this->num_iteration << endl;
    //cout << "Serializer: minutes of simulation = " << this->num_iteration/60/60 << endl;

    write_attr("numIteration", to_string(this->num_iteration), true);
    write_attr("minSimulation", to_string(this->num_iteration/60/60), true);
    outfile_info << "\"potentials\": [" << endl;
    outfile_info << potentials_json.str();
    outfile_info << "]" << endl;
    outfile_info << "}"<< endl;

    outfile.close();
    outfile_info.close();
    outfile_energies.close();

    this->compress_files();
}

void Serializer::write_attr(string key, string value, bool is_num) {
    if(is_num)
        outfile_info << "\""<< key << "\": " << value << "," << endl;
    else
        outfile_info << "\""<< key << "\": " << "\"" << value << "\"," << endl;
}

void Serializer::write_init(float e_tot, float ang_mom_tot, float momentum_tot_x, float momentum_tot_y, int N, double mass_i) {
    write_attr("e_tot_start", to_string(e_tot), true);
    write_attr("ang_mom_tot_start", to_string(ang_mom_tot), true);
    write_attr("mom_tot_x_start", to_string(momentum_tot_x), true);
    write_attr("mom_tot_y_start", to_string(momentum_tot_y), true);
    write_attr("num_bodies", to_string(N), true);
    write_attr("mass_i", to_string(mass_i), true);
}

void Serializer::write_end(float e_tot, float ang_mom_tot, float momentum_tot_x, float momentum_tot_y) {
    write_attr("e_tot_end", to_string(e_tot), true);
    write_attr("ang_mom_tot_end", to_string(ang_mom_tot), true);
    write_attr("mom_tot_x_end", to_string(momentum_tot_x), true);
    write_attr("mom_tot_y_end", to_string(momentum_tot_y), true);
}

void Serializer::write_potential(double** potential, int m, int n) {
    string filename = potentials_file_name + to_string(potential_index) + ".bin";
    if(potential_index != 0)
        potentials_json << "," << endl;
    potentials_json << "{" << endl;
    potentials_json << "\"iteration\": " << to_string(num_iteration) << "," << endl;
    potentials_json << "\"fileName\": \"" << filename << "\"," << endl;
    potentials_json << "\"xSize\": " << to_string(m) << "," << endl;
    potentials_json << "\"ySize\": " << to_string(n) << endl;
    potentials_json << "}" ;

    ofstream out;
    out.open(filename, std::ios::binary);
    for(int i=0; i<m; i++)
        for(int j=0; j<n; j++){
            float el = potential[i][j];
            out.write(reinterpret_cast<char*>(& el), sizeof(float));
        }
    out.close();
    potential_index++;
}

// Nel file delle energie l'indice dell'array corrisponde all'iterazione
void Serializer::write_energies(float e_tot, float e_k_tot, float e_i_tot, float e_p_tot, float e_b_tot) {
    //float it = (float)num_iteration;
    //outfile_energies.write(reinterpret_cast<char*>(& it), sizeof(float));
    outfile_energies.write(reinterpret_cast<char*>(& e_tot), sizeof(float));
    outfile_energies.write(reinterpret_cast<char*>(& e_k_tot), sizeof(float));
    outfile_energies.write(reinterpret_cast<char*>(& e_i_tot), sizeof(float));
    outfile_energies.write(reinterpret_cast<char*>(& e_p_tot), sizeof(float));
    outfile_energies.write(reinterpret_cast<char*>(& e_b_tot), sizeof(float));
}

void Serializer::write_bodies(vector<Body> &state) {
    outfile.write(reinterpret_cast<char*>(& num_iteration), sizeof(int));

    //sorting by temperature's color
    std::sort(state.begin(), state.end(), [](Body& lhs, Body& rhs) {
        return lhs.get_color() < rhs.get_color();
    });
    

    float size = (float) state.size();
    outfile.write(reinterpret_cast<char*>(& size), sizeof(float));
    this->byte_written += sizeof(float);
    for(int i = 0; i < state.size(); i++) {
        this->byte_written += state[i].write_to_file(outfile);
    }

    if(this->byte_written >= this->max_file_size){
        this->split_file();
    }
    num_iteration++;
}

void Serializer::split_file() {
    #ifndef __EMSCRIPTEN__
        outfile.close();
        this->byte_written = 0;
        this->open_file();
    #endif
}

void Serializer::open_file() {
    // Apro il file binario dei corpi
    string f_name = bin_file_name + std::to_string(this->name_index++) + ".bin";
    outfile.open(f_name, std::ios::binary);
}

void Serializer::compress_files() {
    #ifndef __EMSCRIPTEN__
        cout << "Serializer: compressing file" << endl;
        // ===== Prepare an archive file;
        mz_zip_archive archive = mz_zip_archive();
        mz_zip_writer_init_file(&archive, (this->file_name + ".zip").c_str(), 0);

        //Compress info file
        string json_name = info_file_name;
        mz_zip_writer_add_file(&archive, Serializer::get_base_name(json_name).c_str(), json_name.c_str(), 0, 0, this->file_compression);
        remove(json_name.c_str());

        //Compress energies file
        string energies_name = energies_file_name;
        mz_zip_writer_add_file(&archive, Serializer::get_base_name(energies_name).c_str(), energies_name.c_str(), 0, 0, this->file_compression);
        remove(energies_name.c_str());

        // Compress binary files
        for(int i=0; i<name_index; i++) {
            string f_name = bin_file_name + std::to_string(i) + ".bin";
            mz_zip_writer_add_file(&archive, Serializer::get_base_name(f_name).c_str(), f_name.c_str(), 0, 0, this->file_compression);
            remove(f_name.c_str());
        }

        // Compress ptential files
        for(int i=0; i<potential_index; i++) {
            string f_name = potentials_file_name + std::to_string(i) + ".bin";
            //cout << f_name;
            mz_zip_writer_add_file(&archive, Serializer::get_base_name(f_name).c_str(), f_name.c_str(), 0, 0, this->file_compression);
            remove(f_name.c_str());
        }

        // ===== Finalize and close the temporary archive
        mz_zip_writer_finalize_archive(&archive);
        mz_zip_writer_end(&archive);
        cout << "Serializer: compressing done" << endl;
    #endif
}