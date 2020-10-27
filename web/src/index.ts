class Startup {

    static mainCanvas : HTMLCanvasElement;
    static sideContainer : HTMLElement;

    public static main(): number {
        console.log('Main');
        Startup.mainCanvas = <HTMLCanvasElement> document.getElementById('main-canvas');

        window.onresize = Startup.onWindowResized;
        Startup.resize();

        let b = new Body({ x : 3, y: 4});
        b.print();

        return 0;
    }

    private static onWindowResized (event:UIEvent):void {
        Startup.resize();
    }

    public static resize ():void {
        Startup.mainCanvas.width = window.innerWidth*0.7;
        Startup.mainCanvas.height = window.innerHeight;
        let ctx = <CanvasRenderingContext2D> Startup.mainCanvas.getContext("2d");
        ctx.fillRect(20, 20, 100, 100);
    }

}

Startup.main();