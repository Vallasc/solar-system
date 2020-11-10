class Body {
    public id: number = 0;
    public x: number = 0;
    public y: number = 0;
    public radius: number = 0;
    public k_energy: number = 0;
    public internal_energy: number = 0;

    constructor( {  id = 0,
                    x = 0, 
                    y = 0, 
                    radius = 1,
                    k_energy = 0,
                    internal_energy = 0} = {}) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
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