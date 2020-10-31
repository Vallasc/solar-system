#include <iostream>
#include <math.h>
#include <sstream>

#include "body.h"
#include <vector>

const int G=1;

//-------------------class constructors and operators-----------------------
//parametric costructor
Body::Body(double* position_, double* velocity_, double radius_, double mass_)
{
    //default inizialization variables
    acceleration[0]=0; acceleration[1]=0;
    internal_energy=0;
    spin=0;

    //variables
    velocity[0] = velocity_[0]; velocity[1] = velocity_[1];
    position[0] = position_[0]; position[1] = position_[1];
    radius = radius_;
    mass = mass_;
}


//-----------------class functions---------------------
//b.get_kinetic_energy; compute and return kinetic enery of b
double Body::get_kinetic_energy()
{
    return 0.5*mass*(pow(velocity[0], 2) + pow(velocity[1], 2));
}

double Body::get_orbital_momentum()
{
    double theta, phi, v, r;
    v=sqrt(pow(velocity[0],2) + pow(velocity[1],2));
    r=sqrt(pow(position[0],2) + pow(position[1],2));
    theta=atan(position[1]/position[0]);
    phi=atan(velocity[1]/velocity[0]);

    if(position[0]<0)
    {
        theta += M_PI;
        if(velocity[0]<0) 
        {
            phi += M_PI;
        }
    }
 
    return mass*r*v*sin(M_PI+theta-phi);
        
}

//b.merge(a); simulate a complete anelastic collision. b receive updated attributes, a must be deleted after the call of the function.
void Body::merge(Body& a)
    {
        //dummy variables
        double kinetic_initial = a.get_kinetic_energy() + this->get_kinetic_energy();
        double orbital_initial = a.get_orbital_momentum() + this->get_orbital_momentum();

        //center of mass position
        this->position[0] = (a.mass*a.position[0] + this->mass*this->position[0])/(this->mass + a.mass);
        this->position[1] = (a.mass*a.position[1] + this->mass*this->position[1])/(this->mass + a.mass);

        //center of mass velocity
        this->velocity[0] = (a.mass*a.velocity[0] + this->mass*this->velocity[0])/(this->mass + a.mass);
        this->velocity[1] = (a.mass*a.velocity[1] + this->mass*this->velocity[1])/(this->mass + a.mass);

        //sum of volumes
        this->radius = pow((pow(this->radius,3) + pow(a.radius,3)), double(1)/3);

        //update internalEnergy. sum of internal energy + difference of initial and final kinetic energy
        this->internal_energy += a.internal_energy + (kinetic_initial - this->get_kinetic_energy());

        //update angular momentum. sum of spins + difference of initial and final orbital momentum
        this->spin += a.spin + (orbital_initial - this->get_orbital_momentum());

        //sum of masses
        this->mass += a.mass;
    }

//b.print(); show all attributes of b.
void Body::print()
{
    std::cout<<"position: "<<this->position[0]<<", "<<this->position[1]<<std::endl;
    std::cout<<"velocity: "<<this->velocity[0]<<", "<<this->velocity[1]<<std::endl;
    std::cout<<"acceleration: "<<this->acceleration[0]<<", "<<this->acceleration[1]<<std::endl;
    std::cout<<"radius: "<<this->radius<<std::endl;
    std::cout<<"mass: "<<this->mass<<std::endl;
    std::cout<<"kinetic energy: "<<this->get_kinetic_energy()<<std::endl;
    std::cout<<"internal energy: "<<this->internal_energy<<std::endl;
    std::cout<<"orbital momentum: "<<this->get_orbital_momentum()<<std::endl;
    std::cout<<"spin: "<<this->spin<<"\n\n";

}

//b.update_position(dt); update the position of b using costant accelerated motion over a dt time.
void Body::update_position(double dt)
{
    position[0] += velocity[0]*dt + 0.5*acceleration[0]*dt*dt;
    position[1] += velocity[1]*dt + 0.5*acceleration[1]*dt*dt;
}

//b.update_velocity(dt); update the velocity of b using costant accelerated motion over a dt time.
void Body::update_velocity(double dt)
{
    velocity[0] += acceleration[0]*dt;
    velocity[1] += acceleration[1]*dt;
}

//b.update_pos_vel(dt); update position (updatePosition(dt)) and velocity (updateVelocity(dt)) of b and reset acceleration.
void Body::update_pos_vel(double dt)
{
    update_position(dt);
    update_velocity(dt);
    this->acceleration[0] = 0;
    this->acceleration[1] = 0;
}

std::string Body::to_json()
{
    std::stringstream ss;
    ss <<  "{";
    ss <<"\" positionX\": "<< this->position[0] << ",";
    ss <<"\" positionY\": "<< this->position[1] << ",";

    ss <<"\" velocityX\": "<< this->velocity[0] << ",";
    ss <<"\" velocityY\": "<< this->velocity[1] << ",";

    ss <<"\" accX\": "<< this->acceleration[0] << ",";
    ss <<"\" accY\": "<< this->acceleration[1] << ",";

    ss <<"\" radius\": "<< this->radius << ",";
    ss <<"\" mass\": "<< this->mass << ",";
    ss <<"\" k_energy\": "<< this->get_kinetic_energy() << ",";
    ss <<"\" internal_energy\": "<< this->internal_energy;
    ss <<  "}";
    return ss.str();
}


//---------------static methods------------------------
//distance(a,b); return the distance between a and b.
double Body::distance(const Body &a, const Body &b)
{
     return sqrt(pow(a.position[0]-b.position[0],2) + pow(a.position[1]-b.position[1],2));
}

//force(a,b); compute gravitational force between a and b and update the acceleration of each bodies.
void Body::force(Body &a, Body &b)
{
    double f = (G*b.mass*a.mass)/(pow(distance(a,b), 3)); 
    double fx_a = f*(b.position[0]-a.position[0]);//force along x on a
    double fy_a = f*(b.position[1]-a.position[1]);//force along y on a

    a.acceleration[0] += fx_a/(a.mass);//updating acceleration
    a.acceleration[1] += fy_a/(a.mass);

    b.acceleration[0] -= fx_a/(b.mass);//let f_a the force acting on a, therefore -f_a is the force actiong on b (third newton principle)
    b.acceleration[1] -= fy_a/(b.mass);
}
