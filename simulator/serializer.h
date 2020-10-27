#include <iostream>
#include <fstream>
#include <vector> 
#include <sstream>

#include "body.h"

#ifndef SERIALIZER_H
#define SERIALIZER_H

using namespace std;

class Serializer {
    private:
        ofstream outfile;
        string file_name;
        bool first = true;

    public:
        Serializer(string file_name);
        ~Serializer();
        void write(int time, vector<Body> &state);

};

#endif