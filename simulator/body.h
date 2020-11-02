#include <math.h>
#include <sstream>
#ifndef BODY_H
#define BODY_H

//---------------------------------- Body -----------------------------------
class Body{

    public:
    Body(double* position_, double* velocity_, double radius_, double mass_);//parametric constructor
    Body() = default; //default constructor

    //functions
    void merge(Body& a); //b.merge(a); simulate a complete anelastic collision. b receive updated attributes, a must be deleted after the call of the function.
    void print(); //show all attributes of the object.
    void update_position(double dt); //update the position of the object using costant accelerated motion over a dt time.
    void update_velocity(double dt); //update the velocity of the object using costant accelerated motion over a dt time.
    void update_pos_vel(double dt); //update position and velocity of the object and reset acceleration.

    std::string to_json();//prepare the format for json file

    static double distance(const Body &a, const Body &b);//compute the distance between two objects
    static void force_and_potential(Body &a, Body &b);//compute the force and the potential energy between two objects and change their accelaration accordingly

    //getters
    double get_kinetic_energy(); //return kinetic energy
    double get_orbital_momentum(); //return orbital angular momentum

    //variables
    double position[2]; 
    double velocity[2]; 
    double acceleration[2]; 
    double radius;
    double mass;
    double internal_energy; 
    double potential_energy;
    double spin;
   

    
};

#endif
