class Axes {
    public canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;

    private panningOffsetX: number = 0;
    private panningOffsetY: number = 0;

    constructor( canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.context =  <CanvasRenderingContext2D> canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
    }

    public drawAxes() : void {
        
        let w : number = this.canvas.width;
        let h : number = this.canvas.height;
        let dist_grids : number = 10; //distance between grids
        let offX : number = 0;
        let offY : number = 0;

        let margin : number = 20;

        if(this.panningOffsetX >= (w*0.5) - margin )
            offX = (w*0.5) - margin;
        else if(this.panningOffsetX <=  margin - (w*0.5))
            offX =  margin - (w*0.5);
        else
            offX = this.panningOffsetX;

        if(this.panningOffsetY >= (h*0.5) - margin )
            offY = (h*0.5) - margin;
        else if(this.panningOffsetY <=  margin - (h*0.5))
            offY =  margin - (h*0.5);
        else
            offY = this.panningOffsetY;
            
        this.context.clearRect(0, 0, w, h);

        this.context.strokeStyle = "rgba(255,0,0,0.5)"; 
        this.context.lineWidth = 2;
        // Draw >  
        this.context.beginPath();
    
        this.context.moveTo( w - 15, offY + h*0.5 - 10);
        this.context.lineTo( w, offY + h*0.5);
        this.context.lineTo( w - 15, offY + h*0.5 + 10);
        this.context.stroke();

        // Draw ^ 
        this.context.beginPath();
        this.context.moveTo(offX + w*0.5 - 10, 15);
        this.context.lineTo(offX + w*0.5, 0);
        this.context.lineTo(offX + w*0.5 + 10, 15);
        this.context.stroke();

        // Draw X-axis
        this.context.lineWidth = 1.5;
        this.context.beginPath();
        this.context.moveTo(0, offY + h*0.5);
        this.context.lineTo(w, offY + h*0.5);
        this.context.stroke();

        // Draw Y-axis
        this.context.beginPath();
        this.context.moveTo(offX + w*0.5, 0);
        this.context.lineTo(offX + w*0.5, h);
        this.context.stroke();
        
        
        // Ticks marks along the positive X-axis
        for(let i=0; i<Math.round(w*0.5); i++) {
            this.context.beginPath();
            
            // Draw a tick mark 5px long (-4 to 4)
          //  if (offX != w*0.5-margin) {
          //      this.context.moveTo(offX + w*0.5+i*dist_grids, offY + h*0.5-4);
          //      this.context.lineTo(offX + w*0.5+i*dist_grids, offY + h*0.5+4);
          //  } else {
                this.context.moveTo(this.panningOffsetX + w*0.5+i*dist_grids, offY + h*0.5-4);
                this.context.lineTo(this.panningOffsetX + w*0.5+i*dist_grids, offY + h*0.5+4);
          //  }
            
            this.context.stroke();
        
            
            // Text value at that point
            //this.context.font = '100 20px Arial';
            //this.context.fillStyle = "red";
            //this.context.fillText("m", offX + w*0.5 - 30, 15);
            
        }

        // Ticks marks along the negative X-axis
        for(let i=Math.round(w*0.5); i>0; i--) {
            this.context.beginPath();

            // Draw a tick mark 5px long (-4 to 4)
            this.context.moveTo(this.panningOffsetX + w*0.5-i*dist_grids, offY + h*0.5-4);
            this.context.lineTo(this.panningOffsetX + w*0.5-i*dist_grids, offY + h*0.5+4);
            this.context.stroke();            
        }

        // Ticks marks along the positive Y-axis
        for(let i=1; i<Math.round(h*0.5); i++) {
            this.context.beginPath();

            // Draw a tick mark 5px long (-4 to 4)
            this.context.moveTo(offX + w*0.5-4, this.panningOffsetY + h*0.5-i*dist_grids);
            this.context.lineTo(offX+ w*0.5+4, this.panningOffsetY + h*0.5-i*dist_grids);
            this.context.stroke();

            
            // Text value at that point
            //this.context.font = '100 20px Arial';
            //this.context.fillStyle = "red";
            //this.context.fillText("m", w - 30, offY + h*0.5 + 30);
            
        }

        // Ticks marks along the negative Y-axis
        for(let i=Math.round(h*0.5); i>0; i--) {
            this.context.beginPath();

            // Draw a tick mark 5px long (-4 to 4)
            this.context.moveTo(offX + w*0.5-4, this.panningOffsetY + h*0.5+i*dist_grids);
            this.context.lineTo(offX + w*0.5+4, this.panningOffsetY + h*0.5+i*dist_grids);
            this.context.stroke();
        }
    }

    public setPanningOffset(x: number, y: number){
        this.panningOffsetX = x;
        this.panningOffsetY = y;
        this.drawAxes();
    }
}