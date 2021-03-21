#include <algorithm>
#include <functional>
#include <sstream>

#ifdef _WIN32
#include<windows.h>
#else
#include <filesystem>
#endif

#include "serializer.h"

#include "miniz.h"


using namespace std;

Serializer::Serializer(string file_name) {
    this->byte_written = 0;
    this->name_index = 0;
    this->potential_index = 0;
    this->num_iteration = 0;
    
    this->file_name = file_name;

    create_dir(tmp_dir);

    // Apro file binario dei corpi
    this->open_file();
    // Apro il file info
    outfile_info.open(info_file_name, ios::out);
    // Apro il file delle energie
    outfile_energies.open(energies_file_name, ios::binary);
    
    //cout << "Serializer: init" << endl;

    outfile_info << "{ "<< endl;
    write_attr("version", file_version, false);
    write_attr("infoFileName", Serializer::get_base_name(info_file_name), false);
    write_attr("energiesFileName", Serializer::get_base_name(energies_file_name), false);
    write_attr("simFileName", Serializer::get_base_name(bin_file_name), false);
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
    if(num_iteration == 0){
        remove(file_name.c_str());
    }
    remove(tmp_dir.c_str());
}

void Serializer::write_attr(string key, string value, bool is_num) {
    if(is_num)
        outfile_info << "\""<< key << "\": " << value << "," << endl;
    else
        outfile_info << "\""<< key << "\": " << "\"" << value << "\"," << endl;
}

std::string Serializer::toStr(double x) {
    std::ostringstream strs;
    strs << x;
    std::string str = strs.str();
    return str;
}

void Serializer::write_init(double e_tot, double ang_mom_tot, double momentum_tot_x, double momentum_tot_y, int N, double mass_i) {
    write_attr("e_tot_start", to_string(e_tot), true);
    write_attr("ang_mom_tot_start", to_string(ang_mom_tot), true);
    write_attr("mom_tot_x_start", toStr(momentum_tot_x), true);
    write_attr("mom_tot_y_start", toStr(momentum_tot_y), true);
    write_attr("num_bodies", to_string(N), true);
    write_attr("mass_i", to_string(mass_i), true);
}

void Serializer::write_err(double err_E, double err_ang_mom, double err_momentum_x,double err_momentum_y) {
    write_attr("err_E", to_string(err_E), true);
    write_attr("err_ang_mom", to_string(err_ang_mom), true);
    write_attr("err_momentum_x", to_string(err_momentum_x), true);
    write_attr("err_momentum_y", to_string(err_momentum_y), true);
}

void Serializer::write_end(double e_tot, double ang_mom_tot, double momentum_tot_x, double momentum_tot_y) {
    write_attr("e_tot_end", to_string(e_tot), true);
    write_attr("ang_mom_tot_end", to_string(ang_mom_tot), true);
    write_attr("mom_tot_x_end", toStr(momentum_tot_x), true);
    write_attr("mom_tot_y_end", toStr(momentum_tot_y), true);
}

void Serializer::write_potential(double** potential, int m, int n, double time) {
    string filename = potentials_file_name + to_string(potential_index) + ".bin";
    if(potential_index != 0)
        potentials_json << "," << endl;
    potentials_json << "{" << endl;
    potentials_json << "\"iteration\": " << to_string(num_iteration) << "," << endl;
    potentials_json << "\"time\": " << to_string(time) << "," << endl;
    potentials_json << "\"fileName\": \"" << Serializer::get_base_name(filename) << "\"," << endl;
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
void Serializer::write_energies(float e_tot, float e_k_tot, float e_i_tot, float e_p_tot, float e_b_tot, float time) {

    outfile_energies.write(reinterpret_cast<char*>(& e_tot), sizeof(float));
    outfile_energies.write(reinterpret_cast<char*>(& e_k_tot), sizeof(float));
    outfile_energies.write(reinterpret_cast<char*>(& e_i_tot), sizeof(float));
    outfile_energies.write(reinterpret_cast<char*>(& e_p_tot), sizeof(float));
    outfile_energies.write(reinterpret_cast<char*>(& e_b_tot), sizeof(float));
    outfile_energies.write(reinterpret_cast<char*>(& time), sizeof(float));
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
    outfile.close();
    this->byte_written = 0;
    this->open_file();
}

void Serializer::open_file() {
    // Apro il file binario dei corpi
    string f_name = bin_file_name + std::to_string(this->name_index++) + ".bin";
    outfile.open(f_name, std::ios::binary);
}

void Serializer::compress_files() {
    cout << endl << "Serializer: compressing file" << endl;
    // ===== Prepare an archive file;
    mz_zip_archive archive = mz_zip_archive();
    mz_zip_writer_init_file(&archive, (this->file_name).c_str(), 0);

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
}

void Serializer::create_dir(string name) {
    #ifdef _WIN32
    CreateDirectoryA(name.c_str(), NULL);
    #elif __EMSCRIPTEN__
        std::__fs::filesystem::create_directory(name);
    #else
        filesystem::create_directory(name);
    #endif
}