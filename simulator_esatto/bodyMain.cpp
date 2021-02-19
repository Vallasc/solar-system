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
//#define POLAR_VORTEX

//#define EULER             //evolution
#define SIMPLETIC

#define PERCENTAGE          //loading
//#define LOADING_BAR

using namespace std;

//----------------------------defining coordinates---------------------------------------
#ifdef CARTESIAN
//cartesian coordinates
double x_min=0, x_max=500; // lower and upper limit for positions and velocities
double v_min=0, v_max=0.5;
#endif

#ifdef POLAR
//polar coordinates
double rho=40;
double v_max=0;
double theta=0, phi=0, R_module=0, V_module=0;
#endif

#ifdef POLAR_VORTEX
//polar coordinates with dependent rotation
double rho=300;
double theta=0, R_module=0;
#endif
//-----------------------------------------------------------------

//------------------------------- global parameters ----------------------------

int N = 2; // number of bodies
double t = 0; // time
double dt = 0.01; // time interval
double t_f = 100; // final time
double mass_i = 100;
double radius_i = 1;

//------------------Temperature estimation----------------------------
double Temp_max = 0.75*(0.0288*N+13)*mass_i;
//--------------------------------------------------------------------
//-----------------Elastic Parameters---------------------------------
double k_elastic = 1e-3;
double limit_radius = 20;
//--------------------------------------------------------------------

//--------------------conservation parameters--------------------
double ang_mom_tot=0, E_tot=0;
double total_energies[]{0, 0, 0, 0, 0}; // 0: E_tot, 1: K_tot, 2: I_tot, 3:U_tot, 4: B_tot
double momentum_tot[]{0,0};
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

    //writing files
    /*ofstream of(grid_file+n_file+".txt");
    for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j) 
    {
        if(j!=0 || i!=0){
        if(j % 201 == 0)
        of << endl;}
        
        of << grid[i][j] << ' ';
    }
    
    of.close();
    
    of.open(potential_file+n_file+".txt");
    for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j) 
    {
        if(j!=0 || i!=0){
        if(j % 201 == 0)
        of << endl;}
        
        of << potential[i][j] << '?';
    }
    of.close();
    */


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

    ofstream off("test.txt");


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

        #ifdef LOADING_BAR      
        if(n_iteration % 200 == 0)
        {
            step=t/(t_f)*100;
            loading_bar(step);
        }
        #endif 
        
        collision(bodies);

        for(int i=0; i<5; ++i)
        total_energies[i] = 0;
        get_total_energies(bodies);

        off<<bodies.capacity()<<"\t"<<total_energies[0]<<"\t"<<Body::distance(bodies[0], bodies[1])<< "\t"<<pow((pow(bodies[0].acceleration[0], 2) + pow(bodies[0].acceleration[1],2)),0.5)<<"\t" <<total_energies[1] << "\t" << total_energies[3] << "\n";

        
        if(n_iteration%1000 == 0)
        {
            //number of files
            //++i; 
            //n_file = char(i); 

            //make grid
            make_grid(bodies, grid, potential, error);

            //iterate potential
            for(int k=0; k<1000; ++k) next(grid, potential, error);
            /*
            //writing files
            of.open(grid_file+n_file+".txt");
            for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j) 
            {
                if(j!=0 || i!=0){
                if(j % 201 == 0)
                of << endl;}
        
                of << grid[i][j] << ' ';
            }
    
            of.close();

            of.open(potential_file+n_file+".txt");
            of << setprecision(8);
            for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j) 
            {
                if(j!=0 || i!=0){
                if(j % 201 == 0)
                of << endl;}
        
                of << potential[i][j] << '?';
            }

            of.close();
            */
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

    std::cout << ' ' << endl << "COMPLETED                          "<<endl<<endl;
    std::cout << "Final state of the system: "<<endl;
    std::cout << "Total angular momentum: "<<ang_mom_tot<<endl;
    std::cout<<"Total energy: " << E_tot <<endl;
    std::cout<<"Total momentum (along x): "<<momentum_tot[0]<<endl;
    std::cout<<"Total momentum (along y): "<<momentum_tot[1]<<endl<<endl;

    serializer.write_end(E_tot, ang_mom_tot, momentum_tot[0], momentum_tot[1]);

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

extern "C"{	
    int web_main(){	
        override_input = true;	
        return main();	
    }	
}

