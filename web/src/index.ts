declare var guify : any;
declare var _web_main : any; // Entry point wasm
declare var Module : any; // Entry point wasm

class Startup {
    static canvasMarginTop : number = 25;
    static canvasMarginRight : number = 350;

    static mainCanvas : HTMLCanvasElement;
    static axesCanvas : HTMLCanvasElement;
    static trajectoryCanvas : HTMLCanvasElement;
    static slider : HTMLInputElement;

    static loop : Loop;
    static axes : Axes;
    static conservation : Conservation;
    static trajectory : Trajectory;
    static fileManager : FileManager;
    static gui : any;

    static chart : LittleChart;
    static someNumber = 0;
    static file : File;

    static chartWindow : any = null

    public static main(): number {

        console.log('Main');
        Startup.slider = <HTMLInputElement> document.getElementById('slider');

        Startup.mainCanvas = <HTMLCanvasElement> document.getElementById('main-canvas');

        window.onresize = Startup.onWindowResized;

        Startup.trajectoryCanvas = <HTMLCanvasElement> document.getElementById('trajectory-canvas');
        Startup.trajectory = new Trajectory(Startup.trajectoryCanvas);
        
        Startup.axesCanvas = <HTMLCanvasElement> document.getElementById('axes-canvas');
        Startup.axes = new Axes(Startup.axesCanvas);

        Startup.loop = new Loop(Startup.mainCanvas, Startup.gui);
        let mouseInput = new MouseInput(Startup.loop, Startup.axes, Startup.trajectory);

        Startup.conservation = new Conservation();

        Startup.createGui(); // And resize

        return 0;
    }

    public static createGui(){
        let guiContainer = document.getElementById("main-container");
        Startup.gui = new guify({
            title: 'Solar system',
            theme: 'dark', // dark, light, yorha, or theme object
            align: 'right', // left, right
            width: Startup.canvasMarginRight,
            barMode: 'offset', // none, overlay, above, offset
            panelMode: 'inner',
            opacity: 0.9,
            root: guiContainer,
            open: true,
            onOpen: (value: boolean)=>{
                if(value){
                    Startup.canvasMarginRight = 350;
                } else {
                    Startup.canvasMarginRight = 0;
                }
                Startup.resize();
            }
        });
        Startup.gui.Register({
            type: 'file',
            label: 'File',
            onChange: async (file: any) => {
                Startup.file = file;
                Startup.fileManager = new FileManager(file);
                await Startup.loop.reset(Startup.fileManager);
                await Startup.axes.reset(Startup.fileManager);
                await Startup.conservation.reset(Startup.fileManager);
                if(Startup.chartWindow != null){
                    Startup.chartWindow.file = Startup.file;
                    Startup.chartWindow.reset();
                }
            }
        })
        Startup.gui.Register([{
            type: 'button',
            label: 'Play/Pause',
            streched: true,
            action: () => {
                Startup.loop.playPause();
            }
        },{
            type: 'button',
            label: 'Rewind',
            streched: true,
            action: () => {
                Startup.loop.reset();
            }
        },{
            type: 'folder',
            label: 'Conservation',
            open: true
        },{
            type: 'folder',
            folder: 'Conservation',
            label: 'Angular Momentum',
            open: false
        },{
            type: 'display',
            folder: 'Angular Momentum',
            label: 'Initial:',
            object: this.conservation,
            property: 'angMomStart'
        },{
            type: 'display',
            folder: 'Angular Momentum',
            label: 'Final:',
            object: this.conservation,
            property: 'angMomEnd'
        },{
            type: 'display',
            folder: 'Angular Momentum',
            label: 'Difference (%):',
            object: this.conservation,
            property: 'angMomErr'
        },{
            type: 'folder',
            folder: 'Conservation',
            label: 'Momentum x',
            open: false
        },{
            type: 'display',
            folder: 'Momentum x',
            label: 'Initial:',
            object: this.conservation,
            property: 'momentumStartX'
        },{
            type: 'display',
            folder: 'Momentum x',
            label: 'Final:',
            object: this.conservation,
            property: 'momentumEndX'
        },{
            type: 'folder',
            folder: 'Conservation',
            label: 'Momentum y',
            open: false
        },{
            type: 'display',
            folder: 'Momentum y',
            label: 'Initial:',
            object: this.conservation,
            property: 'momentumStartY'
        },{
            type: 'display',
            folder: 'Momentum y',
            label: 'Final:',
            object: this.conservation,
            property: 'momentumEndY'
        },{
            type: 'folder',
            folder: 'Conservation',
            label: 'Energy',
            open: false
        },{
            type: 'display',
            folder: 'Energy',
            label: 'Initial:',
            object: this.conservation,
            property: 'energyStart'
        },{
            type: 'display',
            folder: 'Energy',
            label: 'Final:',
            object: this.conservation,
            property: 'energyEnd'
        },{
            type: 'display',
            folder: 'Energy',
            label: 'Difference (%):',
            object: this.conservation,
            property: 'energyErr'
        },{
            type: 'display',
            label: 'Energy chart',
            element: Startup.loop.chart.container,
        },{
            type: 'button',
            label: 'Show charts',
            streched: true,
            action: () => {
                console.log(Startup.file);
                if(Startup.chartWindow != null){
                    Startup.chartWindow.close();
                }
                Startup.chartWindow = window.open("charts.html", "MsgWindow", "width=1100,height=900");
                Startup.chartWindow.addEventListener('load', () => {
                    Startup.chartWindow.file = Startup.file;
                    Startup.chartWindow.reset();
                }, false);
            }
        },{
            type: 'folder',
            label: 'Selected',
            open: true
        },{
            type: 'folder',
            label: 'Controls',
            open: true
        },{
            type: 'folder',
            label: 'FPS',
            open: false
        },{
            type: 'button',
            label: 'Run Main',
            streched: true,
            action: () => {
                //_web_main();
                //Startup.loop.resetArray(new Float32Array(Module.FS.readFile("sim0.bin").buffer))
            }
        }]);
        Startup.gui.Register(Startup.loop.guiPanel);
        Startup.gui.Loader(false);
        Startup.loop.barContainer = <HTMLElement> document.getElementById("guify-bar-container");
    }

    private static onWindowResized (event:UIEvent):void {
        Startup.resize();
    }

    public static resize ():void {
        Startup.mainCanvas.width = window.innerWidth - Startup.canvasMarginRight;
        Startup.mainCanvas.height = window.innerHeight - Startup.canvasMarginTop;
        Startup.mainCanvas.style.marginRight = Startup.canvasMarginRight + "px";
        Startup.mainCanvas.style.marginTop = Startup.canvasMarginTop + "px";
        //Startup.gui.panel.style += "overflow-y: scroll; height: 300px;"

        Startup.axesCanvas.width = window.innerWidth - Startup.canvasMarginRight;
        Startup.axesCanvas.height = window.innerHeight - Startup.canvasMarginTop;
        Startup.axesCanvas.style.marginRight = Startup.canvasMarginRight + "px";
        Startup.axesCanvas.style.marginTop = Startup.canvasMarginTop + "px";
        Startup.axes.drawAxes();

        Startup.trajectoryCanvas.width = window.innerWidth - Startup.canvasMarginRight;
        Startup.trajectoryCanvas.height = window.innerHeight - Startup.canvasMarginTop;
        Startup.trajectoryCanvas.style.marginRight = Startup.canvasMarginRight + "px";
        Startup.trajectoryCanvas.style.marginTop = Startup.canvasMarginTop + "px";

        Startup.slider.style.width = window.innerWidth - Startup.canvasMarginRight - 4 + "px";
    }

}

class MouseInput {
    private loop: Loop;
    private axes: Axes;
    private trajectory: Trajectory;
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


    constructor(loop: Loop, axes: Axes, trajectory : Trajectory){
        this.loop = loop;
        this.axes = axes;
        this.trajectory = trajectory;
        this.canvas = loop.canvas;
        this.canvas.addEventListener("mousedown", (e: MouseEvent)=>this.startPan(e, this));
        this.mouseMoveListener = (e: MouseEvent) => this.pan(e, this)
        this.mouseUpListener = (e: MouseEvent) => this.endPan(e, this)
        this.loop.setPanningOffset(0,0);
    }

    private startPan(e: MouseEvent, self: MouseInput) {
        if(self.panning) return;
        self.panning = true;
        //console.log("start pan");
        self.canvas.addEventListener("mousemove", self.mouseMoveListener);
        self.canvas.addEventListener("mouseup", self.mouseUpListener);
        self.canvas.addEventListener("mouseleave", self.mouseUpListener);

        self.panningStartX = e.clientX;
        self.panningStartY = e.clientY;
    }

    private pan(e: MouseEvent, self: MouseInput) {
        self.panningOffsetX = e.clientX - self.panningStartX;
        self.panningOffsetY = e.clientY - self.panningStartY;
        self.loop.setPanningOffset(self.globalOffsetX + self.panningOffsetX, self.globalOffsetY + self.panningOffsetY);
        self.axes.setPanningOffset(self.globalOffsetX + self.panningOffsetX, self.globalOffsetY + self.panningOffsetY);
        self.trajectory.setPanningOffset(self.globalOffsetX + self.panningOffsetX, self.globalOffsetY + self.panningOffsetY);
    }

    private endPan(e: MouseEvent, self: MouseInput) {
        self.panning = false;
        self.globalOffsetX += self.panningOffsetX;
        self.globalOffsetY += self.panningOffsetY;
        self.canvas.removeEventListener("mousemove", self.mouseMoveListener);
        self.canvas.removeEventListener("mouseup", self.mouseUpListener);
        self.canvas.removeEventListener("mouseleave", self.mouseUpListener);
        
        if(self.panningStartX == e.clientX && self.panningStartY == e.clientY)
            self.click(self, e.clientX, e.clientY);
    }

    private click(self: MouseInput, x: number, y: number){
        self.loop.setSelected(x, y - 25) // TODO aggiustare 25
    }

    public setOffset(x: number, y: number) {
        this.globalOffsetX = x;this
        this.globalOffsetY = y;
        this.loop.setPanningOffset(this.globalOffsetX, this.globalOffsetY);
        this.axes.setPanningOffset(this.globalOffsetX, this.globalOffsetY);
        this.trajectory.setPanningOffset(this.globalOffsetX, this.globalOffsetY);
    }
}