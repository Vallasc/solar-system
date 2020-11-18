#include <iostream>
#include <fstream>
#include <math.h>
#include <stdlib.h>
#include <time.h>
#include <vector>
#include <iomanip>

#include "serializer.h"
#include "body.h"

#define POLAR               // coordinates
//#define CARTESIAN
//#define POLAR_VORTEX

//#define EULER             //evolution
#define SIMPLETIC

#define PERCENTAGE          //loading
//#define LOADING_BAR

using namespace std;

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

int N = 500; // number of bodies
double t = 0; // time
double dt = 0.01; // time interval
double t_f = 200; // final time
double mass_i = 100;
double radius_i = 1;

//----------------------------------------------
double Temp_max=0.75*(0.0288*N+13)*mass_i;
//-------------------------------------------

double ang_mom_tot=0, E_tot=0;
double total_energies[]{0, 0, 0, 0, 0, 0}; // 0: E_tot, 1: K_tot, 2: I_tot, 3:U_tot, 4: B_tot
double momentum_tot[]{0,0};

bool override_input = false;

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

string filename = "sim"; // Do not specify the extension

double uniform_generator(double x_min_, double x_max_)
{
    double r = ((double)(rand())) / RAND_MAX;
    return x_min_ + r * (x_max_ - x_min_);
}

double uniform_generator_polar(double x_min_, double x_max_)
{
    double r = ((double)(rand())) / RAND_MAX;
    return x_min_ + pow(r,0.5) * (x_max_ - x_min_);
}

void compute_CM(vector<Body> &bodies)
{
    double position_CM[]{0,0}; //position center of mass
    double velocity_CM[]{0,0}; //velocity center of mass
    double total_mass=0; //total mass of the system

    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {    
        total_mass += (*j).mass;
        position_CM[0] += (*j).mass * ((*j).position[0]);
        position_CM[1] += (*j).mass * ((*j).position[1]);
        velocity_CM[0] += (*j).mass * ((*j).velocity[0]);
        velocity_CM[1] += (*j).mass * ((*j).velocity[1]);
         
    }
    position_CM[0] = position_CM[0]/total_mass;
    position_CM[1] = position_CM[1]/total_mass;
    velocity_CM[0] = velocity_CM[0]/total_mass;
    velocity_CM[1] = velocity_CM[1]/total_mass;

    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {    
        (*j).position[0] -= position_CM[0];
        (*j).position[1] -= position_CM[1];
        (*j).velocity[0] -= velocity_CM[0];
        (*j).velocity[1] -= velocity_CM[1];
         
    }
}

void initial_condition(vector<Body> &bodies, double* position_i, double* velocity_i)
{
    for(int j=0; j<N; j++)
    { 
        #ifdef CARTESIAN
        position_i[0] = uniform_generator(x_min, x_max);
        position_i[1] = uniform_generator(x_min, x_max);
        velocity_i[0] = uniform_generator(v_min, v_max);
        velocity_i[1] = uniform_generator(v_min, v_max);
        #endif

        #ifdef POLAR
        theta = uniform_generator(0, 2*M_PI);
        phi = uniform_generator(0, 2*M_PI);
        R_module = uniform_generator_polar(0,rho);
        V_module = uniform_generator_polar(0, v_max);
        position_i[0] = R_module*cos(theta);
        position_i[1] = R_module*sin(theta);
        velocity_i[0] = V_module*cos(phi);
        velocity_i[1] = V_module*sin(phi);
        #endif
       
        #ifdef POLAR_VORTEX
        theta = uniform_generator(0, 2*M_PI);
        R_module = uniform_generator_polar(0, rho);
        position_i[0] = R_module*cos(theta);
        position_i[1] = R_module*sin(theta);
        velocity_i[0] = -(1/10)*(300-R_module)*sin(theta);
        velocity_i[1] = (1/10)*(300-R_module)*cos(theta);
        #endif

        bodies.push_back(Body(j, position_i, velocity_i, radius_i, mass_i));
    }


}

void check_up(Body &j)
{
    ang_mom_tot += j.get_orbital_momentum() + j.spin;
    momentum_tot[0] += j.get_x_momentum();
    momentum_tot[1] += j.get_y_momentum();
    E_tot += (j.get_kinetic_energy() + j.internal_energy + 0.5*j.potential_energy + j.binding_energy);

}

void collision(vector<Body> &bodies)
{
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j)
    {
        for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k)
        {             
            // computing the distance of each couple of bodies: if this distance is minor than the sum of 
            // their radius, we merge them
            if(Body::distance(*j, *k) < ((*j).radius + (*k).radius))
            {
                if((*j).radius > (*k).radius)
                {
                   (*j).merge(*k);
                    bodies.erase(k); 
                }
                else
                {
                    (*k).merge(*j);
                    bodies.erase(j);
                }
                
            }
        }
    }

    bodies.shrink_to_fit();

}

void euler_dynamic(vector<Body> &bodies)
{
    //reset potential energy
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {
        (*j).potential_energy = 0;
    }

    //compute force and potential energy
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end()-1; ++j)
    {   
        for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k){
            Body::force_and_potential(*j, *k);
        }
    }
    
    // evolving the position and the velocity of each particle in dt
    for(vector<Body>::iterator i=bodies.begin(); i<bodies.end(); ++i) 
    {
        (*i).update_pos_vel(dt); 
    }
}

void simpletic_dynamic(vector<Body> &bodies)
{
        for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j) 
    {
        (*j).update_position(dt/2);
        (*j).potential_energy = 0;
        (*j).acceleration[0] = 0;
        (*j).acceleration[1] = 0;
    }
        
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {
        if(j != bodies.end()-1)
        {
            for(vector<Body>::iterator k=j+1; k<bodies.end(); ++k) 
            {
                Body::force_and_potential(*j, *k);
            }
        }

        (*j).update_velocity(dt);
        (*j).update_position(dt/2);
            
    }

}

int feedback(int &response)
{
    string answer;

    std::cout << "Do you want to start the computation? (\"YES\", \"NO\")"<<endl;
    std::cout<<"Answer: ";
    cin>>answer;
    if(answer == "YES" || answer == "yes" || answer == "Yes" || answer == "y" || answer == "Y")
    {
        response = 1;
        return 1;
    }
    else if(answer == "NO" || answer =="no" || answer == "No" || answer == "n" || answer == "N")
    {
        response = 0;
        return 1;
    }
    else
    {
        std::cout<<"\nINPUT ERROR. PLEASE RETRY.\n";
        return 0;
    }
    
}

void get_total_energies(vector<Body> &bodies)
{
    for(vector<Body>::iterator j=bodies.begin(); j<bodies.end(); ++j)
    {
        total_energies[1] += (*j).get_kinetic_energy();
        total_energies[2] += (*j).internal_energy;
        total_energies[3] += 0.5*(*j).potential_energy;
        total_energies[4] += (*j).binding_energy;
    }
total_energies[0] += (total_energies[1] + total_energies[2] + total_energies[3] + total_energies[4]);
}
 
void loading_bar(double step)
{
    int n = int(step/10);
    std::cout << "\r" << "??" << ' ' <<flush;
    for(int i=0; i<n; ++i)
    std::cout <<  '|' << ' ' << flush; 
    for(int i=0; i<10-n; ++i)
    {
        if(i==0) std::cout << ' ' << flush;
        std::cout << ' ' << ' ' << flush;
    }
    std::cout << "??" << ' ' << flush;

   }


int x_max = 500; 
int y_max = 500;
int delta = 5;
int x_index = 2*x_max/delta + 1;
int y_index = 2*y_max/delta + 1;
double alpha = 1.2;

double** grid;
double** potential;
double** error;

void create_pointers()
{
    grid = new double*[x_index];
    potential = new double*[x_index];
    error = new double*[x_index];

     for(int i=0; i<x_index; ++i) 
    {
        grid[i] = new double[y_index]; 
        potential[i] = new double[y_index];
        error[i] = new double[y_index];
    }

    for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j) 
    {grid[i][j]=0; potential[i][j]=0;}

}

void make_grid(vector<Body> &bodies)
{

int i, j;

    for(vector<Body>::iterator k=bodies.begin(); k<bodies.end(); ++k)
    {
        //modf((*k).position[0], &i);
        //modf((*k).position[1], &j);
        i = int((*k).position[0]);
        j = int((*k).position[1]);
        i+=500;
        j+=500;
        i = i/delta;
        j = j/delta;
        if(i<x_index && j<y_index) grid[i][j] += (*k).mass/mass_i;        
    }
}

void next(double** &potential, double** &grid)
{
    for(int i=1; i<x_index-1; ++i ) for(int j=1; j<y_index-1; ++j)
    {
    error[i][j] = potential[i][j]-(potential[i+1][j] + potential[i-1][j] + potential[i][j+1] + potential[i][j-1] - grid[i][j]*delta*delta)/4;
    potential[i][j] = potential[i][j] - alpha*error[i][j];
    }
}

int main(){

    //------------------------------------- start line ----------------------------------
    vector<Body> bodies; // bodies vector
    double position_i[2]; // variables with starting values
    double velocity_i[2];
    double step = 0;
    int n_iteration = 0;

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
    create_pointers();

    //make grid
    //make_grid(bodies);

    //initial potential
    //for(int k=0; k<1000; ++k) next(potential, grid);

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
    make_grid(bodies);

    //initial potential
    for(int k=0; k<1000; ++k) next(potential, grid);
        
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
