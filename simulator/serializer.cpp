#include <algorithm>
#include <functional>

#include "serializer.h"

#ifndef __EMSCRIPTEN__
#include "miniz.h"
#endif

using namespace std;
// TODO mettere il deltaT di ogni iterazione
Serializer::Serializer(string file_name) {
    this->byte_written = 0;
    this->name_index = 0;
    this->num_iteration = 0;
    this->file_name = file_name;
    this->open_file();
    cout << "File opened" << endl;

    this->split_file(); // temporaneo per creare il file iniziale degli input
}

Serializer::~Serializer() {
    outfile.close();
    cout << "File closed" << endl;
    this->compress_files();
    cout << "Iterations: " << this->num_iteration << endl;
    cout << "Minutes of simulation: " << this->num_iteration/60/60 << endl;
}

void Serializer::write(float time, vector<Body> &state, float e_tot, float e_k_tot, float e_i_tot, float e_p_tot, float e_b_tot) {
    outfile.write(reinterpret_cast<char*>(& e_tot), sizeof(float));
    outfile.write(reinterpret_cast<char*>(& e_k_tot), sizeof(float));
    outfile.write(reinterpret_cast<char*>(& e_i_tot), sizeof(float));
    outfile.write(reinterpret_cast<char*>(& e_p_tot), sizeof(float));
    outfile.write(reinterpret_cast<char*>(& e_b_tot), sizeof(float));
    
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
    this->num_iteration++;
}

void Serializer::split_file() {
    #ifndef __EMSCRIPTEN__
        outfile.close();
        this->byte_written = 0;
        this->open_file();
    #endif
}

void Serializer::open_file() {
    string f_name = this->file_name + std::to_string(this->name_index++) + ".bin";
    outfile.open(f_name, std::ios::binary);
}

void Serializer::compress_files() {
    #ifndef __EMSCRIPTEN__
        cout << "Compressing" << endl;
        // ===== Prepare an archive file;
        mz_zip_archive archive = mz_zip_archive();
        mz_zip_writer_init_file(&archive, (this->file_name + ".zip").c_str(), 0);

        for(int i=0; i<name_index; i++) {
            string f_name = this->file_name + std::to_string(i) + ".bin";
            mz_zip_writer_add_file(&archive, Serializer::get_base_name(f_name).c_str(), f_name.c_str(), 0, 0, this->file_compression);
            remove(f_name.c_str());
        }

        // ===== Finalize and close the temporary archive
        mz_zip_writer_finalize_archive(&archive);
        mz_zip_writer_end(&archive);
        cout << "Done" << endl;
    #endif
}

/*
Serializer::Serializer(string file_name){
    this->file_name = file_name;

    outfile.open(file_name);
    cout << "File opened" << endl;
    outfile << "{\"states\":[" << endl;
}

Serializer::~Serializer(){
    outfile << endl << "]}";
    outfile.close();
    cout << "File closed" << endl;
}

void Serializer::write(float time, vector<Body> &state){ // Si possono aggiungere altri parametri da salvare
    std::stringstream ss2;
    ss2 << "\"p\":[";
    for(int i = 0; i < state.size(); i++) {
        if(i > 0)
            ss2 << ",";
        ss2 << state[i].to_json();
    }
    ss2 << "]" << "}";
    string out2 = ss2.str();

    std::stringstream ss1;
    int ss1_length = 16;
    // Calcolo al lunghezza dell'oggetto json completo di virgola e \n
    ss1 << "{" << "\"s\":\"" << setfill('0') << setw(8) << out2.length() + ss1_length << "\",";

    string out1 = ss1.str();

    if( first ) 
        first = false;
    else 
        outfile << ",";// << endl;

    outfile << out1 << out2;
}
*/