#include <iostream>
#include <math.h>
#include "Body.h"

const int G=1;

//-------------------class constructors and operators-----------------------
//parametric costructor
Body::Body(double* position_, double* velocity_, double radius_, double mass_)
{
    //default inizialization variables
    acceleration[0]=0; acceleration[1]=0;
    internalEnergy=0;

    //variables
    velocity[0]=velocity_[0]; velocity[1]=velocity_[1];
    position[0]=position_[0]; position[1]=position_[1];
    radius=radius_;
    mass=mass_;
}


//-----------------class functions---------------------
//b.GetKineticEnergy; compute and return kinetic energy of b
double Body::GetKineticEnergy()
{
    return 0.5*mass*(pow(velocity[0], 2)+pow(velocity[1], 2));
}

//b.merge(a); simulate a complete anelastic collision. b receive updated attributes, a must be deleted after the call of the function.
void Body::merge(Body& a)
    {
        //dummy variables
        double kInitial = a.GetKineticEnergy() + this->GetKineticEnergy();

        //center of mass position
        this->position[0] = (a.mass*a.position[0] + this->mass*this->position[0])/(this->mass + a.mass);
        this->position[1] = (a.mass*a.position[1] + this->mass*this->position[1])/(this->mass + a.mass);

        //center of mass velocity
        this->velocity[0] = (a.mass*a.velocity[0] + this->mass*this->velocity[0])/(this->mass + a.mass);
        this->velocity[1] = (a.mass*a.velocity[1] + this->mass*this->velocity[1])/(this->mass + a.mass);

        //sum of volumes
        this->radius = pow((pow(this->radius,3) + pow(a.radius,3)), double(1)/3);

        //update internalEnergy. sum of internal energy + difference of initial and final kinetic energy
        this->internalEnergy += a.internalEnergy + (kInitial - this->GetKineticEnergy());


        //sum of masses
        this->mass += a.mass;
    }

//b.getAll(); show all attributes of b.
void Body::getAll()
    {
    std::cout<<"position: "<<this->position[0]<<", "<<this->position[1]<<std::endl;
    std::cout<<"velocity: "<<this->velocity[0]<<", "<<this->velocity[1]<<std::endl;
    std::cout<<"acceleration: "<<this->acceleration[0]<<", "<<this->acceleration[1]<<std::endl;
    std::cout<<"radius: "<<this->radius<<std::endl;
    std::cout<<"mass: "<<this->mass<<std::endl;
    std::cout<<"kinetic energy: "<<this->GetKineticEnergy()<<std::endl;
    std::cout<<"internal energy: "<<this->internalEnergy<<"\n\n";

    }

//b.updatePosition(dt); update the position of b using costant accelerated motion over a dt time.
void Body::updatePosition(double dt)
{
    position[0] += velocity[0]*dt + 0.5*acceleration[0]*dt*dt;
    position[1] += velocity[1]*dt + 0.5*acceleration[1]*dt*dt;
}

//b.updatePosition(dt); update the velocity of b using costant accelerated motion over a dt time.
void Body::updateVelocity(double dt)
{
    velocity[0] += acceleration[0]*dt;
    velocity[1] += acceleration[1]*dt;
}

//b.updatePosVel(dt); update position (updatePosition(dt)) and velocity (updateVelocity(dt)) of b and reset acceleration.
void Body::updatePosVel(double dt)
{
    updatePosition(dt);
    updateVelocity(dt);
    this->acceleration[0]=0;
    this->acceleration[1]=0;
}


//---------------external functions------------------------
//distance(a,b); return the distance between a and b.
double distance(const Body &a, const Body &b)
{
     return sqrt(pow(a.position[0]-b.position[0],2) + pow(a.position[1]-b.position[1],2));
}

//force(a,b); compute gravitational force between a and b and update the acceleration of each bodies.
void force(Body &a, Body &b)
{
    double f=(G*b.mass*a.mass)/(pow(distance(a,b), 3)); 
    double fx_a=f*(b.position[0]-a.position[0]);//force along x on a
    double fy_a=f*(b.position[1]-a.position[1]);//force along y on a

    a.acceleration[0] += fx_a/(a.mass);//updating acceleration
    a.acceleration[1] += fy_a/(a.mass);

    b.acceleration[0] -= fx_a/(b.mass);//let f_a the force acting on a, therefore -f_a is the force actiong on b (third newton principle)
    b.acceleration[1] -= fy_a/(b.mass);
}
