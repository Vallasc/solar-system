#include <math.h>
#ifndef BODY_H
#define BODY_H

class Body{

    public:
    Body(double* position_, double* velocity_, double radius_, double mass_);//parametric constructor
    Body()=default; //default constructor
    //Body & operator=(Body &&s); //rvalue assigment

    //functions
    void merge(Body& a); //b.merge(a); simulate a complete anelastic collision. b receive updated attributes, a must be deleted after the call of the function.
    void getAll(); //b.getAll(); show all attributes of b.
    void updatePosition(double dt); //b.updatePosition(dt); update the position of b using costant accelerated motion over a dt time.
    void updateVelocity(double dt); //b.updatePosition(dt); update the velocity of b using costant accelerated motion over a dt time.
    void updatePosVel(double dt); //b.updatePosVel(dt); update position (updatePosition(dt)) and velocity (updateVelocity(dt)) of b and reset acceleration.

    //getters
    double GetKineticEnergy(); //Get kinetic energy

    //variables
    double position[2];
    double velocity[2];
    double acceleration[2]; 
    double radius;
    double mass;
    double internalEnergy; 
   

    
};

#endif
