#include <iostream>
#include <math.h>
#include <stdlib.h>
#include <time.h>
#include <vector>
#include <bits/stdc++.h>

#include "serializer.h"
#include "body.h"

using namespace std;

//------------------------------- global parameters ----------------------------
int N = 400; // number of bodies

float t = 0; // time
float dt = 0.05; // time interval
int t_f = 10; // final time
double x_min=0, x_max=1000; // lower and upper limit for positions and velocities
double v_min=0, v_max=80;
string filename = "generated/s4.json";

//------------------------------ real random number generator ---------------
double random_generator(double x_min, double x_max)
{
    double r = (double)(rand() / RAND_MAX);
    return x_min + r * (x_max - x_min);
}

//------------------------------------- main -----------------------------------
int main(){

    //------------------------------------- start line ----------------------------------
    vector<Body> bodies; // bodies vector
    double position_i[2]; // variables with starting values
    double velocity_i[2];
    double mass_i = 10;
    double radius_i = 1;

    srand(time(NULL)); // random seed

    for(int j=0; j<N; ++j){ // random position and velocity initialization
        position_i[0] = random_generator(x_min, x_max);
        position_i[1] = random_generator(x_min, x_max);
        velocity_i[0] = random_generator(v_min, v_max);
        velocity_i[1] = random_generator(v_min, v_max);
        bodies.push_back(Body(position_i, velocity_i, radius_i, mass_i));
    }

    Serializer serializer(filename); //writing data on .json file

    //------------------------------------ evolution -------------------------------
    while(1)
    {   
        cout << t << "\n";

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

        /*for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j)
        {
            (*j).print();
            cout<<"\n";
        }*/

        serializer.write(t, bodies);

        if (t >= t_f) break; // when we reach t_f the evolution terminates

        for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j){// computing all the forces between couples of bodies
            for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k){
                Body::force(*j, *k);
            }
        }
    
        /*for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j)
        {
            (*j).print();
            cout<<"\n";
        }*/

        for(vector<Body>::iterator i=bodies.begin(); i<bodies.end(); ++i) (*i).update_pos_vel(dt); // evolving the position and the velocity of each particle in dt

        t+=dt; // the time flows

    }



}
