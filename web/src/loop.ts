class Loop {
    private canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;
    private states : Array<Array<Body>>;

    private stop : boolean = false;
    private lastTime : number = 0;
    private iteration : number = 0;

    constructor( canvas: HTMLCanvasElement, states: Array<Array<Body>>) {
        this.canvas = canvas;
        this.context = <CanvasRenderingContext2D> canvas.getContext("2d");
        this.states = states;

        setTimeout(()=>{this.draw(0)}, 1000);
    }

    private dt = 200;
    private draw(time : number) : void {
        let seconds = (time - this.lastTime) / 1000;
        this.lastTime = time;
        
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();

        this.drawStates();
        //console.log("loop");
        if( !this.stop ){
            window.requestAnimationFrame((time) => this.draw(time));
            //setTimeout(()=>{ this.draw(time)}, this.dt);
        }
    }

    private drawStates(){
        if(this.iteration >= this.states.length){
            this.stop = true;
            return;
        }
        for(let i=0; i<this.states[this.iteration].length; i++)
            this.states[this.iteration][i].drawOnCanvas(this.context);
        this.iteration++;
    }

    public reset(){
        if(this.stop){
            this.stop = false;
            this.draw(0);
        }
        this.lastTime = 0;
        this.iteration = 0;
    }
}