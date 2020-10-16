#include <iostream>
#include <math.h>
#include "Body.cpp"

double distance(const Body &a, const Body &b)
{
     return sqrt(pow(a.position[0]-b.position[0],2) + pow(a.position[1]-b.position[1],2));
}

void force(Body &a, Body &b)
{
    double f=(G*b.mass*a.mass)/(pow(distance(a,b), 3));
    double fx_a=f*(b.position[0]-a.position[0]);//forza lungo x agente su a
    double fy_a=f*(b.position[1]-a.position[1]); //forza lungo y agente su a

    a.acceleration[0]+=fx_a/(a.mass);
    a.acceleration[1]+=fy_a/(a.mass);

    b.acceleration[0]-=fx_a/(b.mass);//uso il meno per il terzo prin di newton
    b.acceleration[1]-=fy_a/(b.mass);//same
}


using namespace std;
int main(){

    /*double pos[]{0,2};
    double pos1[]{0,5};
    double vel[]{0,0};
    Body g(pos,vel,1,10);
    Body h(pos1,vel,1,5);
    cout << distance(g, h) << endl;
    force(g,h);
    cout<<h.acceleration[1]<<endl;
    cout<<g.acceleration[1]<<endl;
    cout<<Body::deadBodies<<endl;
    g.merge(h);
    cout<<Body::deadBodies<<endl;
    cout<<g.acceleration[1]<<endl;
    cout<<h.acceleration[1]<<endl;*/

    double t=0.5, NBodies=2, NTiming=1;
    int r=1;

    Body array[2];
    double position0[]{-10,0}, position1[]{10,0}, velocity0[]{0,0}, velocity1[]{0,0};
    double mass0=5, mass1=5, radius0=1, radius1=2;

    array[0]=Body(position0, velocity0, radius0, mass0);
    array[1]=Body(position1, velocity1, radius1, mass1);

    array[0].getAll();
    array[1].getAll();
    cout<<"\n";

    //for(int i=0; i<NTiming; ++i){
    while(r){
      
        force(array[0], array[1]);
        array[0].updatePosVel(t);
        array[1].updatePosVel(t);
        array[0].getAll();
        array[1].getAll();
        cout<<"\n";
        cin>>r;
    }


}