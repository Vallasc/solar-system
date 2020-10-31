class Body {
    public x: number = 0;
    public y: number = 0;
    public vX: number = 0;
    public vY: number = 0;
    public accX: number = 0;
    public accY: number = 0;
    public radius: number = 0;
    public mass: number = 0;
    public k_energy: number = 0;
    public internal_energy: number = 0;

    constructor( {  x = 0, 
                    y = 0, 
                    vX = 0, 
                    vY = 0,
                    accX = 0,
                    accY = 0,
                    radius = 1,
                    mass = 0,
                    k_energy = 0,
                    internal_energy = 0} = {}) {
        this.x = x;
        this.y = y;
        this.vX = vX;
        this.vY = vY;
        this.accX = accX;
        this.accY = accY;
        this.radius = radius;
        this.mass = mass;
        this.k_energy = k_energy;
        this.internal_energy = internal_energy;
    }
    
    public drawOnCanvas (ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.restore();
    }

    public print() : void {
        console.log(`x: ${this.x}, y: ${this.y}`);
    }

}