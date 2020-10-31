class Startup {

    static mainCanvas : HTMLCanvasElement;
    static sideContainer : HTMLElement;
    static loop : Loop;

    public static main(): number {
        console.log('Main');
        Startup.mainCanvas = <HTMLCanvasElement> document.getElementById('main-canvas');

        window.onresize = Startup.onWindowResized;
        Startup.resize();
        Startup.loop = new Loop(Startup.mainCanvas);

        const fileSelector = <HTMLElement> document.getElementById('file-selector');
        fileSelector.addEventListener('change', async (event: Event) => {
            const target= event.target as HTMLInputElement;
            const file: File = (target.files as FileList)[0];
            // Start the loop
            Startup.loop.loadFile(file);
            Startup.loop.stop();
            Startup.loop.play();

        });

        const buttonStop = <HTMLElement> document.getElementById("stop-button");
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
        }
        
        return 0;
    }

    private static onWindowResized (event:UIEvent):void {
        Startup.resize();
    }

    public static resize ():void {
        Startup.mainCanvas.width = window.innerWidth*0.8;
        Startup.mainCanvas.height = window.innerHeight;
    }
}