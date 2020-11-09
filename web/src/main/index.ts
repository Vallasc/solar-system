declare var guify : any;
declare var Chart : any;

class Startup {

    static mainCanvas : HTMLCanvasElement;
    static axesCanvas : HTMLCanvasElement;
    static sideContainer : HTMLElement;
    static loop : Loop;
    static axes : Axes;
    static gui : any;
    static someNumber = 0;

    public static main(): number {
        Startup.createGui();
        
        //prova grafico
        /*let canvas = document.createElement("canvas");
        canvas.height = 300;
        var ctx = canvas.getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });

        let i : number;
        let data : Array<number>;
        let time : Array<number>;
        let dt : number = 0.09;
        let val : number = 110900;
        let n: number;
        let pause : number = 0;
        data = [115828, 115928, 105828, 105838, 110828, 110928, 111828, 111929];
        time =[0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08];
        let chart = new Mychart(canvas, time, data);
        for (i = 0; i < 10; i++) {
            n = setTimeout(function () { 
                time.shift();
                dt = +(Math.round(dt * 100) / 100).toFixed(2);
                time.push(dt);
                chart.updateChart(val);
                dt += 0.01;
                val += Math.random() * (500 - (-500)) + (-500);
            }, pause);
            pause += 1000;
        }
        
        
        Startup.gui.Register({
            type: 'display',
            label: 'Kinetic energy',
            folder: "Charts",
            element: canvas,
        })*/


        console.log('Main');
        Startup.mainCanvas = <HTMLCanvasElement> document.getElementById('main-canvas');

        window.onresize = Startup.onWindowResized;

        Startup.axesCanvas = <HTMLCanvasElement> document.getElementById('axes-canvas');
        Startup.axes = new Axes(Startup.axesCanvas);
        Startup.axes.drawAxes();
        
        Startup.loop = new Loop(Startup.mainCanvas, Startup.gui);
        let mouseInput = new MouseInput(Startup.loop);

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
        Startup.gui.Register({
            type: 'folder',
            label: 'Controls',
            open: true
        });
        Startup.gui.Register({
            type: 'folder',
            label: 'FPS',
            open: false
        });
        Startup.gui.Register({
            type: 'folder',
            label: 'Charts',
            open: false
        });
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