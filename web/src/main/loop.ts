declare var Stats : any;
// TODO hittest
class Loop {
    private stats; // 0 stop, 1 play, 2 pause

    public canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;
    private panningOffsetX: number = 0;
    private panningOffsetY: number = 0;

    private buffer : Fifo<Float64Array>;
    private file : File;

    private worker : Worker;
    private workerIsStopped : boolean;
    private workerTimeout : number;
    private workerIntervalTime : number;

    private loadAllFile : boolean = true;
    private forceLoadAllCheckbox : boolean = false;
    private isPlaying : boolean = false
    private isEof : boolean = false;
    private lastObjects : Float64Array | null;

    private reqId : number = -1;
    private barContainer : HTMLElement;

    constructor( canvas: HTMLCanvasElement, gui: any) {

        this.canvas = canvas;
        this.context = <CanvasRenderingContext2D> canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;

        this.file = new File([],"");
        this.buffer = new Fifo();
        this.lastObjects = null;

        this.worker = new Worker('./dist/worker/worker.js');
        this.workerIsStopped = true;
        this.workerTimeout = 0;
        this.workerIntervalTime = 200;

        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats.dom.style = "margin-left: 100px;";
        Startup.gui.Register([
            {
                type: 'display',
                label: '',
                folder: "FPS",
                element: this.stats.dom,
            },
            {
                type: 'button',
                label: 'Play/Pause',
                folder: 'Controls',
                streched: true,
                action: () => {
                    this.playPause();
                }
            },{
                type: 'button',
                label: 'Rewind',
                folder: 'Controls',
                streched: true,
                action: () => {
                    this.reset();
                }
            },
            {
                type: 'checkbox',
                folder: 'Controls',
                label: 'Force loading all file in memory',
                object: this,
                property: 'forceLoadAllCheckbox',
            },
            {
                type: 'display',
                folder: 'Controls',
                label: 'Is playing',
                object: this,
                property: 'isPlaying',
            },
            {
                type: 'display',
                folder: 'Controls',
                label: 'Is EOF',
                object: this,
                property: 'isEof',
            }
        ]);
        this.barContainer = <HTMLElement> document.getElementById("guify-bar-container");

    }

    public selectX : number | null = null;
    public selectY : number | null = null;
    public savedBody : Body | null = null;

    private draw() : void {
        this.stats.begin();

        //this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.context.fillStyle = "white"; 
        this.context.strokeStyle = "red";
        //this.context.setTransform(xAx, xAy, -xAy, -xAx, x, y);
        //this.setMatrix(this.canvas.width/2 + this.panningOffsetX, this.canvas.height/2 + this.panningOffsetY, 1, 0);

        if(this.lastObjects == null || this.isPlaying) { //Disegno il primo frame sempre o qundo e'play
            let objects = this.buffer.pop();
            if(objects != null && !this.isEof){
                this.drawStates(objects);
                this.lastObjects = objects;
            } else {
                this.isEof = true;
                this.isPlaying = false
                this.barContainer.innerText = "⏹";
            }
        } else if(this.lastObjects != null)
            this.drawStates(this.lastObjects);
  
        this.reqId = window.requestAnimationFrame(() => this.draw());
        //setTimeout(() => this.draw(), 0)
        this.stats.end();
    }

    /*private setMatrix(x: number, y: number, scale: number, rotate: number){
        var xAx = Math.cos(rotate) * scale;  // the x axis x
        var xAy = Math.sin(rotate) * scale;  // the x axis y
        this.context.setTransform(xAx, xAy, -xAy, -xAx, x, y);
    }*/

    // per aumentare la velocita di calcolo utilizzo un quadrato circoscritto
    private squareHitTest(x: number, y: number, r: number, xp: number, yp: number) : boolean {
        let x1 = x - r;
        let y1 = y - r;
        let x2 = x + r;
        let y2 = y + r;
        return (x1 <= xp && xp <= x2 && y1 <= yp && yp <= y2);
    }

    private drawStates( objects : Float64Array) {
        let xBase = this.canvas.width/2 + this.panningOffsetX;
        let yBase = (this.canvas.height/2 + this.panningOffsetY)
        
        let numParams = 5;
        //console.log(this.buffer.size);
        this.context.beginPath();
        for(let i=1; i<=objects[0]; i++){
            let x = xBase+objects[i * numParams];
            let y = yBase-objects[i * numParams + 1];
            let r = objects[i * numParams + 2];

            this.context.moveTo(x, y);
            this.context.arc(x, y, r, 0, 2 * Math.PI);
        }
        this.context.closePath();
        this.context.fill();
    }

    /*private drawStates( objects : Float64Array) {
        let xBase = this.canvas.width/2 + this.panningOffsetX;
        let yBase = (this.canvas.height/2 + this.panningOffsetY)
        
        let numParams = 5;
        //console.log(this.buffer.size);
        console.log(objects[0]);
        for(let i=1; i<=objects[0]; i++){
            let x = xBase+objects[i * numParams];
            let y = yBase-objects[i * numParams + 1];
            let r = objects[i * numParams + 2];

            if(this.selectX != null && this.selectY != null && this.squareHitTest(x, y, r, this.selectX, this.selectY)){
                this.savedBody = new Body({x: x, y: y, radius: r})
            }
            this.context.fillStyle = '#'+(Math.random()*0xFFFFFF<<0).toString(16); 
            this.context.beginPath();
            this.context.arc(x, y, r, 0, 2 * Math.PI);
            this.context.fill();
        }

        if(this.savedBody != null){
            this.context.beginPath();
            this.context.arc(this.savedBody.x, this.savedBody.y, this.savedBody.radius+5, 0, 2 * Math.PI);
            this.context.stroke();
        }
    }*/

    public play() {
        if(this.isPlaying || this.isEof) return;
        if(!this.loadAllFile) {
            this.requestData();
        }
        this.isPlaying = true;
        this.barContainer.innerText = "⏵";
    }

    public pause() {
        if(!this.isPlaying || this.isEof) return;
        if(!this.loadAllFile) {
            clearTimeout(this.workerTimeout); 
        }
        this.isPlaying = false;
        this.barContainer.innerText = "⏸";
    }

    public playPause(){
        if(!this.isPlaying)
            this.play();
        else 
            this.pause();
    }

    public async reset(file: File = this.file) {
        console.log("reset");
        this.barContainer.innerText = "";
        window.cancelAnimationFrame(this.reqId);
        if(!this.loadAllFile){
            clearTimeout(this.workerTimeout); 
            console.log(this.workerIsStopped);
            while(!this.workerIsStopped){ // Aspetto la fine del worker
                await new Promise((resolve)=>{setTimeout(()=>{resolve()}, 100)});
            }

            this.workerIntervalTime = 200;
            this.worker.postMessage({"type": "stop"});
        }

        // Reset variabili
        this.isEof = false;
        this.isPlaying = false;
        this.buffer.clear();
        this.lastObjects = null;

        try {
            this.file = file
            await this.loadFile(file);
            console.log("File loaded");
        } catch (e) {
            console.error(e);
        }

        if(!this.loadAllFile) {
            this.requestData(true);
            while(!this.workerIsStopped){ // Aspetto la fine del worker
                await new Promise((resolve)=>{setTimeout(()=>{resolve()}, 100)});
            }
        }
        this.barContainer.innerText = "⏹";
        this.draw();
        //this.play();
    }

    private requestData(once : boolean = false){
        if(this.workerIsStopped){
            console.log("request");
            //console.log(this.buffer.size);
            if(this.buffer.size < 600){
                this.worker.postMessage({"type": "read"});
                this.workerIsStopped = false;
            } else {
                this.workerIntervalTime += this.workerIntervalTime * 1/3;
            }
        }
        if(once) return;
        this.workerTimeout = setTimeout(() => {
            this.requestData();
        }, this.workerIntervalTime)
    }

    private async loadFile(file: File) : Promise<void> {
        Startup.gui.Loader(true);
        //if( this.file.size < 100000000 || this.forceLoadAllCheckbox){ //100MB 
            this.loadAllFile = true;
            try {
                this.buffer = await this.loadFileAll(file);
            } catch (e) {
                throw Error("Failed loading file")
            }
        //} else {
        //    this.loadAllFile = false;
        //    this.loadFileChunck(file);
        //}
        Startup.gui.Loader(false);
        return;
    }

    private async loadFileAll(file: File) : Promise<Fifo<Float64Array>> {
        let reader = new FileReader();
        reader.readAsText(file);
        return new Promise((resolve, reject) =>{
            reader.onload = function(event) {
                try {
                    let buffer = Deserializer.parseJsonFloat64Array(<string> reader.result);
                    resolve(buffer);
                } catch (e) {
                    reject(e);
                }
            };
        });
    }

    private loadFileChunck(file: File){
        this.worker.postMessage({"type": "file", "data": file});

        this.worker.onmessage = (event) => {
            let response = event.data;
            // Sto ricevendo dei messaggi del vecchio file
            if(response.fileName != this.file!.name) return;
            // Controllo se il worker ha finito il job
            this.workerIsStopped = response.endChunck;
            if( response.endFile ){
                clearTimeout(this.workerTimeout); 
                this.buffer.push(null);
                return;
            }
            if(response.array != null){
                this.buffer.push(response.array);
                this.workerIntervalTime = response.time * response.numIt /2;
                return;
            }
        };
    }

    public setPanningOffset(x: number, y: number){
        this.panningOffsetX = x;
        this.panningOffsetY = y;
    }

}

class MouseInput {
    private loop: Loop;
    private canvas: HTMLCanvasElement;
    private globalScale: number = 1;
    private globalOffsetX: number = 0;
    private globalOffsetY: number = 0;

    private panningStartX: number = 0;
    private panningStartY: number = 0;

    private panningOffsetX: number = 0;
    private panningOffsetY: number = 0;
    private panning: boolean = false;

    private mouseMoveListener: any = null;
    private mouseUpListener: any = null;


    constructor(loop: Loop){
        this.loop = loop;
        this.canvas = loop.canvas;
        this.canvas.addEventListener("mousedown", (e: MouseEvent)=>this.startPan(e, this));
        this.mouseMoveListener = (e: MouseEvent) => this.pan(e, this)
        this.mouseUpListener = (e: MouseEvent) => this.endPan(e, this)
        this.loop.setPanningOffset(0,0);
    }

    private startPan(e: MouseEvent, self: MouseInput) {
        if(self.panning) return;
        self.panning = true;

        self.canvas.addEventListener("mousemove", self.mouseMoveListener);
        self.canvas.addEventListener("mouseup", self.mouseUpListener);
        self.canvas.addEventListener("mouseleave", self.mouseUpListener);

        self.panningStartX = e.clientX;
        self.panningStartY = e.clientY;

        self.loop.selectX = e.clientX;
        self.loop.selectY = e.clientY;
    }

    private pan(e: MouseEvent, self: MouseInput) {
        self.panningOffsetX = e.clientX - self.panningStartX;
        self.panningOffsetY = e.clientY - self.panningStartY;
        self.loop.setPanningOffset(self.globalOffsetX + self.panningOffsetX, self.globalOffsetY + self.panningOffsetY);
    }

    private endPan(e: MouseEvent, self: MouseInput) {
        self.panning = false;
        self.globalOffsetX += self.panningOffsetX;
        self.globalOffsetY += self.panningOffsetY;
        self.canvas.removeEventListener("mousemove", self.mouseMoveListener);
        self.canvas.removeEventListener("mouseup", self.mouseUpListener);
        self.canvas.removeEventListener("mouseleave", self.mouseUpListener);
    }
}