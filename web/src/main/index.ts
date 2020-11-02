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
        
        
        let canvas = document.createElement("canvas");
        canvas.height = 900;
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
        let mouseInput = new MouseInput(Startup.loop);

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
        Startup.mainCanvas.height = window.innerHeight;
        Startup.gui.panel.style += "overflow-y: scroll; height: 300px;"
    }

}