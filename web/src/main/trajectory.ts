class Trajectory {
    public canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;

    private panningOffsetX: number = 0;
    private panningOffsetY: number = 0;

    private cordX : Array<number> = [];
    private cordY : Array<number> = [];

    private len : number = 0;

    constructor( canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.context =  <CanvasRenderingContext2D> canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
    }

    public addCords(x :number, y : number) : void {
        this.cordX.push(x);
        this.cordY.push(y);
        this.len++;
    }

    public drawTrajectory() : void {
        let w : number = this.canvas.width;
        let h : number = this.canvas.height;
        let offX : number = 0;
        let offY : number = 0;
        let i : number;
        
        this.context.clearRect(0, 0, w, h);

        this.context.strokeStyle = "rgba(255,0,0,0.5)"; 
        this.context.lineWidth = 2;
         
        
        
        for(i = 0; i < this.len; i++) {
            this.context.beginPath();
            
            if (this.len == 1) {
                this.context.moveTo(this.cordX[i] + this.panningOffsetX, this.cordY[i] + this.panningOffsetY);
                this.context.lineTo(this.cordX[i] + this.panningOffsetX, this.cordY[i] + this.panningOffsetY);
                console.log(this.cordX[i], this.panningOffsetX, this.cordY[i], this.panningOffsetY, this.len);
            } else {
                this.context.moveTo(this.cordX[i-1] + this.panningOffsetX, this.cordY[i-1] + this.panningOffsetY);
                this.context.lineTo(this.cordX[i] + this.panningOffsetX, this.cordY[i] + this.panningOffsetY);
                console.log(this.cordX[i], this.panningOffsetX, this.cordY[i], this.panningOffsetY, this.len);
            }
            
            this.context.stroke();
        }
    }

    public clearCanvas() : void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public setPanningOffset(x: number, y: number){
        this.panningOffsetX = x;
        this.panningOffsetY = y;
        this.drawTrajectory();
    }
}