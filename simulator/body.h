#include <math.h>
#include <sstream>
#ifndef BODY_H
#define BODY_H

class Body
{

    public:
    Body(int id_, double* position_, double* velocity_, double radius_, double mass_);//parametric constructor
    Body() = default; //default constructor

    //functions
    double* merge(Body& a); //b.merge(a); simulate a complete anelastic collision. b receive updated attributes, a must be deleted after the call of the function.
    void print(); //show all attributes of the object.
    void update_position(double dt); //update the position of the object using costant accelerated motion over a dt time.
    void update_velocity(double dt); //update the velocity of the object using costant accelerated motion over a dt time.
    void update_pos_vel(double dt); //update position and velocity of the object and reset acceleration.

    std::string to_json();//prepare the format for json file
    int write_to_file(std::ofstream &outfile);

    static double distance(const Body &a, const Body &b);//compute the distance between two objects
    static double distance_(const Body &a, double* p);
    static double distancep(double* q, double* p);
    static void force_and_potential(Body &a, Body &b);//compute the force and the potential energy between two objects and change their accelaration accordingly

    //getters
    double get_kinetic_energy(); //return kinetic energy
    double get_x_momentum(); //return x momentum
    double get_y_momentum(); //return y momentum
    double get_orbital_momentum(); //return orbital angular momentum
    int get_color();
    double get_total_energies();
    
    //variables
    int id; 
    double position[2]; 
    double velocity[2]; 
    double acceleration[2]; 
    double radius;
    double mass;
    double internal_energy;
    double binding_energy; 
    double potential_energy;
    double spin;
    bool is_big_endian;

    private:
    // Swap float if it is big endian
    float reverse_float( const float inFloat );
    static bool check_big_endian(void)
    {
        union {
            uint32_t i;
            char c[4];
        } bint = {0x01020304};
        return bint.c[0] == 1; 
    }
    
};

#endif
