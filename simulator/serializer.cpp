#include <fstream>
#include <iostream>
#include <iomanip>

#include "serializer.h"

using namespace std;

/*Serializer::Serializer(string file_name){
    this->file_name = file_name;

    outfile.open(file_name);
    cout << "File opened" << endl;
}

Serializer::~Serializer(){
    outfile.close();
    cout << "File closed" << endl;
}


void Serializer::write(float time, vector<Body> &state){ // Si possono aggiungere altri parametri da salvare
    std::stringstream ss2;
    for(int i = 0; i < state.size(); i++) {
        ss2 << state[i].serialize();
    }
    string out2 = ss2.str();

    std::stringstream ss1;
    int ss1_length = 9;
    // Calcolo al lunghezza dell'oggetto json completo di virgola e \n
    ss1 << setfill('0') << setw(8) << out2.length() + ss1_length << " ";

    string out1 = ss1.str();

    outfile << out1 << out2;
}*/

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