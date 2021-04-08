#include <sstream>
#include <stdexcept>
#include <iostream>
#include <fstream>
#include <string>

#ifndef CONFIG_H
#define CONFIG_H

extern int N; 
extern double t_f;
extern double dt;
extern double rho;
extern double v_max;
extern double mass_i;
extern double radius_i;

extern std::string filename ; 

class Config
{
    public :
        // Parse a config file
        static void parse(std::string filepath)
        {
            std::cout << "Loaded config:" << std::endl;
            std::ifstream file(filepath);
            file.rdbuf();
            std::stringstream is_file;
            is_file << file.rdbuf();
            std::string line;
            while( std::getline(is_file, line) )
            {
                if (line.size() > 0 && line[0] == '#')
                    continue;
                std::istringstream is_line(line);
                std::string key;
                if( std::getline(is_line, key, '=') )
                {
                    std::string value;
                    if( std::getline(is_line, value) ) 
                        change_var(key, value);
                }
            }
            file.close();
            std::cout << std::endl;
        }

        // Change the main simulator configs
        static void change_var(std::string id, std::string val)
        {
            if( id == "num_bodies")
            {
                N = std::stoi(val);
                std::cout << "num_bodies: " << N << std::endl;
            } 
            else if( id == "final_time")
            {
                t_f = std::stod(val);
                std::cout << "final_time: " << t_f << std::endl;
            } 
            else if( id == "time_interval")
            {
                dt = std::stod(val);
                std::cout << "time_interval: " << dt << std::endl;
            } 
            else if( id == "rho")
            {
                rho = std::stod(val);
                std::cout << "rho: " << rho << std::endl;
            } 
            else if( id == "max_velocity")
            {
                v_max = std::stod(val);
                std::cout << "max_velocity: " << v_max << std::endl;
            } 
            else if( id == "initial_mass")
            {
                mass_i = std::stod(val);
                std::cout << "initial_mass: " << mass_i << std::endl;
            } 
            else if( id == "initial_radius")
            {
                radius_i = std::stod(val);
                std::cout << "initial_radius: " << radius_i << std::endl;
            } 
            else if( id == "filename")
            {
                filename = val;
                std::cout << "filename: " << filename << std::endl;
            }
        }

        // Save an example config file
        static void make_example(std::string filepath)
        {
            ifstream file(filepath.c_str());
            bool exists = file.good();
            file.close();
            if(!exists){
                std::ofstream outfile;
                outfile.open(filepath, std::ios::out);
                outfile << "filename="<< filename << std::endl;
                outfile << "num_bodies="<< N << std::endl;
                outfile << "final_time="<< t_f << std::endl;
                outfile << "time_interval="<< dt << std::endl;
                outfile << "rho="<< rho << std::endl;
                outfile << "max_velocity="<< v_max << std::endl;
                outfile << "initial_mass="<< mass_i << std::endl;
                outfile << "initial_radius="<< radius_i << std::endl;
                outfile.close();
            }
        }

    private:
        Config() = default; // Default constructor
};

#endif

