declare var guify : any;

class Startup {
    static canvasMarginTop : number = 25;
    static canvasMarginRight : number = 350;

    static mainCanvas : HTMLCanvasElement;
    static axesCanvas : HTMLCanvasElement;
    static trajectoryCanvas : HTMLCanvasElement;
    static slider : HTMLInputElement;
    static mouseEvents : MouseInput;

    static loop : Loop;
    static axes : Axes;
    static conservation : Conservation;
    static trajectory : Trajectory;
    static fileManager : FileManager | null = null;
    static gui : any;

    static chart : LittleChart;
    static file : File;

    static chartWindow : any = null
    static simulation : Simulator;

    static simSelection : string;

    public static main(): number {

        console.log('Solar system');
        Startup.slider = <HTMLInputElement> document.getElementById('slider');

        Startup.mainCanvas = <HTMLCanvasElement> document.getElementById('main-canvas');

        window.onresize = Startup.onWindowResized;

        Startup.trajectoryCanvas = <HTMLCanvasElement> document.getElementById('trajectory-canvas');
        Startup.trajectory = new Trajectory(Startup.trajectoryCanvas);
        
        Startup.axesCanvas = <HTMLCanvasElement> document.getElementById('axes-canvas');
        Startup.axes = new Axes(Startup.axesCanvas);

        Startup.loop = new Loop(Startup.mainCanvas);
        Startup.mouseEvents = new MouseInput(Startup.loop, Startup.axes, Startup.trajectory);

        Startup.conservation = new Conservation();
        Startup.simulation = new Simulator();

        Startup.createGui(); // And resize

        return 0;
    }

    public static async readFile(file: File){
        Startup.file = file;
        if( Startup.fileManager != null )
            Startup.fileManager.close(); 
        Startup.fileManager = new FileManager(file);

        Startup.gui.Loader(true);
        try {
            await Startup.fileManager.init();

            await Startup.loop.reset(Startup.fileManager);
            await Startup.axes.reset(Startup.fileManager);
            await Startup.conservation.reset(Startup.fileManager);

            if(Startup.chartWindow != null){
                Startup.chartWindow.file = Startup.file;
                Startup.chartWindow.reset();
            }
        } catch (e) {
            console.error(e);
        } finally {
            Startup.gui.Loader(false);
        }
    }

    public static async createGui(){
        let examples = await (await fetch("../examples/info.json")).json();
        console.log(examples);
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
        Startup.gui.Register([{
            type: 'file',
            label: 'File',
            onChange: async (file: any) => {
                Startup.readFile(file);
            }
        },{
            type: 'select',
            label: 'Prepared simulations',
            property: 'simSelection',
            options: ['Option 1', 'Option 2'],
            onChange: (data: any) => {
            }
        },{
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
            label: 'Simulator',
            open: false
        },{
            type: 'folder',
            label: 'Dev',
            open: false
        },{
            type: 'button',
            label: 'Run simulator',
            streched: true,
            folder: 'Simulator',
            action: async () => {
                Startup.gui.Loader(true);
                let file = await Startup.simulation.runMain();
                Startup.gui.Loader(false);

                var link = window.document.createElement('a');
                link.href = window.URL.createObjectURL(file);
                link.download = file.name; 
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                Startup.readFile(file);
            }
        }]);
        Startup.gui.Register(Startup.loop.guiPanel);
        Startup.gui.Register(Startup.simulation.guiPanel);
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