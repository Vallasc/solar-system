#include <string>

#ifndef FUNCTIONS_H    // To make sure you don't declare the function more than once by including the header multiple times.
#define FUNCTIONS_H


//#define CARTESIAN
#define POLAR

#ifdef CARTESIAN    // cartesian coordinates
extern double x_min, x_max, v_min, v_max;
#endif

#ifdef POLAR    // polar coordinates
extern double rho, v_max, theta, phi, R_module, V_module;
#endif


//------------------------------------ extern parameters ----------------------------------
extern int N; 
extern double mass_i, radius_i, dt;
extern double ang_mom_tot, E_tot, total_energies[5], momentum_tot[2];
extern int x_grid_max, y_grid_max, delta, x_index, y_index;
extern double alpha; 
extern string filename ; 
//------------------------------------------------------------------------------------------


//------------------------------------ declaring the functions -----------------------------
double uniform_generator(double x_min_, double x_max_);

double uniform_generator_polar(double x_min_, double x_max_);

void compute_CM(vector<Body> &bodies);

void check_up(Body &j);

double compute_error(double initial, double final);

void initial_condition(vector<Body> &bodies, double* position_i, double* velocity_i);

void collision(vector<Body> &bodies);

void euler_dynamic(vector<Body> &bodies);

void simpletic_dynamic(vector<Body> &bodies);

int feedback(int &response);

void get_total_energies(vector<Body> &bodies);
 
void create_pointers(double** &grid, double** &potential, double** &error);

void make_grid(vector<Body> &bodies, double** &grid, double** &potential, double** &error);

void next( double** &grid, double** &potential, double** &error);
//------------------------------------------------------------------------------------------


#endif
