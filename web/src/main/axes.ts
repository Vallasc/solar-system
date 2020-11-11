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
        let distGrids : number = 10; //distance between grids
        let bigEvery : number = 5; // 1 big every 10 small
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

        this.context.strokeStyle = "rgba(255,0,0,0.8)"; 
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
        
        this.context.lineWidth = 1;

        let bigTick = 6;
        let smallTick = 3;

        let newW = Math.floor(w/2) - (Math.floor(w/2) % (distGrids*bigEvery));
        let xNumTick = (newW / distGrids);

        // Ticks marks along the negative X-axis
        for(let i=0; i<xNumTick ; i++) {
            this.context.beginPath();
            let mod = (this.panningOffsetX + i*distGrids) % (newW);
            mod = mod < 0 ? (newW + mod) : mod; // Riporto il modulo positivo
            if(i % bigEvery == 0){
                this.context.moveTo(w/2 + mod, offY + h/2 - bigTick);
                this.context.lineTo(w/2 + mod, offY + h/2 + bigTick);
            } else {
                this.context.moveTo(w/2 + mod, offY + h/2 - smallTick);
                this.context.lineTo(w/2 + mod, offY + h/2 + smallTick);
            }
            this.context.stroke();
        }

        // Ticks marks along the positive X-axis
        for(let i=xNumTick; i>0; i--) {
            this.context.beginPath();
            let mod = (i*distGrids - this.panningOffsetX) % (newW);
            mod = mod < 0 ? (newW + mod) : mod; // Riporto il modulo positivo
            if((i) % bigEvery == 0){
                this.context.moveTo(w/2 - mod, offY + h/2 - bigTick);
                this.context.lineTo(w/2 - mod, offY + h/2 + bigTick);
            } else {
                this.context.moveTo(w/2 - mod, offY + h/2 - smallTick);
                this.context.lineTo(w/2 - mod, offY + h/2 + smallTick);
            }
            this.context.stroke();
        }

        let newH = Math.floor(h/2) - (Math.floor(h/2) % (distGrids*bigEvery));
        let yNumTick = (newH / distGrids);

        // Ticks marks along the negative Y-axis
        for(let i=0; i<yNumTick ; i++) {
            this.context.beginPath();
            let mod = (this.panningOffsetY + i*distGrids) % (newH);
            mod = mod < 0 ? (newH + mod) : mod; // Riporto il modulo positivo
            if(i % bigEvery == 0){
                this.context.moveTo(offX + w/2 - bigTick, h/2 + mod);
                this.context.lineTo(offX + w/2 + bigTick, h/2 + mod);
            } else {
                this.context.moveTo(offX + w/2 - smallTick, h/2 + mod);
                this.context.lineTo(offX + w/2 + smallTick, h/2 + mod);
            }
            this.context.stroke();
        }
        
        // Ticks marks along the positive Y-axis
        for(let i=yNumTick; i>0; i--) {
            this.context.beginPath();
            let mod = (i*distGrids - this.panningOffsetY) % (newH);
            mod = mod < 0 ? (newH + mod) : mod; // Riporto il modulo positivo
            if(i % bigEvery == 0){
                this.context.moveTo(offX + w/2 - bigTick, h/2 - mod);
                this.context.lineTo(offX + w/2 + bigTick, h/2 - mod);
            } else {
                this.context.moveTo(offX + w/2 - smallTick, h/2 - mod);
                this.context.lineTo(offX + w/2 + smallTick, h/2 - mod);
            }
            this.context.stroke();
        }
    }

    public setPanningOffset(x: number, y: number){
        this.panningOffsetX = x;
        this.panningOffsetY = y;
        this.drawAxes();
    }

}