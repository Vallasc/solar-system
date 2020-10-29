#include <iostream>
#include <math.h>
#include <stdlib.h>
#include <time.h>
#include <vector>
//#include <bits/stdc++.h>

#include "serializer.h"
#include "body.h"

//#define EULER
#define SIMPLETIC

using namespace std;

//------------------------------- global parameters ----------------------------
int N = 5000; // number of bodies

double t = 0; // time
double dt = 0.01; // time interval
int t_f = 80; // final time
double x_min=0, x_max=1000; // lower and upper limit for positions and velocities
double v_min=0, v_max=10;
string filename = "s3.json";

//------------------------------ real random number generator ---------------
double random_generator(double x_min_, double x_max_)
{
    double r = ((double)(rand())) / RAND_MAX;
    return x_min_ + r * (x_max_ - x_min_);
}

//------------------------------------- main -----------------------------------
int main(){

    //------------------------------------- start line ----------------------------------
    vector<Body> bodies; // bodies vector
    double position_i[2]; // variables with starting values
    double velocity_i[2];
    double mass_i = 100;
    double radius_i = 2;

    //double position_CM[]{0,0}; //position center of mass
    double velocity_CM[]{0,0}; //velocity center of mass
    double total_mass=0; //total mass of the system

    srand(time(NULL)); // random seed

    for(int j=0; j<N; ++j)
    { // random position and velocity initialization
        position_i[0] = random_generator(x_min, x_max);
        position_i[1] = random_generator(x_min, x_max);
        velocity_i[0] = random_generator(v_min, v_max);
        velocity_i[1] = random_generator(v_min, v_max);
        bodies.push_back(Body(position_i, velocity_i, radius_i, mass_i));
    }

    //compute position and velocity of the center of mass
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {    
        total_mass += (*j).mass;
        //position_CM[0] += (*j).mass * ((*j).position[0]);
        //position_CM[1] += (*j).mass * ((*j).position[1]);
        velocity_CM[0] += (*j).mass * ((*j).velocity[0]);
        velocity_CM[1] += (*j).mass * ((*j).velocity[1]);
         
    }
    //position_CM[0] = position_CM[0]/total_mass;
    //position_CM[1] = position_CM[1]/total_mass;
    velocity_CM[0] = velocity_CM[0]/total_mass;
    velocity_CM[1] = velocity_CM[1]/total_mass;

    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {    
        //(*j).position[0] += position_CM[0];
        //(*j).position[1] += position_CM[1];
        (*j).velocity[0] -= velocity_CM[0];
        (*j).velocity[1] -= velocity_CM[1];
         
    }
    

    Serializer serializer(filename); //writing data on .json file

    //------------------------------------ evolution -------------------------------
    while(1)
    {   
        //cout << t << "\n";

        for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j){
            for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k){             
                // computing the distance of each couple of bodies: if this distance is minor than the sum of 
                // their radius, we merge them
                if(Body::distance(*j, *k) < ((*j).radius + (*k).radius)){
                    (*j).merge(*k);
                    bodies.erase(k);
                }
            }
        }

        bodies.shrink_to_fit();

        serializer.write(t, bodies);

        if (t >= t_f) break; // when we reach t_f the evolution terminates

    #ifdef EULER
    //-------------------------------------- Euler dynamic ----------------------------------------
        for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j){// computing all the forces between couples of bodies
            for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k){
                Body::force(*j, *k);
            }
        }
    
        for(vector<Body>::iterator i=bodies.begin(); i<bodies.end(); ++i) (*i).update_pos_vel(dt); // evolving the position and the velocity of each particle in dt
    //----------------------------------------------------------------------------------------------
    #endif

    #ifdef SIMPLETIC
    //----------------------------------------- Simpletic dynamic ------------------------------------
        for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j) (*j).update_position(dt/2);
        
        for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j){
            if(j==bodies.end()-1){
                (*j).update_velocity(dt);
                (*j).update_position(dt/2);
                (*j).acceleration[0] = 0;
                (*j).acceleration[1] = 0;
            }

            else{
                for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k) Body::force(*j, *k);
    
                (*j).update_velocity(dt);
                (*j).update_position(dt/2);
                (*j).acceleration[0] = 0;
                (*j).acceleration[1] = 0;
            }
        }
    //-----------------------------------------------------------------------------------------------------
    #endif

    t+=dt; // the time flows

    }

}