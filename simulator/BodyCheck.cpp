#include <iostream>
#include <math.h>
#include <vector>

#include "Body.h"
#include "Serializer.h"

using namespace std;

int main(){

    int dt=1, NBodies=2, NTiming=1;
    int r=1;

    vector<Body> vec;
    double position0[]{-5,0}, position1[]{5,0}, velocity0[]{0,0}, velocity1[]{0,0};
    double mass0=5, mass1=5, radius0=1, radius1=2;

    vec.push_back(Body(position0, velocity0, radius0, mass0));
    vec.push_back(Body(position1, velocity1, radius1, mass1));

    Serializer serializer("simulator/prova.json");
    serializer.write(0, vec);

    vec[0].print();
    vec[1].print();
    cout<<"\n";

    //for(int i=0; i<NTiming; ++i){
    while(r){
      
        if(vec.size() > 1)
        {
            Body::force(vec[0], vec[1]);
        }

        for(int i=0; i<vec.size(); ++i)
        {
            vec[i].update_pos_vel(dt);
        }
        

        if(vec.size() > 1 && Body::distance(vec[0], vec[1]) < (vec[0].radius + vec[1].radius))
        {
            cout<<"\n\nHOLAAAA\n\n";
             for(int i=0; i<vec.size(); ++i)
            {
                vec[i].print();
            }
            cout<<"\n\nHOLAAAA\n\n";
            vec[0].merge(vec[1]);
            vec.erase(vec.begin()+1);
        }

        for(int i=0; i<vec.size(); ++i)
        {
            vec[i].print();
        }

        cout<<"\n";
        cin>>r;
    }

   

}
