#include <iostream>
#include <math.h>
#include <vector>
#include "Body.cpp"


using namespace std;
int main(){

    int dt=1, NBodies=2, NTiming=1;
    int r=1;

    vector<Body> vec;
    double position0[]{-5,0}, position1[]{5,0}, velocity0[]{0,0}, velocity1[]{0,0};
    double mass0=5, mass1=5, radius0=1, radius1=2;

    vec.push_back(Body(position0, velocity0, radius0, mass0));
    vec.push_back(Body(position1, velocity1, radius1, mass1));

    vec[0].getAll();
    vec[1].getAll();
    cout<<"\n";

    //for(int i=0; i<NTiming; ++i){
    while(r){
      
        if(vec.size() > 1)
        {
            force(vec[0], vec[1]);
        }

        for(int i=0; i<vec.size(); ++i)
        {
            vec[i].updatePosVel(dt);
        }
        

        if(vec.size() > 1 && distance(vec[0], vec[1]) < (vec[0].radius + vec[1].radius))
        {
            cout<<"\n\nHOLAAAA\n\n";
             for(int i=0; i<vec.size(); ++i)
            {
                vec[i].getAll();
            }
            cout<<"\n\nHOLAAAA\n\n";
            vec[0].merge(vec[1]);
            vec.erase(vec.begin()+1);
        }

        for(int i=0; i<vec.size(); ++i)
        {
            vec[i].getAll();
        }

        cout<<"\n";
        cin>>r;
    }

   

}
