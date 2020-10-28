"use strict";
var Startup = /** @class */ (function () {
    function Startup() {
    }
    Startup.main = function () {
        console.log('Main');
        Startup.mainCanvas = document.getElementById('main-canvas');
        window.onresize = Startup.onWindowResized;
        Startup.resize();
        /*let array : Array<Array<Body>> = [];
        for(let i=0; i<60*60; i++){
            let row = [];
            for(let j=0; j<5; j++)
                row.push(new Body({ x : j*100+i, y: j*100+i}));
            array.push(row);
        }*/
        var fileSelector = document.getElementById('file-selector');
        fileSelector.addEventListener('change', function (event) {
            var target = event.target;
            var file = target.files[0];
            var fr = new FileReader();
            fr.onload = function () {
                Startup.bodies = Deserializer.parseJson(fr.result);
                console.log(Startup.bodies);
                Startup.loop = null;
                Startup.loop = new Loop(Startup.mainCanvas, Startup.bodies);
            };
            fr.readAsText(file);
        });
        var buttonPlay = document.getElementById("play-button");
        buttonPlay.onclick = function () {
            Startup.loop.reset();
        };
        //console.log(array);
        //Startup.loop = new Loop(Startup.mainCanvas, array);
        //let d = new Deserializer();
        //d.getJson("bodies.json");
        return 0;
    };
    Startup.onWindowResized = function (event) {
        Startup.resize();
    };
    Startup.resize = function () {
        Startup.mainCanvas.width = window.innerWidth * 0.8;
        Startup.mainCanvas.height = window.innerHeight;
    };
    Startup.bodies = [];
    return Startup;
}());
Startup.main();
//# sourceMappingURL=index.js.map