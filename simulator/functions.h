#ifndef FUNCTIONS_H    // To make sure you don't declare the function more than once by including the header multiple times.
#define FUNCTIONS_H

#include <iostream>
#include <fstream>
#include <math.h>
#include <stdlib.h>
#include <time.h>
#include <vector>

#include "serializer.h"
#include "body.h"

//#define CARTESIAN
#define POLAR
//#define POLAR_VORTEX

//------------------------------------extern parameters-----------------------------
#ifdef CARTESIAN
//cartesian coordinates
extern double x_min, x_max, v_min, v_max;
#endif

#ifdef POLAR
//polar coordinates
extern double rho, v_max, theta, phi, R_module, V_module;
#endif

#ifdef POLAR_VORTEX
//polar coordinates with dependent rotation
extern double rho, theta, R_module;
#endif

extern int N; 
extern double mass_i, radius_i, dt;
extern double ang_mom_tot, E_tot, total_energies[6], momentum_tot[2];
extern int x_grid_max, y_grid_max, delta, x_index, y_index;
extern double alpha; 
double initial_total_potential_energy;
double final_total_potential_energy;
double* p = new double[8];
double p1[2];
double p2[2];
double m1, m2, pot1, pot2;
int l=0; 
extern string filename ; // Do not specify the extension

//---------------------------------------------------------------------------------



double uniform_generator(double x_min_, double x_max_)
{
    double r = ((double)(rand())) / RAND_MAX;
    return x_min_ + r * (x_max_ - x_min_);
}

double uniform_generator_polar(double x_min_, double x_max_)
{
    double r = ((double)(rand())) / RAND_MAX;
    return x_min_ + pow(r,0.5) * (x_max_ - x_min_);
}

void compute_CM(vector<Body> &bodies)
{
    double position_CM[]{0,0}; //position center of mass
    double velocity_CM[]{0,0}; //velocity center of mass
    double total_mass=0; //total mass of the system

    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {    
        total_mass += (*j).mass;
        position_CM[0] += (*j).mass * ((*j).position[0]);
        position_CM[1] += (*j).mass * ((*j).position[1]);
        velocity_CM[0] += (*j).mass * ((*j).velocity[0]);
        velocity_CM[1] += (*j).mass * ((*j).velocity[1]);
         
    }
    position_CM[0] = position_CM[0]/total_mass;
    position_CM[1] = position_CM[1]/total_mass;
    velocity_CM[0] = velocity_CM[0]/total_mass;
    velocity_CM[1] = velocity_CM[1]/total_mass;

    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {    
        (*j).position[0] -= position_CM[0];
        (*j).position[1] -= position_CM[1];
        (*j).velocity[0] -= velocity_CM[0];
        (*j).velocity[1] -= velocity_CM[1];
         
    }
}

void initial_condition(vector<Body> &bodies, double* position_i, double* velocity_i)
{
    for(int j=0; j<N; j++)
    { 
        #ifdef CARTESIAN
        position_i[0] = uniform_generator(x_min, x_max);
        position_i[1] = uniform_generator(x_min, x_max);
        velocity_i[0] = uniform_generator(v_min, v_max);
        velocity_i[1] = uniform_generator(v_min, v_max);
        #endif

        #ifdef POLAR
        theta = uniform_generator(0, 2*M_PI);
        phi = uniform_generator(0, 2*M_PI);
        R_module = uniform_generator_polar(0,rho);
        V_module = uniform_generator_polar(0, v_max);
        position_i[0] = R_module*cos(theta);
        position_i[1] = R_module*sin(theta);
        velocity_i[0] = V_module*cos(phi);
        velocity_i[1] = V_module*sin(phi);
        #endif
       
        #ifdef POLAR_VORTEX
        theta = uniform_generator(0, 2*M_PI);
        R_module = uniform_generator_polar(0, rho);
        position_i[0] = R_module*cos(theta);
        position_i[1] = R_module*sin(theta);
        velocity_i[0] = -(1/10)*(300-R_module)*sin(theta);
        velocity_i[1] = (1/10)*(300-R_module)*cos(theta);
        #endif

        bodies.push_back(Body(j, position_i, velocity_i, radius_i, mass_i));
    }


}

void check_up(Body &j)
{
    ang_mom_tot += j.get_orbital_momentum() + j.spin;
    momentum_tot[0] += j.get_x_momentum();
    momentum_tot[1] += j.get_y_momentum();
    E_tot += (j.get_kinetic_energy() + j.internal_energy + 0.5*j.potential_energy + j.binding_energy);

}



void collision(vector<Body> &bodies)
{   vector<Body>::iterator grande, piccolo;
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j)
    {
        for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k)
        {             
            // computing the distance of each couple of bodies: if this distance is minor than the sum of 
            // their radius, we merge them
            if(Body::distance(*j, *k) < ((*j).radius + (*k).radius))
            {
                
                
                if((*j).radius < (*k).radius)
                {      
                    piccolo=j;       
                    grande=k; 
                    /*if (l==0){cout << pot1+pot2 << ' ' << ((*j).potential_energy) << '\n'
                              << p1[0] << ' ' << p1[1] << ' ' << p2[0] << ' ' << p2[1] << ' ' <<
                              (*j).position[0] << ' ' << (*j).position[1] <<   endl; ++l;}*/
                } 
                
                else{piccolo=k; grande=j;}
                p=(*grande).merge(*piccolo);
                //bodies.erase(k);
                p1[0] = p[0];
                p1[1] = p[1];
                p2[0] = p[2];
                p2[1] = p[3];
                m1 = p[4];
                m2 = p[5]; 
                pot1 = p[6]; 
                pot2 = p[7];

                for(vector<Body>::iterator i=bodies.begin(); i<bodies.end() && i!=grande && i!=piccolo; ++i)
                {
                    double delta = ((*i).mass*m1/(Body::distance_(*i, p1))+(*i).mass*m2/(Body::distance_(*i, p2))-(*i).mass*(*grande).mass/(Body::distance(*i, *grande)));
                    (*i).potential_energy += delta; 
                    (*grande).binding_energy -= 0.5*delta; 
                    (*grande).potential_energy -= (*i).mass*(*grande).mass/(Body::distance(*i, *grande)); 
                }
                bodies.erase(piccolo);
                double delta_ = 0.5*(pot1+pot2-(*grande).potential_energy);
                (*grande).binding_energy += delta; 


            }
        }
    }

    bodies.shrink_to_fit();

}

void euler_dynamic(vector<Body> &bodies)
{
    //reset potential energy
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {
        (*j).potential_energy = 0;
    }

    //compute force and potential energy
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j)
    {   
        for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k){
            Body::force_and_potential(*j, *k);
        }
    }
    
    // evolving the position and the velocity of each particle in dt
    for(vector<Body>::iterator i=bodies.begin(); i<bodies.end(); ++i) 
    {
        (*i).update_pos_vel(dt); 
    }
}

void simpletic_dynamic(vector<Body> &bodies)
{
        for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j) 
    {
        (*j).update_position(dt/2);
        (*j).potential_energy = 0;
        (*j).acceleration[0] = 0;
        (*j).acceleration[1] = 0;
    }
        
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {
        if(j != bodies.end()-1)
        {
            for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k) 
            {
                Body::force_and_potential(*j, *k);
            }
        }

        (*j).update_velocity(dt);
        (*j).update_position(dt/2);
            
    }

}

int feedback(int &response)
{
    string answer;

    std::cout << "Do you want to start the computation? (\"YES\", \"NO\")"<<endl;
    std::cout<<"Answer: ";
    cin>>answer;
    if(answer == "YES" || answer == "yes" || answer == "Yes" || answer == "y" || answer == "Y")
    {
        response = 1;
        return 1;
    }
    else if(answer == "NO" || answer =="no" || answer == "No" || answer == "n" || answer == "N")
    {
        response = 0;
        return 1;
    }
    else
    {
        std::cout<<"\nINPUT ERROR. PLEASE RETRY.\n";
        return 0;
    }
    
}

void get_total_energies(vector<Body> &bodies)
{
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {
        total_energies[1] += (*j).get_kinetic_energy();
        total_energies[2] += (*j).internal_energy;
        total_energies[3] += 0.5*(*j).potential_energy;
        total_energies[4] += (*j).binding_energy;
    }
total_energies[0] += (total_energies[1] + total_energies[2] + total_energies[3] + total_energies[4]);
}
 
void loading_bar(double step)
{
    int n = int(step/10);
    std::cout << "\r" << "??" << ' ' <<flush;
    for(int i=0; i<n; ++i)
    std::cout <<  '|' << ' ' << flush; 
    for(int i=0; i<10-n; ++i)
    {
        if(i==0) std::cout << ' ' << flush;
        std::cout << ' ' << ' ' << flush;
    }
    std::cout << "??" << ' ' << flush;

   }

void create_pointers(double** &grid, double** &potential, double** &error)
{
    grid = new double*[x_index];
    potential = new double*[x_index];
    error = new double*[x_index];

     for(int i=0; i<x_index; ++i) 
    {
        grid[i] = new double[y_index]; 
        potential[i] = new double[y_index];
        error[i] = new double[y_index];
    }

}

void make_grid(vector<Body> &bodies, double** &grid, double** &potential, double** &error)
{
for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j) {grid[i][j]=0; potential[i][j]=0; error[i][j]=0;}

int i, j;

    for(vector<Body>::iterator k=bodies.begin(); k<bodies.end(); ++k)
    {
        i = int((*k).position[0]);
        j = int((*k).position[1]);
        i+=500;
        j+=500;
        i = i/delta;
        j = j/delta;
        if(i<x_index && j<y_index) 
        {
            grid[i][j] += ((*k).mass/mass_i);
            //grid[i+1][j] += (3/17)*((*k).mass/mass_i);
            //grid[i][j+1] += (3/17)*((*k).mass/mass_i);
            //grid[i-1][j] += (3/17)*((*k).mass/mass_i);
            //grid[i][j-1] += (3/17)*((*k).mass/mass_i);
        }        
    }
}

void next( double** &grid, double** &potential, double** &error)
{
    for(int i=1; i<x_index-1; ++i ) for(int j=1; j<y_index-1; ++j)
    {
    error[i][j] = potential[i][j]-(potential[i+1][j] + potential[i-1][j] + potential[i][j+1] + potential[i][j-1] - grid[i][j]*delta*delta)/4;
    potential[i][j] = potential[i][j] - alpha*error[i][j];
    }
}



#endif