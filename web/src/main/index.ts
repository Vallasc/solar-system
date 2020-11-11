declare var guify : any;
declare var Chart : any;

class Startup {

    static mainCanvas : HTMLCanvasElement;
    static axesCanvas : HTMLCanvasElement;
    static trajectoryCanvas : HTMLCanvasElement;
    static sideContainer : HTMLElement;
    static loop : Loop;
    static axes : Axes;
    static trajectory : Trajectory;
    static gui : any;
    static someNumber = 0;

    public static main(): number {
        Startup.createGui();

        console.log('Main');
        Startup.mainCanvas = <HTMLCanvasElement> document.getElementById('main-canvas');

        window.onresize = Startup.onWindowResized;

        Startup.trajectoryCanvas = <HTMLCanvasElement> document.getElementById('trajectory-canvas');
        Startup.trajectory = new Trajectory(Startup.trajectoryCanvas);
        
        Startup.axesCanvas = <HTMLCanvasElement> document.getElementById('axes-canvas');
        Startup.axes = new Axes(Startup.axesCanvas);
        Startup.axes.drawAxes();
        
        Startup.loop = new Loop(Startup.mainCanvas, Startup.gui);
        let mouseInput = new MouseInput(Startup.loop, Startup.axes, Startup.trajectory);

        Startup.resize();
        return 0;
    }

    public static createGui(){
        let guiContainer = document.getElementById("main-container");
        Startup.gui = new guify({
            title: 'Solar system',
            theme: 'light', // dark, light, yorha, or theme object
            align: 'right', // left, right
            width: 350,
            barMode: 'offset', // none, overlay, above, offset
            panelMode: 'inner',
            opacity: 0.9,
            root: guiContainer,
            open: true
        });
        Startup.gui.Register({
            type: 'file',
            label: 'File',
            onChange: async (file: any) => {
                await Startup.loop.reset(file);
            }
        })
        Startup.gui.Register([{
            type: 'folder',
            label: 'Controls',
            open: true
        },{
            type: 'folder',
            label: 'Selected',
            open: true
        },{
            type: 'folder',
            label: 'FPS',
            open: false
        }]);
        Startup.gui.Loader(false);
    }

    private static onWindowResized (event:UIEvent):void {
        Startup.resize();
    }

    public static resize ():void {
        Startup.mainCanvas.width = window.innerWidth;
        Startup.mainCanvas.height = window.innerHeight - 25;
        Startup.gui.panel.style += "overflow-y: scroll; height: 300px;"

        Startup.axesCanvas.width = window.innerWidth;
        Startup.axesCanvas.height = window.innerHeight - 25;
        Startup.axes.drawAxes();

        Startup.trajectoryCanvas.width = window.innerWidth;
        Startup.trajectoryCanvas.height = window.innerHeight - 25;
        //prova traiettoria
        
        Startup.trajectoryCanvas.width = window.innerWidth;
        Startup.trajectoryCanvas.height = window.innerHeight - 25;
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
}