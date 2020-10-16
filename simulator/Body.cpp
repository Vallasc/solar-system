#include <iostream>
#include <math.h>
#include "Body.h"

//public members
//parametric costructor
Body::Body(double* position_, double* velocity_, double radius_, double mass_):mass(mass_)
    {
        acceleration[0]=0; acceleration[1]=0;
        velocity[0]=velocity_[0]; velocity[1]=velocity_[1];
        position[0]=position_[0]; position[1]=position_[1];
        radius=radius_;
    }

//operator
Body & Body::operator=(Body &&s)
{
    position[0]=s.position[0];
    position[1]=s.position[1];
    velocity[0]=s.velocity[0];
    velocity[1]=s.velocity[1];
    acceleration[0]=s.acceleration[0];
    acceleration[1]=s.acceleration[1];
    mass=s.mass;
    radius=s.radius;

    return *this;
}

//funzioni
void Body::merge(Body& a){
        this->mass += a.mass;

        this->position[0]=(a.mass*a.position[0] + this->mass*this->position[0])/(this->mass);
        this->position[1]=(a.mass*a.position[1] + this->mass*this->position[1])/(this->mass);

        this->velocity[0]=(a.mass*a.velocity[0] + this->mass*this->velocity[0])/(this->mass);
        this->velocity[1]=(a.mass*a.velocity[1] + this->mass*this->velocity[1])/(this->mass);

        this->acceleration[0]=(a.mass*a.acceleration[0] + this->mass*this->acceleration[0])/(this->mass);
        this->acceleration[1]=(a.mass*a.acceleration[1] + this->mass*this->acceleration[1])/(this->mass);

        this->radius = pow((pow(this->radius,3) + pow(a.radius,3)), 1/3);
        Body::deadBodies++;
    }

void Body::getAll(){
    std::cout<<"position: "<<this->position[0]<<", "<<this->position[1]<<std::endl;
    std::cout<<"velocity: "<<this->velocity[0]<<", "<<this->velocity[1]<<std::endl;
    std::cout<<"acceleration: "<<this->acceleration[0]<<", "<<this->acceleration[1]<<std::endl;
    std::cout<<"radius: "<<this->radius<<std::endl;
    std::cout<<"mass: "<<this->mass<<"\n\n";
}

void Body::updatePosition(double t){
    position[0]=position[0]+velocity[0]*t+0.5*acceleration[0]*t*t;
    position[1]=position[1]+velocity[1]*t+0.5*acceleration[1]*t*t;
}

void Body::updateVelocity(double t){
    velocity[0]=velocity[0]+acceleration[0]*t;
    velocity[1]=velocity[1]+acceleration[1]*t;
}

void Body::updatePosVel(double t){
    updatePosition(t);
    updateVelocity(t);
}