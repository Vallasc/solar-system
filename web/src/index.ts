class Startup {

    static mainCanvas : HTMLCanvasElement;
    static sideContainer : HTMLElement;
    static loop : Loop | null;
    static bodies : Array<Array<Body>> = [];

    public static main(): number {
        console.log('Main');
        Startup.mainCanvas = <HTMLCanvasElement> document.getElementById('main-canvas');

        window.onresize = Startup.onWindowResized;
        Startup.resize();

        /*let array : Array<Array<Body>> = [];
        for(let i=0; i<60*60; i++){
            let row = [];
            for(let j=0; j<5; j++)
                row.push(new Body({ x : j*100+i, y: j*100+i}));
            array.push(row);
        }*/
        const fileSelector = <HTMLElement> document.getElementById('file-selector');
        fileSelector.addEventListener('change', (event: Event) => {
            const target= event.target as HTMLInputElement;
            const file: File = (target.files as FileList)[0];

            let fr = new FileReader(); 
            fr.onload=function(){ 
                Startup.bodies = Deserializer.parseJson(<string> fr.result);
                console.log(Startup.bodies);
                Startup.loop = null;
                Startup.loop = new Loop(Startup.mainCanvas, Startup.bodies);
            } 
              
            fr.readAsText(file); 
        });
        const buttonPlay = <HTMLElement> document.getElementById("play-button");
        buttonPlay.onclick = ()=>{
            Startup.loop!.reset();
        }
        //console.log(array);
        //Startup.loop = new Loop(Startup.mainCanvas, array);

        //let d = new Deserializer();
        //d.getJson("bodies.json");
        
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

Startup.main();