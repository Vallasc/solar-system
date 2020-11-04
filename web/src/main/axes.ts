class Axes {
    public canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;

    constructor( canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.context =  <CanvasRenderingContext2D> canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
    }

    public drawAxes() : void {

        let grid_size : number = 5; //distance between grids
        let xp : number = this.canvas.height/grid_size*0.5;
        let yp : number = this.canvas.width/grid_size*0.5;
        let x_axis_distance_grid_lines : number = Math.round(xp);
        let y_axis_distance_grid_lines : number = Math.round(yp);
        //let x_axis_starting_point = { number: 1, suffix: '\u03a0' };
        //let y_axis_starting_point = { number: 1, suffix: '' };

        let num_lines_x : number = Math.floor(this.canvas.width/grid_size);
        let num_lines_y : number = Math.floor(this.canvas.height/grid_size);
        let i : number;
        // Draw grid lines along X-axis
        for(i = 0; i<=num_lines_x; i++) {
            this.context.beginPath();
            this.context.lineWidth = 0.3;
            
            // If line represents X-axis draw in different color
            if(i == x_axis_distance_grid_lines) 
                this.context.strokeStyle = "#ffffff"; //x axis
            else
                this.context.strokeStyle = "#242424"; //other horizontal lines
            
            if(i == num_lines_x) {
                this.context.moveTo(0, grid_size*i);
                this.context.lineTo(this.canvas.width, grid_size*i);
            }
            else {
                this.context.moveTo(0, grid_size*i+0.5);
                this.context.lineTo(this.canvas.width, grid_size*i+0.5);
            }
            this.context.stroke();
        }

        // Draw grid lines along Y-axis
        for(i=0; i<=num_lines_y; i++) {
            this.context.beginPath();
            this.context.lineWidth = 0.3;
            
            // If line represents X-axis draw in different color
            if(i == y_axis_distance_grid_lines) 
                this.context.strokeStyle = "#ffffff"; //y axis
            else
                this.context.strokeStyle = "#242424"; //other vertical lines
            
            if(i == num_lines_y) {
                this.context.moveTo(grid_size*i, 0);
                this.context.lineTo(grid_size*i, this.canvas.height);
            }
            else {
                this.context.moveTo(grid_size*i+0.5, 0);
                this.context.lineTo(grid_size*i+0.5, this.canvas.height);
            }
            this.context.stroke();
        }

        this.context.translate(y_axis_distance_grid_lines*grid_size, x_axis_distance_grid_lines*grid_size);
        
        // Ticks marks along the positive X-axis
        for(i=1; i<(num_lines_y - y_axis_distance_grid_lines); i++) {
            this.context.beginPath();
            this.context.lineWidth = 1;
            this.context.strokeStyle = "#ffffff";
            
            // Draw a tick mark 6px long (-3 to 3)
            this.context.moveTo(grid_size*i+0.5, -3);
            this.context.lineTo(grid_size*i+0.5, 3);
            this.context.stroke();
        
            /*
            // Text value at that point
            ctx.font = '9px Arial';
            ctx.textAlign = 'start';
            ctx.fillText(x_axis_starting_point.number*i + x_axis_starting_point.suffix, grid_size*i-2, 15);
            */
        }

        // Ticks marks along the negative X-axis
        for(i=1; i<y_axis_distance_grid_lines; i++) {
            this.context.beginPath();
            this.context.lineWidth = 1;
            this.context.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            this.context.moveTo(-grid_size*i+0.5, -3);
            this.context.lineTo(-grid_size*i+0.5, 3);
            this.context.stroke();

            /*
            // Text value at that point
            ctx.font = '9px Arial';
            ctx.textAlign = 'end';
            ctx.fillText(-x_axis_starting_point.number*i + x_axis_starting_point.suffix, -grid_size*i+3, 15);
            */
        }

        // Ticks marks along the positive Y-axis
        // Positive Y-axis of graph is negative Y-axis of the canvas
        for(i=1; i<(num_lines_x - x_axis_distance_grid_lines); i++) {
            this.context.beginPath();
            this.context.lineWidth = 1;
            this.context.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            this.context.moveTo(-3, grid_size*i+0.5);
            this.context.lineTo(3, grid_size*i+0.5);
            this.context.stroke();

            /*
            // Text value at that point
            ctx.font = '9px Arial';
            ctx.textAlign = 'start';
            ctx.fillText(-y_axis_starting_point.number*i + y_axis_starting_point.suffix, 8, grid_size*i+3);
            */
        }

        // Ticks marks along the negative Y-axis
        // Negative Y-axis of graph is positive Y-axis of the canvas
        for(i=1; i<x_axis_distance_grid_lines; i++) {
            this.context.beginPath();
            this.context.lineWidth = 1;
            this.context.strokeStyle = "#ffffff";

            // Draw a tick mark 6px long (-3 to 3)
            this.context.moveTo(-3, -grid_size*i+0.5);
            this.context.lineTo(3, -grid_size*i+0.5);
            this.context.stroke();

            /*
            // Text value at that point
            ctx.font = '9px Arial';
            ctx.textAlign = 'start';
            ctx.fillText(y_axis_starting_point.number*i + y_axis_starting_point.suffix, 8, -grid_size*i+3);
            */
        }
    }
}