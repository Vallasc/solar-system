#include <iostream>
#include <fstream>
#include <math.h>
#include <stdlib.h>
#include <time.h>
#include <vector>
#include <iomanip>
#include <string>

#include "serializer.h"
#include "body.h"
#include "config.h"
#include "functions.h"

using namespace std;

//#define EULER     // Euler's algorithm of evolution
#define SIMPLETIC     // simpletic algorithm of evolution

#define PERCENTAGE     // loading percentage

using namespace std;

//---------------------------- natural units -----------------------------------------------
double mass_natural = 5.972 * 1E24;     // Earth's mass (natural unit of mass in kg)
double lenght_natural = 1.495978707 * 1E10;     // 1/10 of an astronomical unit (natural unit of mass in m)
double G = 6.674 / (1E11);     // gravitational constant

double time_natural = pow((pow(lenght_natural, 3) / (G * mass_natural)), 0.5);     // natural unit of time in s
double energy_natural = mass_natural * pow((lenght_natural / time_natural), 2);     // natural unit of energy in J
double angular_momentum_natural = energy_natural * time_natural;     // natural unit of angular momentum in kg*m^2/s
double momentum_natural = mass_natural * lenght_natural / time_natural;     // natural unit of momentum in kg*m/s
//------------------------------------------------------------------------------------------

//---------------------------- defining coordinates ----------------------------------------
double rho=300;
double v_max=3;
double theta=0, phi=0, R_module=0, V_module=0;
//------------------------------------------------------------------------------------------

//---------------------------- temperature estimation (declaration) ------------------------
double temp_max;     // maximum temperature
//------------------------------------------------------------------------------------------

//---------------------------- global parameters -------------------------------------------
int N = 1000;     // number of bodies
double t = 0;    // time
double dt = 0.01;    // time interval (fixed)
double t_f = 25;    // final time
double mass_i = 50;     // initial mass of bodies
double radius_i = 1;     // initial radius of bodies (slide with data)
//------------------------------------------------------------------------------------------

//---------------------------- physical quantities --------------------------------------
double ang_mom_tot = 0, E_tot = 0;
double momentum_tot[]{0,0};
double total_energies[]{0, 0, 0, 0, 0};     // 0: E_tot, 1: K_tot, 2: I_tot, 3:U_tot, 4: B_tot

double ang_mom_tot_initial = 0, E_tot_initial = 0;     // initial physical quantities
double momentum_tot_initial[]{0,0};

double err_E = 0, err_ang_mom = 0;     // errors of physical quantities
double err_momentum[]{0,0};
//------------------------------------------------------------------------------------------

//-------------- variables for the computation of the potential (declarations)--------------
int x_grid_max, y_grid_max;     // dimensions of the grid
int delta;     // discretization parameter
int x_index, y_index;     // indexes of the array that represents the grid
double alpha;    // convergence parameter
string grid_file("grid");
string potential_file("potential");
int i = 97; 
char n_file = char(i); 
//------------------------------------------------------------------------------------------

string filename = "generated.sim";     // output file

bool override_input = false;     // web app


int main(){

    Config::make_example("config.txt");
    Config::parse("config.txt");

    //--------- variables for the computation of the potential (initializations) --------------
    x_grid_max = int(rho)+100;     // dimensions of the grid
    y_grid_max = int(rho)+100;
    delta = 5;     // discretization parameter
    x_index = 2*x_grid_max/delta + 1;     // indexes of the array that represents the grid
    y_index = 2*y_grid_max/delta + 1;
    alpha = 1.2;    // convergence parameter
    //------------------------------------------------------------------------------------------

    //------------------ temperature estimation (initialization)  ------------------------------
    temp_max = 0.75 * (0.0288 * N + 13) * mass_i;     // maximum temperature
    //------------------------------------------------------------------------------------------

    //------------------------------------- initial conditions ---------------------------------
    vector<Body> bodies;     // vector of bodies
    double position_i[2];     // initial position and velocity (dummy)
    double velocity_i[2];

    double step = 0;     // number of steps
    int n_iteration = 0;     // number of iterations

    double** grid;
    double** potential;     // 3 grids for the algorithm employed to compute the potential
    double** error;

    Serializer serializer(filename);     // data serialization

    srand(time(NULL));     // random seed

    initial_condition(bodies, position_i, velocity_i);     // set initial condition

    compute_CM(bodies);     // moving to the center of mass frame of reference

    create_pointers(grid, potential, error);     // initialize the pointers previuosly declared

    make_grid(bodies, grid, potential, error);     // filling the 3 pointers with zeros

    for(int k=0; k<1000; ++k) next(potential, grid, error);    // compute the initial potential

    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)    // computing the initial values of the 
    {                                                                    // physical quantities
        if(j != (bodies.end()-1))
        {
            for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k) 
            {
                Body::force_and_potential(*j, *k);
            }
        }

        check_up(*j);    
    }

    std::cout << "Initial state of the system: " << endl;     // writing on std output
    std::cout << "Total angular momentum: " << ang_mom_tot << endl;
    std::cout << "Total energy: " << E_tot << endl;
    std::cout << "Total momentum (along x): " << momentum_tot[0] << endl;
    std::cout << "Total momentum (along y): " << momentum_tot[1] << endl << endl;

    ang_mom_tot_initial = ang_mom_tot;     // intialize the initial physical quantities
    E_tot_initial = E_tot;
    momentum_tot_initial[0] = momentum_tot[0];
    momentum_tot_initial[1] = momentum_tot[1];
    
    serializer.write_init(E_tot, ang_mom_tot, momentum_tot[0], momentum_tot[1], N, mass_i);     // writing the initial physical quantities

    if(E_tot > 0)     // controlling that the energy has a negative value
    {
        std::cout << "WARNING: the energy of the system is positive!" <<endl;
    }

    int response = 1; 
    while(1 && !override_input)
    {
        if(feedback(response))
            break;
    }
    if(!response){
        std::cout<<"Next time will be better :)"<<endl;
        return 0;
    }
    //--------------------------------------------------------------------------------------

    //------------------------------------ evolution ---------------------------------------
    while(1)
    {   
        
        #ifdef  PERCENTAGE
        if(n_iteration % 13 == 0 && !override_input)
        {
            step = t/(t_f+1)*100;
            std::cout << "\r" << step << "%   (N = "<<bodies.size()<<")                  " << flush;
        }
        #endif
        
        collision(bodies);     // treating the collision between bodies   
       
        for(int i=0; i<5; ++i)
            total_energies[i] = 0;
        get_total_energies(bodies);     // computing the energy of the entire system in all its form

        if(n_iteration % int(t_f/(10*dt)) == 0)     // the algorithm to compute the potential
        {
            //make grid
            make_grid(bodies, grid, potential, error);
            
            //iterate potential
            for(int k=0; k<1000; ++k) next(grid, potential, error);
  
            serializer.write_potential(potential, x_index, y_index, t);
        }
        serializer.write_energies(total_energies[0], total_energies[1], total_energies[2], total_energies[3], total_energies[4], t);
        serializer.write_bodies(bodies);     // writing bodies' features and energies on the file

        if (t > (t_f))     // terminate the dynamic
        {   
            --n_iteration;
            break; // when we reach t_f the evolution terminates
            
        }

        #ifdef EULER
        //-------------------------------------- Euler's dynamic -------------------------------
        euler_dynamic(bodies);
        //--------------------------------------------------------------------------------------
        #endif

        #ifdef SIMPLETIC
        //----------------------------------------- Simpletic dynamic --------------------------
        simpletic_dynamic(bodies);
        //--------------------------------------------------------------------------------------
        #endif

        t+=dt;     // the time flows
        ++n_iteration;     // the iterations rise
    
    }
    //--------------------------------------------------------------------------------------
    
    //---------------- checking conservation and comuputing discrepancies ------------------
    ang_mom_tot=0, E_tot=0;
    momentum_tot[0]=0, momentum_tot[1]=0;
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {
        check_up((*j));
    }

    err_E = compute_error(E_tot_initial, E_tot);
    err_ang_mom  = compute_error(ang_mom_tot_initial, ang_mom_tot);
    err_momentum[0] =compute_error(momentum_tot_initial[0], momentum_tot[0]);
    err_momentum[1] = compute_error(momentum_tot_initial[1], momentum_tot[1]);

    std::cout <<' '<< endl <<"COMPLETED                          "<<endl<<endl;     // writing on std output
    std::cout <<"Final state of the system: "<<endl;
    std::cout <<"Total angular momentum: "<<ang_mom_tot<<" (percentual error: "<<err_ang_mom<<"%)"<<endl;
    std::cout<<"Total energy: " << E_tot <<" (percentual error: "<<err_E<<"%)"<<endl;
    std::cout<<"Total momentum (along x): "<<momentum_tot[0]<<endl;
    std::cout<<"Total momentum (along y): "<<momentum_tot[1]<<endl;

    serializer.write_err(err_E, err_ang_mom, err_momentum[0], err_momentum[1]);
    serializer.write_end(E_tot, ang_mom_tot, momentum_tot[0], momentum_tot[1]);     // writing bodies' energies


    // Reset for web_main
    t=0;


}
//--------------------------------------------------------------------------------------

//--------------------------------- web part -------------------------------------------
extern "C"{	
    int web_main(int _N, float _t_f, float _dt, float _rho, float _v_max, float _mass_i, float _radius_i){	
        N = _N;
        t_f = _t_f;
        dt = _dt;
        rho = _rho;
        v_max = _v_max;
        mass_i = _mass_i;
        radius_i = _radius_i;

        override_input = true;	
        return main();	
    }	
}
//--------------------------------------------------------------------------------------

