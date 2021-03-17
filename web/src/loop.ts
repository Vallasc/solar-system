declare var Stats : any;

class Loop {
    private stats; // 0 stop, 1 play, 2 pause
    public guiPanel: any

    public canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;
    private panningOffsetX : number = 0;
    private panningOffsetY : number = 0;

    public selectX : number | null = null;
    public selectY : number | null = null;
    public selectedBody : Body = new Body();
    private axesBodyOffset : Body = new Body();

    private scale: number = 1;
    private imatrix: DOMMatrix;

    private file : File;

    private forceLoadAllCheckbox : boolean = false;
    private isPlaying : boolean = false
    private isEof : boolean = false;

    private reqId : number = -1;
    public barContainer : HTMLElement;

    public chart : LittleChart;

    private energyFile : EnergyArray;
    private fileManager : FileManager | null;

    private numIteration : number = 0;
    private lastTime : number = 0;

    constructor( canvas: HTMLCanvasElement, gui: any) {

        this.canvas = canvas;
        this.context = <CanvasRenderingContext2D> canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.imatrix = this.context.getTransform().inverse();

        this.file = new File([],"");
        this.energyFile = new EnergyArray(new ArrayBuffer(0));
        this.fileManager = null;

        this.stats = new Stats();
        this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats.dom.style = "margin-left: 100px;";

        this.chart = new LittleChart(
            ["Total energy","Kinetic energy", "Internal energy", "Potential energy", "Binding energy"],
            ["#ff0000", "#ffb100", "#00ff4e", "#0066ff", "#ff00eb"]);
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
                    this.scale = Math.round(this.scale * 10) / 10;
                    if(this.scale <= 0) this.scale = 0.2;

                    Startup.trajectory.setScale(this.scale);
                    Startup.axes.setScale(this.scale);
                    //Startup.trajectory.drawTrajectory()
                    Startup.axes.drawAxes();
                }
            },{
                type: 'button',
                label: 'Zoom +',
                folder: 'Controls',
                streched: false,
                action: () => {
                    this.scale += 0.2;
                    this.scale = Math.round(this.scale * 10) / 10;

                    Startup.trajectory.setScale(this.scale);
                    Startup.axes.setScale(this.scale);
                    //Startup.trajectory.drawTrajectory()
                    Startup.axes.drawAxes();
                }
            },{
                type: 'button',
                label: 'Reset Zoom',
                folder: 'Controls',
                streched: false,
                action: () => {
                    this.scale = Math.round(1 * 10) / 10;

                    Startup.trajectory.setScale(this.scale);
                    Startup.axes.setScale(this.scale);
                    //Startup.trajectory.drawTrajectory()
                    Startup.axes.drawAxes();
                }
            },{
                folder: 'Selected',
                type: 'button',
                label: 'Change center axes',
                streched: true,
                action: () => {
                    if(this.selectedBody.visible){
                        this.axesBodyOffset.clone(this.selectedBody);
                        //this.setAxesOffset(this.axesBodyOffset);
                        //Startup.trajectory.drawTrajectory()
                        this.selectedBody.setVisible(false);
                    }
                }
            },{
                folder: 'Selected',
                type: 'button',
                label: 'Reset center axes',
                streched: true,
                action: () => {
                    this.axesBodyOffset.reset();
                    //this.setAxesOffset(this.axesBodyOffset);
                    //Startup.trajectory.drawTrajectory()
                    this.selectedBody.setVisible(false);
                }
            },{
                type: 'display',
                folder: 'Controls',
                label: 'Scale',
                object: this,
                property: 'scale',
            },{
                type: 'checkbox',
                folder: 'Dev',
                label: 'Force loading all file in memory',
                object: this,
                property: 'forceLoadAllCheckbox',
            },{
                type: 'display',
                folder: 'Dev',
                label: 'Is playing',
                object: this,
                property: 'isPlaying',
            },{
                type: 'display',
                folder: 'Dev',
                label: 'Is EOF',
                object: this,
                property: 'isEof',
            },{
                type: 'display',
                folder: 'Dev',
                label: 'Iteration',
                object: this,
                property: 'numIteration',
            },{
                type: 'display',
                folder: 'Dev',
                label: 'Offset X',
                object: this,
                property: 'panningOffsetX',
            },{
                type: 'display',
                folder: 'Dev',
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

        let saveIsPlaying = false;
        Startup.slider.onmousedown = (ev: Event) => {
            saveIsPlaying = this.isPlaying;
            this.isPlaying = false;
        }
        Startup.slider.onmouseup = (ev: Event) => {
            this.selectedBody.reset();
            this.chart.deleteData();
            this.selectX = null;
            this.selectY = null;
            this.numIteration = parseInt(Startup.slider.value);
            this.isPlaying = saveIsPlaying;
        }
    }

    private async draw(time: number) : Promise<void> {
        this.stats.begin();

        let objects = await this.fileManager!.getBodies(this.numIteration);
        if(objects == null){
            this.pause();
            this.isEof = true;
        } else {
            this.drawStates(objects);
            this.isEof = false;
        }

        if(this.isPlaying) {
            Startup.slider.value = this.numIteration + "";
            this.numIteration++;
        } 
  
        this.reqId = window.requestAnimationFrame((time) => this.draw(time));

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

    private getColorFromInt(x: number) : string { // x is in [1, 10]
        let numColors = 10;
        let r = 255 * x / numColors;
        let b = 255 - r;
        return "rgb("+r+",0,"+b+")";
    }

    private VtoW(screenX : number, screenY: number) {
        let x = screenX * this.imatrix.a + screenY * this.imatrix.c + this.imatrix.e;
        let y = screenX * this.imatrix.b + screenY * this.imatrix.d + this.imatrix.f;
        return {x: x, y: y};
    }

    private drawStates( objects : Float32Array) {
        const numParams = FileManager.bodyNumParams;

        // Controllo se devo camabiare il centro degli assi
        if(this.axesBodyOffset.id != -1){
            for(let i=0; i<objects[FileManager.numIterationParam -1]; i++){
                // Prelevo gli attributi del body
                let id = objects[FileManager.numIterationParam + i * numParams + 0];
                let x = objects[FileManager.numIterationParam  + i * numParams + 1]; // posizione 1 dell'array
                let y = objects[FileManager.numIterationParam  + i * numParams + 2];
                // Mette l'offset dell'iterazione precednte
                if( this.axesBodyOffset.id == id){
                    this.axesBodyOffset.x = x;
                    this.axesBodyOffset.y = y;
                    break;
                } 
            }
        }
        let xBase = this.canvas.width/2 + this.panningOffsetX - this.axesBodyOffset.x*this.scale;
        let yBase = this.canvas.height/2 + this.panningOffsetY + this.axesBodyOffset.y*this.scale;

        // Reset scaling and clean screen
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.translate(xBase, yBase);
        this.context.scale(this.scale, -this.scale);
        this.imatrix = this.context.getTransform().inverse();
        this.context.beginPath();

        // Controllo che ci sia un'occorrenza del body selezionato
        let bodyIsIn = false;
        let fillColor = -1;
        for(let i=0; i<objects[FileManager.numIterationParam -1]; i++){
            // Prelevo gli attributi del body
            let id = objects[FileManager.numIterationParam + i * numParams + 0];
            let x = objects[FileManager.numIterationParam  + i * numParams + 1]; // posizione 1 dell'array
            let y = objects[FileManager.numIterationParam  + i * numParams + 2];
            let r = objects[FileManager.numIterationParam  + i * numParams + 3];
            let t = objects[FileManager.numIterationParam  + i * numParams + 4];

            // Se il corpo e' stato selezionato
            if( this.selectedBody.id == id && this.selectedBody.visible){
                this.selectedBody.x = x;
                this.selectedBody.y = y;
                this.selectedBody.radius = r;
                bodyIsIn = true;
            } 
            // E' stato premuto sullo schermo
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
                    bodyIsIn = true;
                } else {
                    bodyIsIn = false;
                }
            }


            // Draw            
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
        }
        this.context.closePath();
        this.context.fill();


        if( this.selectedBody.visible && bodyIsIn){ // Body selezionato
                this.context.beginPath();
                this.context.strokeStyle = "rgba(0,255,0,0.7)"; 
                this.context.lineWidth = 1.5;
                this.context.arc(this.selectedBody.x, this.selectedBody.y, this.selectedBody.radius + 4, 0, 2 * Math.PI);
                this.context.closePath();
                this.context.stroke();
                if(this.numIteration % 5 == 0)
                    Startup.trajectory.addCords(this.selectedBody.x-this.axesBodyOffset.x, this.selectedBody.y-this.axesBodyOffset.y);
        } else {
            this.selectedBody.setVisible(false);
            Startup.trajectory.clear();
        }

        // Aggiorno grafico ongni 10 frame
        if(this.isPlaying && this.numIteration % 20 == 0){ 
            let time : number = this.energyFile.getTime(this.numIteration);
            this.chart.updateChart([
                {x: time, y: this.energyFile.getEnergy(this.numIteration, 0)},
                {x: time, y: this.energyFile.getEnergy(this.numIteration, 1)},
                {x: time, y: this.energyFile.getEnergy(this.numIteration, 2)},
                {x: time, y: this.energyFile.getEnergy(this.numIteration, 3)},
                {x: time, y: this.energyFile.getEnergy(this.numIteration, 4)}
            ]);
        }
    }

    public play() {
        if(this.isEof) return;
        this.isPlaying = true;
        this.barContainer.innerText = "⏵";
    }

    public pause() {
        if(this.isEof) return;
        this.isPlaying = false;
        this.barContainer.innerText = "⏸";
    }

    public stop() {
        this.isEof = false;
        this.isPlaying = false;
        this.numIteration = 0;

        this.selectedBody.reset();
        this.axesBodyOffset.reset();
        this.selectX = null;
        this.selectY = null;

        this.chart.deleteData();
        this.barContainer.innerText = "⏹";
    }


    public playPause(){
        if(!this.isPlaying)
            this.play();
        else 
            this.pause();
    }

    public async reset(fileManager: FileManager | null= this.fileManager) {
        console.log("reset");
        this.barContainer.style.color = "#ffffff";
        this.barContainer.innerText = "";
        window.cancelAnimationFrame(this.reqId);
        this.stop();
        try {
            this.fileManager = fileManager
            await this.loadFile(fileManager);
        } catch (e) {
            console.error(e);
        }
        this.pause();
        this.draw(0);
        Startup.slider.value = "0";
        Startup.slider.max = fileManager!.getNumIterations() + "";
    }


    private async loadFile(fileManager: FileManager | null) : Promise<void> {
        Startup.gui.Loader(true);
        await fileManager!.init();
        this.energyFile = await fileManager!.getEnergies();
        await fileManager!.getBodies(0);
        /*if(this.forceLoadAllCheckbox){

        }*/
        Startup.gui.Loader(false);
        return;
    }

    public setPanningOffset(x: number, y: number){
        this.panningOffsetX = x;
        this.panningOffsetY = y;
    }

    public setSelected(x: number, y: number){
        this.selectX = x;
        this.selectY = y;
    }
}