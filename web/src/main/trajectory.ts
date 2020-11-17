class Trajectory {
    public canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;

    private panningOffsetX: number = 0;
    private panningOffsetY: number = 0;
    private axesOffsetX: number = 0;
    private axesOffsetY: number = 0;

    private points : Array<[number, number]> = [];
    private readonly maxSize : number = 1000;
    private scale : number = 1;

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
        let xBase = this.canvas.width/2 + this.panningOffsetX - this.axesOffsetX;
        let yBase = this.canvas.height/2 + this.panningOffsetY + this.axesOffsetY;

        this.context.strokeStyle = "rgba(0,0,0,0.6)"; 
        this.context.lineWidth = 0.8;
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.translate(xBase, yBase);
        this.context.scale(this.scale, -this.scale);
        this.context.beginPath();
        for(let i=1; i<this.points.length; i++){
            if (this.points.length != 1) {
                this.context.moveTo(this.points[i-1][0], this.points[i-1][1]);
                this.context.lineTo(this.points[i][0], this.points[i][1]);
            }
        }
        this.context.stroke();
    }

    public clear() : void {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.points = [];
    }

    public setPanningOffset(x: number, y: number){
        this.panningOffsetX = x;
        this.panningOffsetY = y;
        this.drawTrajectory();
    }

    public setAxesOffset(x: number, y: number){
        this.axesOffsetX = x;
        this.axesOffsetY = y;
        this.drawTrajectory();
    }

    public setScale(s: number){
        this.scale = s;
        this.drawTrajectory();
    }
}