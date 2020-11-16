#include <iostream>
#include <fstream>
#include <vector> 
//#include <sstream>

#include "body.h"

#ifndef SERIALIZER_H
#define SERIALIZER_H

using namespace std;

class Serializer {
    private:
        ofstream outfile;
        string file_name;
        int byte_written;
        int name_index;
        int num_iteration;
        const int max_file_size = 2000000; // 1MB
        const int file_compression = 10; // 1 low - 10 max

        static string get_base_name(string const & path)
        {
            return path.substr(path.find_last_of("/\\") + 1);
        }
        void open_file();
        void split_file();
        void compress_files();

    public:
        Serializer(string file_name);
        ~Serializer();
        void write(float time, vector<Body> &state, float e_tot, float e_k_tot, float e_i_tot, float e_p_tot, float e_b_tot);

};

#endif