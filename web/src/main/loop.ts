declare var Stats : any;

class Loop {
    private stats; // 0 stop, 1 play, 2 pause
    public guiPanel: any

    public canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;
    private panningOffsetX: number = 0;
    private panningOffsetY: number = 0;
    private axesOffsetX: number = 0;
    private axesOffsetY: number = 0;

    private scale: number = 1;
    private imatrix: DOMMatrix;


    private buffer : Fifo<Float32Array>;
    private file : File;

    private loadAllFile : boolean = true;
    private forceLoadAllCheckbox : boolean = false;
    private isPlaying : boolean = false
    private isEof : boolean = false;
    private readEnd : boolean = false;
    private bufferSize: number = 90;

    private lastObjects : Float32Array | null;

    private reqId : number = -1;
    public barContainer : HTMLElement;

    public chart : NumberChart;

    constructor( canvas: HTMLCanvasElement, gui: any) {

        this.canvas = canvas;
        this.context = <CanvasRenderingContext2D> canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.imatrix = this.context.getTransform().inverse();

        this.file = new File([],"");

        this.buffer = new Fifo();
        this.lastObjects = null;

        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats.dom.style = "margin-left: 100px;";

        this.chart = new NumberChart(
            ["Total energy","Kinetic energy", "Internal energy", "Potential energy", "Binding energy"],
            ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF"]);
        let div = document.createElement("div");
        div.id = "container";
        this.guiPanel = [
            {
                type: 'display',
                label: '',
                folder: "FPS",
                element: this.stats.dom,
            },{
                type: 'button',
                label: 'Zoom -',
                folder: 'Controls',
                streched: false,
                action: () => {
                    this.scale -= 0.2;
                    Startup.trajectory.setScale(this.scale);
                }
            },{
                type: 'button',
                label: 'Zoom +',
                folder: 'Controls',
                streched: false,
                action: () => {
                    this.scale += 0.2;
                    Startup.trajectory.setScale(this.scale);
                }
            },{
                folder: 'Selected',
                type: 'button',
                label: 'Change center axes',
                streched: true,
                action: () => {
                    if(this.selectedBody.visible){
                        Startup.axes.setAxesOffset(this.selectedBody.x, this.selectedBody.y);
                        this.setAxesOffset(this.selectedBody.x, this.selectedBody.y);
                    }
                }
            },{
                type: 'display',
                folder: 'Controls',
                label: 'Scale',
                object: this,
                property: 'scale',
            },{
                type: 'checkbox',
                folder: 'Controls',
                label: 'Force loading all file in memory',
                object: this,
                property: 'forceLoadAllCheckbox',
            },{
                type: 'display',
                folder: 'Controls',
                label: 'Is playing',
                object: this,
                property: 'isPlaying',
            },{
                type: 'display',
                folder: 'Controls',
                label: 'Is EOF',
                object: this,
                property: 'isEof',
            },{
                type: 'display',
                folder: 'Controls',
                label: 'Iteration',
                object: this,
                property: 'numIteration',
            },{
                type: 'display',
                folder: 'Controls',
                label: 'Offset X',
                object: this,
                property: 'panningOffsetX',
            },{
                type: 'display',
                folder: 'Controls',
                label: 'Offset Y',
                object: this,
                property: 'panningOffsetY',
            },{
                type: 'display',
                folder: 'Selected',
                label: 'X',
                object: this.selectedBody,
                property: 'x',
            },{
                type: 'display',
                folder: 'Selected',
                label: 'Y',
                object: this.selectedBody,
                property: 'y',
            },{
                type: 'display',
                folder: 'Selected',
                label: 'Radius',
                object: this.selectedBody,
                property: 'radius',
            }
        ];
        this.barContainer = <HTMLElement> document.getElementById("guify-bar-container");
    }

    public selectX : number | null = null;
    public selectY : number | null = null;
    public selectedBody : Body = new Body();

    private numIteration : number = 0;
    private lastTime : number = 0;
    private draw(time: number) : void {
        this.stats.begin();

        //if(time - this.lastTime <= 20){
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if(this.lastObjects == null || this.isPlaying) { //Disegno il primo frame sempre o qundo e'play
            let objects = this.buffer.pop();
            // Ho dei frame da visualizzare
            if(objects != null && !this.isEof){
                this.drawStates(objects);
                this.lastObjects = objects;
                this.numIteration++;
            } else if(!this.loadingChunck) { // Non ne sto caricando delgli altri
                this.isEof = true;
                this.isPlaying = false
                this.barContainer.innerText = "⏹";
            }
        } else if(this.lastObjects != null)
            this.drawStates(this.lastObjects);
        //} else {
        //    this.buffer.pop(); //TODO Aggiustare cosi non funziona
        //}
  
        this.reqId = window.requestAnimationFrame((time) => this.draw(time));

        if(!this.loadAllFile && !this.readEnd && this.buffer.size < this.bufferSize) 
            this.loadFileChunck(this.file, false);
        this.stats.end();
        this.lastTime = time;
    }


    // per aumentare la velocita di calcolo utilizzo un quadrato circoscritto
    private squareHitTest(x: number, y: number, r: number, xp: number, yp: number) : boolean {
        let x1 = x - r;
        let y1 = y - r;
        let x2 = x + r;
        let y2 = y + r;
        return (x1 <= xp && xp <= x2 && y1 <= yp && yp <= y2);
    }

    public static roundTo1(x: number){
        if( x > 0 && x < 1) return 1;
        else return x;
    }

    private getColorFromInt(x: number) : string {
        let numColors = 10;
        let r = 255 * x / numColors;
        let b = 255 - r;
        return "rgb("+r+",0,"+b+")";
    }

    /*private getCanvasCoords(screenX : number, screenY: number) {
        let x = screenX * this.imatrix.a + screenY * this.imatrix.c + this.imatrix.e;
        let y = screenX * this.imatrix.b + screenY * this.imatrix.d + this.imatrix.f;
        return {x: x, y: y};
    }*/
    private VtoW(screenX : number, screenY: number) {
        let x = screenX * this.imatrix.a + screenY * this.imatrix.c + this.imatrix.e;
        let y = screenX * this.imatrix.b + screenY * this.imatrix.d + this.imatrix.f;
        return {x: x, y: y};
    }

    private drawStates( objects : Float32Array) {
        let fillColor = -1;
        let xBase = this.canvas.width/2 + this.panningOffsetX - this.axesOffsetX;
        let yBase = this.canvas.height/2 + this.panningOffsetY + this.axesOffsetY;

        this.context.beginPath();
        this.context.translate(xBase, yBase);
        this.context.scale(this.scale, -this.scale);
        this.imatrix = this.context.getTransform().inverse();
        
        const numParams = Deserializer.bodyNumParams;
        //console.log(this.buffer.size);
        //console.log(objects);

        let bodyIsMerged = true;

        for(let i=0; i<objects[Deserializer.numIterationParam -1]; i++){
            let id = objects[Deserializer.numIterationParam + i * numParams + 0];
            let x = objects[Deserializer.numIterationParam  + i * numParams + 1]; // posizione 1 dell'array
            let y = objects[Deserializer.numIterationParam  + i * numParams + 2];
            let r = objects[Deserializer.numIterationParam  + i * numParams + 3];
            let t = objects[Deserializer.numIterationParam  + i * numParams + 4];

            if(fillColor != t){ // Cambio colore pennello
                this.context.closePath();
                this.context.fill();
                this.context.beginPath();
                fillColor = t;
                this.context.fillStyle = this.getColorFromInt(fillColor); 
            }

            this.context.moveTo(x, y);
            this.context.arc(x, y, Math.floor(Loop.roundTo1(r)), 0, 2 * Math.PI);

            // End draw

            // Se il corpo e' stato selezionato
            if( this.selectedBody.visible && this.selectedBody.id == id){
                this.selectedBody.x = x;
                this.selectedBody.y = y;
                this.selectedBody.radius = r;
                bodyIsMerged = false;
            } 
            if( this.selectX != null && this.selectY != null){
                let cords = this.VtoW(this.selectX, this.selectY);
                if(this.squareHitTest(x, y, Loop.roundTo1(r), cords.x, cords.y)){
                    this.selectedBody.id = id;
                    this.selectedBody.x = x;
                    this.selectedBody.y = y;
                    this.selectedBody.radius = r;
                    this.selectedBody.setVisible(true);

                    this.selectX = null;
                    this.selectY = null;
                    Startup.trajectory.clear();

                    bodyIsMerged = false;
                } else {
                    bodyIsMerged = true;
                }
            }
        }
        this.context.closePath();
        this.context.fill();
        if(bodyIsMerged){ // Il body ha fatto il merge
            this.selectedBody.setVisible(false);
            Startup.trajectory.clear();
        }
        if( this.selectedBody.visible){ // Body selezionato
            this.context.beginPath();
            this.context.strokeStyle = "rgba(0,255,0,0.3)"; 
            this.context.lineWidth = 2;
            this.context.arc(this.selectedBody.x, this.selectedBody.y, this.selectedBody.radius + 4, 0, 2 * Math.PI);
            this.context.closePath();
            this.context.stroke();
            if(this.numIteration % 5 == 0)
                Startup.trajectory.addCords(this.selectedBody.x, this.selectedBody.y);
        }

        if(this.numIteration % 30 == 0)
                this.chart.updateChart([
                    {x: this.numIteration, y:objects[0]},
                    {x: this.numIteration, y:objects[1]},
                    {x: this.numIteration, y:objects[2]},
                    {x: this.numIteration, y:objects[3]},
                    {x: this.numIteration, y:objects[4]}
                ]);
    }

    public play() {
        if(this.isPlaying || this.isEof) return;
        this.isPlaying = true;
        this.barContainer.innerText = "⏵";
    }

    public pause() {
        if(!this.isPlaying || this.isEof) return;
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

        // Reset variabili
        this.isEof = false;
        this.isPlaying = false;
        this.lastObjects = null;
        this.numIteration = 0;
        this.bufferSize = 90;

        this.selectedBody.visible = false;
        this.selectX = null;
        this.selectY = null;

        if(!this.loadAllFile) {
            while(this.loadingChunck){ // Aspetto la fine del worker
                await new Promise((resolve)=>{setTimeout(()=>{resolve()}, 100)});
            }
        }
        this.buffer.clear();
        this.chart.deleteData();

        try {
            this.file = file
            await this.loadFile(file);
            //console.log("File loaded");
        } catch (e) {
            console.error(e);
        }

        this.barContainer.innerText = "⏹";
        this.draw(0);
        //this.play();
    }

    public async resetArray(arrayBuffer: Float32Array) {
        console.log("reset");
        this.barContainer.innerText = "";
        window.cancelAnimationFrame(this.reqId);

        // Reset variabili
        this.isEof = false;
        this.isPlaying = false;
        this.lastObjects = null;
        this.numIteration = 0;
        this.bufferSize = 90;

        this.selectedBody.visible = false;
        this.selectX = null;
        this.selectY = null;

        if(!this.loadAllFile) {
            while(this.loadingChunck){ // Aspetto la fine del worker
                await new Promise((resolve)=>{setTimeout(()=>{resolve()}, 100)});
            }
        }
        this.buffer.clear();
        this.chart.deleteData();

        try {
            this.buffer.pushFifo( Deserializer.parseBinaryFloat32Array(arrayBuffer) );
        } catch (e) {
            console.error(e);
        }

        this.barContainer.innerText = "⏹";
        this.draw(0);
    }

    private async loadFile(file: File) : Promise<void> {
        Startup.gui.Loader(true);
        //if( this.file.size < 100000000 || this.forceLoadAllCheckbox){ //100MB 
        if(this.forceLoadAllCheckbox){
            this.loadAllFile = true;
            try {
                await this.loadFileAll(file);
            } catch (e) {
                throw Error("Failed loading file")
            }
        } else {
            this.loadAllFile = false;
            await this.loadFileChunck(file, true);
        }
        Startup.gui.Loader(false);
        return;
    }

    private async loadFileAll(file: File) {
        try {
            let entries : Array<any> = await ZipReader.getEntries(file);
            this.buffer.clear();
            for(let i=1; i<entries.length; i++) { //TODO cambiare in i=0, primo file non letto perche contiene metadati
                console.log("Load file: "+entries[i].filename);
                let arrayBuffer = await ZipReader.getEntryFile(entries[i]);
                this.buffer.pushFifo( Deserializer.parseBinaryFloat32Array(arrayBuffer) );
            }
            console.log(this.buffer.size);
            ZipReader.closeZipReader();
            this.readEnd = true;
            //this.addGuiRange(0, entries.length);
        } catch(e){
            console.log(e);
        }
    }

    private indexChunck = 1; //TODO cambiare in indexChunck=0, primo file non letto perche contiene metadati
    private loadingChunck = false;
    private entries : Array<any> | null = null;

    private async loadFileChunck(file: File, reset: boolean) {
        if( (this.loadingChunck || this.readEnd) && !reset ){
            return;
        }

        if(reset){
            ZipReader.closeZipReader();
            this.entries = null;
            this.indexChunck = 1; //TODO cambiare in indexChunck=0, primo file non letto perche contiene metadati
        }

        this.readEnd = false;
        this.loadingChunck = true;

        try {
            if(this.entries == null){
                this.entries = await ZipReader.getEntries(file); // TODO devochiudere lo zip
            }
            if(this.entries != null && this.indexChunck < this.entries.length) {
                console.log("Load file: "+this.entries[this.indexChunck].filename);
                let arrayBuffer = await ZipReader.getEntryFile(this.entries[this.indexChunck]);
                let b = Deserializer.parseBinaryFloat32Array(arrayBuffer);
                // Funzione ch bilancia le richieste
                this.bufferSize = b.size > 12000 ? 60 : -100 * Math.log(b.size) + 1000;
                //this.bufferSize = 600;

                //console.log(this.bufferSize);
                this.buffer.pushFifo( b );
                this.indexChunck++;
                if(this.indexChunck == this.entries.length) {
                    this.readEnd = true;
                    ZipReader.closeZipReader();
                }
                //this.addGuiRange(0, this.entries.length-1);
            }
        } catch(e){
            console.log(e);
            this.readEnd = true;
        } finally {
            this.loadingChunck = false;
        }
    }

    public setPanningOffset(x: number, y: number){
        this.panningOffsetX = x;
        this.panningOffsetY = y;
    }

    public setAxesOffset(x: number, y: number){
        this.axesOffsetX = x;
        this.axesOffsetY = y;
    }

    public setSelected(x: number, y: number){
        this.selectX = x;
        this.selectY = y;
    }

    private rangeSlider : any = null;
    public addGuiRange(min: number, max: number){
        if(this.rangeSlider != null) {
            Startup.gui.Remove(this.rangeSlider);
        }
        this.rangeSlider = Startup.gui.Register({
            type: 'range',
            label: 'Stepped Range',
            min: min, max: max, step: 1,
            object: this, property: "indexChunck",
            onChange: async (data: any) => {
                await this.setCursor(data);
            }
        });
    }

    public async setCursor(cursor: number){
        if(!this.loadAllFile) {
            while(this.loadingChunck){ // Aspetto la fine del worker
                await new Promise((resolve)=>{setTimeout(()=>{resolve()}, 100)});
            }
        }
        this.buffer.clear();
        await this.loadFileChunck(this.file, false);
    }
}