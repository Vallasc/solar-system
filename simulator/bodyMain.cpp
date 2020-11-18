#include <iostream>
#include <fstream>
#include <math.h>
#include <stdlib.h>
#include <time.h>
#include <vector>
#include <iomanip>

#include "serializer.h"
#include "body.h"
#include "functions.h"

#define POLAR               // coordinates
//#define CARTESIAN
//#define POLAR_VORTEX

//#define EULER             //evolution
#define SIMPLETIC

#define PERCENTAGE          //loading
//#define LOADING_BAR

using namespace std;

//----------------------------defining coordinates---------------------------------------
#ifdef CARTESIAN
//cartesian coordinates
double x_min=0, x_max=1000; // lower and upper limit for positions and velocities
double v_min=0, v_max=0.5;
#endif

#ifdef POLAR
//polar coordinates
double rho=300;
double v_max=2;
double theta=0, phi=0, R_module=0, V_module=0;
#endif

#ifdef POLAR_VORTEX
//polar coordinates with dependent rotation
double rho=300;
double theta=0, R_module=0;
#endif
//-----------------------------------------------------------------

//--------------------------- scaling magnitudes ----------------------------
extern long long int L; // Earth-Sun distance
extern long double G; // gravitational constant
extern long double M; // Earth's mass

extern long double T; 
extern long double F; 
extern long double V; 
extern long double A;
extern long double E;
extern long double P;
extern long double M_A;

//------------------------------- global parameters ----------------------------

int N = 100; // number of bodies
double t = 0; // time
double dt = 0.01; // time interval
double t_f = 200; // final time
double mass_i = 100;
double radius_i = 1;

//------------------Temperature estimation----------------------------
double Temp_max=0.75*(0.0288*N+13)*mass_i;
//-------------------------------------------

//--------------------conservation parameters--------------------
double ang_mom_tot=0, E_tot=0;
double total_energies[]{0, 0, 0, 0, 0, 0}; // 0: E_tot, 1: K_tot, 2: I_tot, 3:U_tot, 4: B_tot
double momentum_tot[]{0,0};
//--------------------------------------------------------------

//--------------------grid variables---------------------------
int x_grid_max = 500; 
int y_grid_max = 500;
int delta = 5;//discretization parameter
int x_index = 2*x_grid_max/delta + 1;
int y_index = 2*y_grid_max/delta + 1;
double alpha = 1.2; //convergence parameter
//-----------------------------------------------------------

//file name
string filename = "prova2"; // Do not specify the extension

//web app
bool override_input = false;


int main(){

    //------------------------------------- start line ----------------------------------
    vector<Body> bodies; // bodies vector
    double position_i[2]; // variables with starting values
    double velocity_i[2];
    double step = 0;
    int n_iteration = 0;

    //grid
    double** grid;
    double** potential;
    double** error;

    //random seed
    srand(time(NULL)); 

    //set initial condition
    initial_condition(bodies, position_i, velocity_i);

    //compute position and velocity of the center of mass and lock the reference
    compute_CM(bodies);

    /*
    for(vector<Body>::iterator k=bodies.begin(); k<bodies.end(); ++k)
    {cout << "x: " << (*k).position[0] << '\n' << flush
         << "y: " << (*k).position[1] << endl;}
    */

    //create pointers
    create_pointers(grid, potential, error);

    //make grid
    make_grid(bodies, grid);

    //initial potential
    for(int k=0; k<1000; ++k) next(potential, grid, error);

    /*
    ofstream of("grid_inizio.txt");
    for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j) 
    {
        if(j!=0 || i!=0){
        if(j % 201 == 0)
        of << endl;}
        
        of << grid[i][j] << ' ';
    }
    
    of.close()
    
    of.open("potential_inizio.txt");
    for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j) 
    {
        if(j!=0 || i!=0){
        if(j % 201 == 0)
        of << endl;}
        
        of << potential[i][j] << '?';
    }
    of.close()
    */


    //initial conservatives parameters
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {
        if(j != bodies.end()-1)
        {
            for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k) 
            {
                Body::force_and_potential(*j, *k);
            }
        }

        check_up(*j);    
    }

    cout<<"Initial state of the system: "<<endl;
    cout<<"Total angular momentum: "<<ang_mom_tot<<endl;
    cout<<"Total energy: " << E_tot<<endl;
    cout<<"Total momentum (along x): "<<momentum_tot[0]<<endl;
    cout<<"Total momentum (along y): "<<momentum_tot[1]<<endl<<endl;

    if(E_tot > 0)
    {
        cout<<"WARNING: the energy of the system is positive!"<<endl;
    }

    int response = 1; 
    while(1 && !override_input)
    {
        if(feedback(response))
            break;
    }
    if(!response){
        cout<<"Next time will be better :)"<<endl;
        return 0;
    }

    Serializer serializer(filename); //writing data on file

    //------------------------------------ evolution ------------------------------
    
    while(1)
    {   
        
        #ifdef  PERCENTAGE
        if(n_iteration % 13 == 0)
        {
            step=t/(t_f+1)*100;
            cout<<"\r"<< step<<"%   (N = "<<bodies.size()<<")                  "<<flush;
        }
        #endif

        #ifdef LOADING_BAR      
        if(n_iteration % 200 == 0)
        {
            step=t/(t_f)*100;
            loading_bar(step);
        }
        #endif 

        collision(bodies);

        
        if(n_iteration % 200 == 0)
        {
            compute_CM(bodies);
        }
        
        
        if(n_iteration % 30 == 0) //tanto prendiamo l'enrgia ogni 30 frames
        {
        for(int i=0; i<5; ++i)
        total_energies[i] = 0;
        get_total_energies(bodies);
        }
        
        //get_total_energies(bodies);

        serializer.write(t, bodies, total_energies[0], total_energies[1], total_energies[2], total_energies[3], total_energies[4]);

        //for(int i=0; i<5; ++i)
        //total_energies[i] = 0;

        if (t > (t_f)) 
        {   
            --n_iteration;
            break; // when we reach t_f the evolution terminates
            
        }

    #ifdef EULER
    //-------------------------------------- Euler dynamic ----------------------------------------
    euler_dynamic(bodies);
    //----------------------------------------------------------------------------------------------
    #endif

    #ifdef SIMPLETIC
    //----------------------------------------- Simpletic dynamic ------------------------------------
    simpletic_dynamic(bodies);
    //-----------------------------------------------------------------------------------------------------
    #endif

        t+=dt; // the time flows
        ++n_iteration; //the iterations rise
    
    }

    //checking conservation
    ang_mom_tot=0, E_tot=0;
    momentum_tot[0]=0, momentum_tot[1]=0;
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {
        check_up((*j));
    }

    cout << ' ' << endl << "COMPLETED                          "<<endl<<endl;
    cout << "Final state of the system: "<<endl;
    cout << "Total angular momentum: "<<ang_mom_tot<<endl;
    cout<<"Total energy: " << E_tot <<endl;
    cout<<"Total momentum (along x): "<<momentum_tot[0]<<endl;
    cout<<"Total momentum (along y): "<<momentum_tot[1]<<endl<<endl;


    //make grid
    //make_grid(bodies);

    //initial potential
    //for(int k=0; k<1000; ++k) next(potential, grid);
        
    /*
    ofstream of("potential_fine.txt");
    of << setprecision(8);
    for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j) 
    {
        if(j!=0 || i!=0){
        if(j % 201 == 0)
        of << endl;}
        
        of << potential[i][j] << '?';
    }

    of.close();
    

    of.open("grid_fine.txt");
    for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j) 
    {
        if(j!=0 || i!=0){
        if(j % 201 == 0)
        of << endl;}
        
        of << grid[i][j] << ' ';
    }
    
    of.close();
    */

}

