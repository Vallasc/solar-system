#ifndef BODY_H
#define BODY_H
#include <math.h>

double G = 1;

class Body{

    public:
    Body(double* position_, double* velocity_, double radius_, double mass_);
    Body()=default;
    Body & operator=(Body &&s);

    void merge(Body& a);
    void getAll();
    void updatePosition(double t);
    void updateVelocity(double t);
    void updatePosVel(double t);

    static int deadBodies;
    double position[2];
    double acceleration[2]; 
    double velocity[2];
    double radius
    double mass;
    //double E_k=0.5*mass*(pow(velocity[0], 2)+pow(velocity[1], 2));
    //double E_t;
    //double volume=4/3*M_PI*pow(radius,3);
   

    
};
int Body::deadBodies=0;

#endif
