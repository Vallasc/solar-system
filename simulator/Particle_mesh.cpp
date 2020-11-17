int x_max, y_max, delta;
int x_index = 2*x_max/delta;
int y_index = 2*y_max/delta;
double alpha;
double grid[x_index][y_index];
double potential[x_index][y_index];

for(int i=0; i<x_index; ++i) for(int j=0; j<y_index; ++j){grid[i][j]=0; potential[i][j]=0;}

double error[x_index][y_index];

void make_grid(vector<Body> &bodies)
{

double i, j;

    for(vector<Body>::iterator k=bodies.begin(); k<bodies.end(); ++k)
    {
        modf((*k).position[0], &i);
        modf((*k).position[1], &j);
        ++grid[i][j];        
    }
}

double next(double** potential, double** grid)
{
    for(int i=1; i<x_index; ++i ) for(int j=1; j<y_index; ++j)
    {
    error[i][j] = potential[i][j]-(potential[i+1][j] + potential[i-1][j] + potential[i][j+1] + potential[i][j-1] - grid[i][j]*delta*delta)/4;
    potential[i][j] = potential[i][j] - alpha*error[i][j]
    }
}