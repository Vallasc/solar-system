#include <fstream>
#include <iostream>

#include "serializer.h"

using namespace std;

Serializer::Serializer(string file_name){
    this->file_name = file_name;

    outfile.open(file_name);
    cout << "File opened" << endl;
    outfile << "{" << endl << "\"states\": [" << endl;
}

Serializer::~Serializer(){
    outfile << "]" << endl << "}" << endl;
    outfile.close();
    cout << "File closed" << endl;
}


void Serializer::write(float time, vector<Body> &state){ // Si possono aggiungere altri parametri da salvare
    if( first ) 
        first = false;
    else 
        outfile << "," << endl;
    outfile << "{" << "\"time\": " << time << ", ";
    outfile << "\"particles\": [";
    for(int i = 0; i < state.size(); i++) {
        if(i > 0)
            outfile << ",";
        outfile << state[i].to_json();
    }
    outfile << "]" << "}";
}