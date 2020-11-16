class Trajectory {
    public canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;

    private panningOffsetX: number = 0;
    private panningOffsetY: number = 0;

    private points : Array<[number, number]> = [];
    private readonly maxSize : number = 1000;

    constructor( canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.context =  <CanvasRenderingContext2D> canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
    }

    public addCords(x :number, y : number) : void {
        this.points.push([x, y]);
        if(this.points.length > this.maxSize)
        this.points.shift();
        this.drawTrajectory();
    }

    public drawTrajectory() : void {
        let xBase = this.canvas.width/2 + this.panningOffsetX;
        let yBase = this.canvas.height/2 + this.panningOffsetY;
        this.context.strokeStyle = "rgba(255,255,255,0.4)"; 
        this.context.lineWidth = 0.8;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.beginPath();
        for(let i=1; i<this.points.length; i++){
            if (this.points.length != 1) {
                this.context.moveTo(this.points[i-1][0] + xBase, yBase - this.points[i-1][1]);
                this.context.lineTo(this.points[i][0] + xBase, yBase - this.points[i][1]);
            }
        }
        this.context.stroke();
    }

    public clear() : void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.points = [];
    }

    public setPanningOffset(x: number, y: number){
        this.panningOffsetX = x;
        this.panningOffsetY = y;
        this.drawTrajectory();
    }
}