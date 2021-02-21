class Axes {
    public canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;

    private panningOffsetX: number = 0;
    private panningOffsetY: number = 0;
    private scale : number = 1;

    constructor( canvas : HTMLCanvasElement) {
        this.canvas = canvas;
        this.context =  <CanvasRenderingContext2D> canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.drawAxes();
    }
    
    public drawAxes() : void {
        
        let w : number = this.canvas.width;
        let h : number = this.canvas.height;
        let distGrids : number = 10; //distance between grids
        let bigEvery : number = 5; // 1 big every 5 small
        let offX : number = 0;
        let offY : number = 0;

        let margin : number = 50;

        let numColors : number = 10;
        let r : number = 0;
        let b : number = 0;
        let N : number = 1000;
        let tempMax : number = 0.75*(0.0288*N+13)*10; 
        let temperature : number = 0;

        distGrids *= this.scale;

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

        //color temperature scale
        if ((offX <= w/2-130) && (offY >= -h/2+42+20*12)) {
            this.context.fillStyle = "rgb(60,0,0)";
        } else {
            this.context.fillStyle = "rgba(60,0,0,0.3)";
        }
        this.context.font = "11px Arial"
        this.context.fillText("Temperature (K)",w-120, 40);
        this.context.font = "9px Arial"
        for (let i = 1; i<11; i++) {
            r = 255 * (11-i) /numColors;
            b = 255 - r;
            if ((offX <= w/2-130) && (offY >= -h/2+42+20*12)) {
                this.context.fillStyle = "rgb("+r+",0,"+b+")";
                this.context.strokeStyle = "rgb("+r+",0,"+b+")";
            } else {
                this.context.fillStyle = "rgba("+r+",0,"+b+",0.3)";
                this.context.strokeStyle = "rgba("+r+",0,"+b+",0.3)";
            }
            this.context.fillRect(w-115, 40+20*i, 30,20);

            temperature = (11-i)*tempMax/10;
            if ((offX <= w/2-130) && (offY >= -h/2+42+20*12)) {
                this.context.fillStyle = "rgb(60,0,0)";
            } else {
                this.context.fillStyle = "rgba(60,0,0,0.3)";
            }
            this.context.fillText(temperature+"",w-73, 41+20*i);
            this.context.beginPath();
            this.context.moveTo(w-85,40.5+20*i);
            this.context.lineTo(w-75,40.5+20*i);
            this.context.stroke();
        }
        this.context.beginPath();
        this.context.moveTo(w-85,39.5+20*11);
        this.context.lineTo(w-75,39.5+20*11);
        this.context.stroke();
        this.context.fillText("0",w-73, 41+20*(11));

        this.context.strokeStyle = "rgb(60,0,0)"; 
        this.context.lineWidth = 1;
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
        
        //X and Y
        this.context.fillStyle = "rgb(60,0,0)";
        this.context.font = "11px Arial"
        this.context.fillText('Y',w/2-30 + offX, 30);
        this.context.fillText('X',w-30, h/2 + 30 + offY);

        //box Natural Units
        this.context.font = "11px Arial"
        console.log(offX, offY, w/2, h/2);
        if ((offX >= 300 - w/2) && (offY >= 180 - h/2)) {
            this.context.fillStyle = "rgb(60,0,0)";
            this.context.strokeStyle = "rgb(60,0,0)"; 
        } else {
            this.context.fillStyle = "rgba(60,0,0,0.3)";
            this.context.strokeStyle = "rgba(60,0,0,0.3)"; 
        }
        this.context.fillText('Natural Units:',40, 40);
        this.context.fillText("- Mass: 5.972 · 10     kg (Earth's mass)",45, 60);
        this.context.fillText('- Length: 1.496 · 10     m (1/10 of an astronomical unit)',45, 80);
        this.context.fillText('- Energy: 1.591 · 10     J',45, 100);
        this.context.fillText('- Time: 9.165 · 10   s',45, 120);
        this.context.fillText('- Angular Momentum: 1.458 · 10',45, 140);
        this.context.fillText('kg·m',226, 132);
        this.context.fillText('s',236, 148);
        this.context.fillText('_____', 223, 136);
        this.context.stroke();
        this.context.fillText('- Momentum: 9.748 · 10',45, 160);
        this.context.fillText('kg·m',186, 152);
        this.context.fillText('s',196, 168);
        this.context.fillText('_____', 183, 156);
        this.context.stroke();

        this.context.font = "9px Arial"
        this.context.fillText('2',251, 128);
        this.context.fillText('24',134, 56);
        this.context.fillText('10',143, 76);
        this.context.fillText('29',144, 96);
        this.context.fillText('7',132, 116);
        this.context.fillText('37',205, 136);
        this.context.fillText('26',164, 156);

        //astronomical unit and scale
        this.context.font = "11px Arial"
        if ((offX <= w/2-185) && (offY <= h/2-95)) {
            this.context.fillStyle = "rgb(60,0,0)";
            this.context.strokeStyle = "rgb(60,0,0)"; 
        } else {
            this.context.fillStyle = "rgba(60,0,0,0.3)";
            this.context.strokeStyle = "rgba(60,0,0,0.3)"; 
        }
        this.context.fillText(': 1 astronomical unit',w-145, h-70);
        let scaleString : string = 'scale: ';
        let roundScale : number = Math.round(this.scale * 10) / 10
        let str : string = scaleString.concat(roundScale.toString());
        this.context.fillText(str,w-125, h-40);
        this.context.lineWidth = 1;
        //long line
        this.context.moveTo(w-155 - distGrids, h-60);
        this.context.lineTo(w-40, h-60);
        // first |
        this.context.moveTo(w-150 - distGrids, h-78);
        this.context.lineTo(w-150 - distGrids, h-70);
        // second |
        this.context.moveTo(w-150, h-78);
        this.context.lineTo(w-150, h-70);
        // central -
        this.context.moveTo(w-150 - distGrids, h-74);
        this.context.lineTo(w-150, h-74);
        this.context.stroke();
    }

    public setPanningOffset(x: number, y: number){
        this.panningOffsetX = x;
        this.panningOffsetY = y;
        this.drawAxes();
    }

    public setScale(s: number){
        this.scale = s;
    }

}