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
#include "functions.h"

using namespace std;

//#define CARTESIAN           // coordinates
#define POLAR  

//#define EULER             //evolution
#define SIMPLETIC

#define PERCENTAGE          //loading

using namespace std;

//----------------------------natural units-------------------------
double mass_natural = 5.972 * 1E24; //mass of Earth in Kg
double lenght_natural = 1.495978707 * 1E10; //1/10 astronomical unit
double G = 6.674 / (1E11); //gravitational constant

double time_natural = pow((pow(lenght_natural, 3) / (G * mass_natural)), 0.5);
double energy_natural = mass_natural * pow((lenght_natural / time_natural), 2);
double angular_momentum_natural = energy_natural * time_natural;
double momentum_natural = mass_natural * lenght_natural / time_natural;


//----------------------------defining coordinates---------------------------------------
#ifdef CARTESIAN
//cartesian coordinates
double x_min=0, x_max=500; // lower and upper limit for positions and velocities
double v_min=0, v_max=0.5;
#endif

#ifdef POLAR
//polar coordinates
double rho=200;
double v_max=3;
double theta=0, phi=0, R_module=0, V_module=0;
#endif
//-----------------------------------------------------------------

//------------------------------- global parameters ----------------------------

int N = 300; // number of bodies
double t = 0; // time
double dt = 0.01; // time interval //////fisso
double t_f = 100; // final time
double mass_i = 100;
double radius_i = 1;  ////slide con dati

//------------------Temperature estimation----------------------------
double temp_max = 0.75 * (0.0288 * N + 13) * mass_i;
//--------------------------------------------------------------------

//-----------------Elastic Parameters---------------------------------
double k_elastic = 1e-3;
double limit_radius = 20;
//--------------------------------------------------------------------

//--------------------conservation parameters--------------------
double ang_mom_tot = 0, E_tot = 0;
double momentum_tot[]{0,0};
double total_energies[]{0, 0, 0, 0, 0}; // 0: E_tot, 1: K_tot, 2: I_tot, 3:U_tot, 4: B_tot

double ang_mom_tot_initial = 0, E_tot_initial = 0;
double momentum_tot_initial[]{0,0};

double err_E = 0, err_ang_mom = 0;
double err_momentum[]{0,0};
//--------------------------------------------------------------

//--------------------grid variables---------------------------
int x_grid_max = 500; 
int y_grid_max = 500;
int delta = 5;//discretization parameter
int x_index = 2*x_grid_max/delta + 1;
int y_index = 2*y_grid_max/delta + 1;
double alpha = 1.2; //convergence parameter
string grid_file("grid");
string potential_file("potential");
int i = 97; 
char n_file = char(i); 
//-----------------------------------------------------------

//file name
string filename = "generated/prova"; // Do not specify the extension

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

    Serializer serializer(filename); //writing data on file

    //random seed
    srand(time(NULL)); 

    //set initial condition
    initial_condition(bodies, position_i, velocity_i);

    //compute position and velocity of the center of mass and lock the reference
    compute_CM(bodies);

    //create pointers
    create_pointers(grid, potential, error);

    //make grid
    make_grid(bodies, grid, potential, error);

    //iterate potential
    for(int k=0; k<1000; ++k) next(potential, grid, error);

    //initial conservatives parameters
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {
        if(j != (bodies.end()-1))
        {
            for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k) 
            {
                Body::force_and_potential(*j, *k);
            }
        }

        check_up(*j);    
    }

    std::cout<<"Initial state of the system: "<<endl;
    std::cout<<"Total angular momentum: "<<ang_mom_tot<<endl;
    std::cout<<"Total energy: " << E_tot<<endl;
    std::cout<<"Total momentum (along x): "<<momentum_tot[0]<<endl;
    std::cout<<"Total momentum (along y): "<<momentum_tot[1]<<endl<<endl;
    //fixing initial parameters
    ang_mom_tot_initial = ang_mom_tot;
    E_tot_initial = E_tot;
    momentum_tot_initial[0] = momentum_tot[0];
    momentum_tot_initial[1] = momentum_tot[1];
    //writing initial parameters
    serializer.write_init(E_tot, ang_mom_tot, momentum_tot[0], momentum_tot[1]);

    if(E_tot > 0)
    {
        std::cout<<"WARNING: the energy of the system is positive!"<<endl;
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

    //------------------------------------ evolution ------------------------------
    
    while(1)
    {   

        #ifdef  PERCENTAGE
        if(n_iteration % 13 == 0)
        {
            step=t/(t_f+1)*100;
            std::cout<<"\r"<< step<<"%   (N = "<<bodies.size()<<")                  "<<flush;
        }
        #endif
        
        collision(bodies);

        for(int i=0; i<5; ++i)
        total_energies[i] = 0;
        get_total_energies(bodies);
        
        if(n_iteration % 1000 == 0)
        {
            //make grid
            make_grid(bodies, grid, potential, error);

            //iterate potential
            for(int k=0; k<1000; ++k) next(grid, potential, error);
            
            serializer.write_potential(potential, x_index, y_index);
        }
        serializer.write_energies(total_energies[0], total_energies[1], total_energies[2], total_energies[3], total_energies[4]);
        serializer.write_bodies(bodies);

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

    //computing errors
    err_E = compute_error(E_tot_initial, E_tot);
    err_ang_mom  = compute_error(ang_mom_tot_initial, ang_mom_tot);
    err_momentum[0] =compute_error(momentum_tot_initial[0], momentum_tot[0]);
    err_momentum[1] = compute_error(momentum_tot_initial[1], momentum_tot[1]);

    std::cout <<' '<<endl<<"COMPLETED                          "<<endl<<endl;
    std::cout <<"Final state of the system: "<<endl;
    std::cout <<"Total angular momentum: "<<ang_mom_tot<<" (relative error: "<<err_ang_mom<<")"<<endl;
    std::cout<<"Total energy: " << E_tot <<" (relative error: "<<err_E<<")"<<endl;
    std::cout<<"Total momentum (along x): "<<momentum_tot[0]<<" (relative error: "<<err_momentum[0]<<")"<<endl;
    std::cout<<"Total momentum (along y): "<<momentum_tot[1]<<" (relative error: "<<err_momentum[1]<<")"<<endl;

    serializer.write_end(E_tot, ang_mom_tot, momentum_tot[0], momentum_tot[1]);


}

extern "C"{	
    int web_main(){	
        override_input = true;	
        return main();	
    }	
}

