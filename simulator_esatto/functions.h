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
extern double ang_mom_tot, E_tot, total_energies[5], momentum_tot[2];
extern int x_grid_max, y_grid_max, delta, x_index, y_index;
extern double alpha; 

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

double distance_position(double* p1, double* p2)
{
    return sqrt(pow(p1[0]-p2[0],2) + pow(p1[1]-p2[1],2));
}


void collision(vector<Body> &bodies)
{   
    vector<Body>::iterator small, big;
    double* p = new double[8];
    double old_position_small[2];
    double old_position_big[2];
    double old_mass_big, old_mass_small, old_potential_big, old_potential_small;



    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j)
    {
        for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k)
        {             
            // computing the distance of each couple of bodies: if this distance is minor than the sum of 
            // their radius, we merge them
            if(Body::distance(*j, *k) < ((*j).radius + (*k).radius))
            {
                

                if((*j).radius > (*k).radius)
                {
                    p=(*j).merge(*k);

                    old_position_big[0] = p[0];
                    old_position_big[1] = p[1];
                    old_position_small[0] = p[2];
                    old_position_small[1] = p[3];
                    old_mass_big = p[4];
                    old_mass_small = p[5]; 
                    old_potential_big = p[6]; 
                    old_potential_small = p[7];

                    for(vector<Body>::iterator i=bodies.begin(); i<bodies.end(); ++i)
                    {
                        if(i!=j && i!=k)
                        {
                        double potential_big_i = - (*j).mass*(*i).mass/(Body::distance((*j), (*i)));
                        double potential_Obig_i = - old_mass_big*(*i).mass/(distance_position(old_position_big, (*i).position)); 
                        double potential_Osmall_i = - old_mass_small*(*i).mass/(distance_position(old_position_small, (*i).position));
                        double delta_i = potential_big_i - (potential_Obig_i + potential_Osmall_i);
                        (*i).potential_energy += delta_i;
                        (*j).potential_energy += potential_big_i;
                        (*j).binding_energy += -0.5*delta_i;
                        }

                    }

                    (*j).binding_energy -= 0.5*((*j).potential_energy - (old_potential_big + old_potential_small));

                    bodies.erase(k); 
                }
                else
                {
                    p=(*k).merge(*j);

                old_position_big[0] = p[0];
                old_position_big[1] = p[1];
                old_position_small[0] = p[2];
                old_position_small[1] = p[3];
                old_mass_big = p[4];
                old_mass_small = p[5]; 
                old_potential_big = p[6]; 
                old_potential_small = p[7];

                for(vector<Body>::iterator i=bodies.begin(); i<bodies.end(); ++i)
                {
                    if(i!=j && i!=k)
                    {
                    double potential_big_i = - (*k).mass*(*i).mass/(Body::distance((*k), (*i)));
                    double potential_Obig_i = - old_mass_big*(*i).mass/(distance_position(old_position_big, (*i).position)); 
                    double potential_Osmall_i = - old_mass_small*(*i).mass/(distance_position(old_position_small, (*i).position));
                    double delta_i = potential_big_i - (potential_Obig_i + potential_Osmall_i);
                    (*i).potential_energy += delta_i;
                    (*k).potential_energy += potential_big_i;
                    (*k).binding_energy += -0.5*delta_i;
                    }

                }

                
                (*k).binding_energy -= 0.5*((*k).potential_energy - (old_potential_big + old_potential_small));

                bodies.erase(j);
                }


            }


        }
    }

    bodies.shrink_to_fit();

}


/*
void collision(vector<Body> &bodies)
{
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j)
    {
        for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k)
        {             
            // computing the distance of each couple of bodies: if this distance is minor than the sum of 
            // their radius, we merge them
            if(Body::distance(*j, *k) < ((*j).radius + (*k).radius))
            {
                if((*j).radius > (*k).radius)
                {
                   (*j).merge(*k);
                    bodies.erase(k); 
                }

                else
                {
                    (*k).merge(*j);
                    bodies.erase(j);
                }
                
            }
        }
    }

    bodies.shrink_to_fit();
}
*/
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