declare var guify : any;
declare var Chart : any;

class Startup {

    static mainCanvas : HTMLCanvasElement;
    static sideContainer : HTMLElement;
    static loop : Loop;
    static gui : any;
    static someNumber = 0;

    public static main(): number {
        Startup.createGui();
        
        //prova grafico
        let canvas = document.createElement("canvas");
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
        })
        console.log('Main');
        Startup.mainCanvas = <HTMLCanvasElement> document.getElementById('main-canvas');

        window.onresize = Startup.onWindowResized;
        Startup.resize();
        Startup.loop = new Loop(Startup.mainCanvas, Startup.gui);

        /*const fileSelector = <HTMLElement> document.getElementById('file-selector');
        fileSelector.addEventListener('change', async (event: Event) => {
            const target= event.target as HTMLInputElement;
            const file: File = (target.files as FileList)[0];
            // Start the loop
            Startup.loop.loadFile(file);
            Startup.loop.stop();
            Startup.loop.play();

        });*/

        /*const buttonStop = <HTMLElement> document.getElementById("stop-button");
        buttonStop.onclick = ()=>{
            Startup.loop.stop();
        }

        const buttonPlay = <HTMLElement> document.getElementById("play-button");
        buttonPlay.onclick = ()=>{
            Startup.loop.playPause();
        }

        const realtimeBox = <HTMLInputElement> document.getElementById("realtime-box");
        realtimeBox.checked = false;
        realtimeBox.onchange = ()=>{
            Startup.loop.setReadingMode(realtimeBox.checked);
        }*/
        
        return 0;
    }

    public static createGui(){
        let guiContainer = document.getElementById("main-container");
        Startup.gui = new guify({
            title: 'Solar system',
            theme: 'dark', // dark, light, yorha, or theme object
            align: 'right', // left, right
            width: 300,
            barMode: 'offset', // none, overlay, above, offset
            panelMode: 'inner',
            opacity: 0.95,
            root: guiContainer,
            open: true
        });
        Startup.gui.Register({
            type: 'file',
            label: 'File',
            onChange: (data: any) => {
                Startup.loop.loadFile(data);
                Startup.loop.stop();
                Startup.loop.play();
            }
        })
        Startup.gui.Register({
            type: 'folder',
            label: 'Controls',
            open: true
        });
        Startup.gui.Register([
            {
                type: 'button',
                label: 'Play/Pause',
                folder: 'Controls',
                streched: true,
                action: () => {
                    Startup.loop.playPause();
                }
            },{
                type: 'button',
                label: 'Stop',
                folder: 'Controls',
                action: () => {
                    Startup.loop.stop();
                }
            }
        ]);
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
    }

    private static onWindowResized (event:UIEvent):void {
        Startup.resize();
    }

    public static resize ():void {
        Startup.mainCanvas.width = window.innerWidth;
        Startup.mainCanvas.height = window.innerHeight;
    }

}