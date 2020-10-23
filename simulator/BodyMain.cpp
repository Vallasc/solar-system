#include <iostream>
#include <math.h>
#include "Body.cpp"
using namespace std;

//------------------------------- global parameters ----------------------------
#define N 4; // number of bodies

int t = 0; // time
int dt = 1; // time interval
int t_f = 10000; // final time

//------------------------------------- main -----------------------------------
int main(){

//------------------------------------- start ----------------------------------
vector<body> bodies; // bodies vector
double position_i[2]; // variables with starting values
double velocity_i[2];
double mass_i = 1;
double radius_i = 1;

for(int j=0; j<N; ++j){ // random position and velocity initialization
    position_i[0] = rand();
    position_i[1] = rand();
    velocity_i[0] = rand();
    velocity_i[1] = rand();
    bodies.push_back(Body(position_i, velocity_i, mass_i, radius_i));
}


//------------------------------------ evolution -------------------------------
while(1)
{

    for(int j=bodies.begin(); j<bodies.end()-2; ++j){
        for(int k=j+1; k<bodies.end()-1; ++k){             
            // computing the distance of each couple of bodies: if this distance is minor than the sum of 
            // their radius, we merge them
            if(distance(bodies[j], bodies[k]) < (bodies[j].radius + bodies[k].radius)){
                bodies[j].merge(bodies[k]);
                bodies.erase(k);
                bodies.shrink_to_fit();
            }
        }
    }

    Serializer serializer("Dati/bodies.json"); //writing data on .json file
    serializer.write(t, bodies);

    if (t == t_f) break; // when we reach t_f the evolution terminates

    for(int j=bodies.begin(); j<bodies.end()-2; ++j){// computing all the forces between couples of bodies
        for(int k=j+1; k<bodies.end()-1; ++k){
            force(bodies[j], bodies[k]);
        }
    }

    for(int i=0; i<bodies.end()-1; ++i) bodies[i]->updatePosVel(dt); // evolving the position and the velocity of each particle in dt

    t+=dt; // the time flows

}



}