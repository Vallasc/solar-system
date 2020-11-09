class Axes {
    public canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;

    constructor( canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.context =  <CanvasRenderingContext2D> canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
    }

    public drawAxes() : void {
        
        let w : number = this.canvas.width;
        let h : number = this.canvas.height;
        let dist_grids : number = 10; //distance between grids
        let i : number;

        this.context.strokeStyle = "rgba(255,0,0,0.5)"; 
        this.context.lineWidth = 2;
        // Draw >  
        this.context.beginPath();
    
        this.context.moveTo(w-15, h*0.5-10);
        this.context.lineTo(w, h*0.5);
        this.context.lineTo(w-15, h*0.5+10);
        this.context.stroke();

        // Draw ^ 
        this.context.beginPath();
        this.context.moveTo(w*0.5-10, 15);
        this.context.lineTo(w*0.5, 0);
        this.context.lineTo(w*0.5+10, 15);
        this.context.stroke();

        // Draw X-axis
        this.context.lineWidth = 1.5;
        this.context.beginPath();
        this.context.moveTo(0, h*0.5);
        this.context.lineTo(w, h*0.5);
        this.context.stroke();

        // Draw Y-axis
        this.context.beginPath();
        this.context.moveTo(w*0.5, 0);
        this.context.lineTo(w*0.5, h);
        this.context.stroke();
        
        // Ticks marks along the positive X-axis
        for(i=1; i<Math.round(w*0.5); i++) {
            this.context.beginPath();
            this.context.lineWidth = 0.7;
            this.context.strokeStyle = "rgba(250,0,0,0.70)";
            
            // Draw a tick mark 5px long (-2 to 2)
            this.context.moveTo(w*0.5+i*dist_grids+0.5, h*0.5-2+0.5);
            this.context.lineTo(w*0.5+i*dist_grids+0.5, h*0.5+2+0.5);
            this.context.stroke();
        
            /*
            // Text value at that point
            ctx.font = '9px Arial';
            ctx.textAlign = 'start';
            ctx.fillText(x_axis_starting_point.number*i + x_axis_starting_point.suffix, dist_grids*i-2, 15);
            */
        }

        // Ticks marks along the negative X-axis
        for(i=Math.round(w*0.5); i>0; i--) {
            this.context.beginPath();
            this.context.lineWidth = 0.7;
            this.context.strokeStyle = "rgba(250,0,0,0.70)";

            // Draw a tick mark 5px long (-2 to 2)
            this.context.moveTo(w*0.5-i*dist_grids+0.5, h*0.5-2+0.5);
            this.context.lineTo(w*0.5-i*dist_grids+0.5, h*0.5+2+0.5);
            this.context.stroke();

            /*
            // Text value at that point
            ctx.font = '9px Arial';
            ctx.textAlign = 'end';
            ctx.fillText(-x_axis_starting_point.number*i + x_axis_starting_point.suffix, -dist_grids*i+2, 15);
            */
        }

        // Ticks marks along the positive Y-axis
        for(i=1; i<Math.round(h*0.5); i++) {
            this.context.beginPath();
            this.context.lineWidth = 0.7;
            this.context.strokeStyle = "rgba(250,0,0,0.70)";

            // Draw a tick mark 5px long (-2 to 2)
            this.context.moveTo(w*0.5-2+0.5, h*0.5-i*dist_grids+0.5);
            this.context.lineTo(w*0.5+2+0.5, h*0.5-i*dist_grids+0.5);
            this.context.stroke();

            /*
            // Text value at that point
            ctx.font = '9px Arial';
            ctx.textAlign = 'start';
            ctx.fillText(-y_axis_starting_point.number*i + y_axis_starting_point.suffix, 8, dist_grids*i+2);
            */
        }

        // Ticks marks along the negative Y-axis
        for(i=Math.round(h*0.5); i>0; i--) {
            this.context.beginPath();
            this.context.lineWidth = 0.7;
            this.context.strokeStyle = "rgba(250,0,0,0.70)";

            // Draw a tick mark 5px long (-2 to 2)
            this.context.moveTo(w*0.5-2+0.5, h*0.5+i*dist_grids+0.5);
            this.context.lineTo(w*0.5+2+0.5, h*0.5+i*dist_grids+0.5);
            this.context.stroke();

            /*
            // Text value at that point
            ctx.font = '9px Arial';
            ctx.textAlign = 'start';
            ctx.fillText(y_axis_starting_point.number*i + y_axis_starting_point.suffix, 8, -dist_grids*i+3);
            */
        }
    }
}