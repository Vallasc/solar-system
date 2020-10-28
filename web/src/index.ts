class Startup {

    static mainCanvas : HTMLCanvasElement;
    static sideContainer : HTMLElement;
    static loop : Loop;

    public static main(): number {
        console.log('Main');
        Startup.mainCanvas = <HTMLCanvasElement> document.getElementById('main-canvas');

        window.onresize = Startup.onWindowResized;
        Startup.resize();

        let array : Array<Array<Body>> = [];
        for(let i=0; i<60*60; i++){
            let row = [];
            for(let j=0; j<5; j++)
                row.push(new Body({ x : j*100+i, y: j*100+i}));
            array.push(row);
        }
        console.log(array);
        Startup.loop = new Loop(Startup.mainCanvas, array);

        return 0;
    }

    private static onWindowResized (event:UIEvent):void {
        Startup.resize();
    }

    public static resize ():void {
        Startup.mainCanvas.width = window.innerWidth*0.7;
        Startup.mainCanvas.height = window.innerHeight;
    }

}

Startup.main();