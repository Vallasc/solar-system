#include <math.h>
#include <sstream>
#ifndef BODY_H
#define BODY_H

class Body{

    public:
    Body(double* position_, double* velocity_, double radius_, double mass_);//parametric constructor
    Body() = default; //default constructor
    //Body & operator=(Body &&s); //rvalue assigment

    //functions
    void merge(Body& a); //b.merge(a); simulate a complete anelastic collision. b receive updated attributes, a must be deleted after the call of the function.
    void print(); //b.getAll(); show all attributes of b.
    void update_position(double dt); //b.updatePosition(dt); update the position of b using costant accelerated motion over a dt time.
    void update_velocity(double dt); //b.updatePosition(dt); update the velocity of b using costant accelerated motion over a dt time.
    void update_pos_vel(double dt); //b.updatePosVel(dt); update position (updatePosition(dt)) and velocity (updateVelocity(dt)) of b and reset acceleration.

    std::string to_json();

    static double distance(const Body &a, const Body &b);
    static void force(Body &a, Body &b);

    //getters
    double get_kinetic_energy(); //Get kinetic energy

    //variables
    double position[2];
    double velocity[2];
    double acceleration[2]; 
    double radius;
    double mass;
    double internal_energy; 
   

    
};

#endif
