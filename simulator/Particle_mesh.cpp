int x_max, y_max, delta;
int x_index = 2*x_max/delta;
int y_index = 2*y_max/delta;

double grid[x_index][y_index];

void make_grid(vector<Body> &bodies)
{

double i, j;

    for(vector<Body>::iterator k=bodies.begin(); k<bodies.end()-1; ++k)
    {
        modf((*k).position[0], &i);
        modf((*k).position[1], &j);
        ++grid[i][j];        
    }
}

double error(double** potential, double** grid)
{
    for(int i=0; i<x_index; ++i )
    {
        for(int j=0; j<y_index; ++j)
        {
            
        }
    }

}