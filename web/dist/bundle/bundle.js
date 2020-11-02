"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Body {
    constructor({ x = 0, y = 0, vX = 0, vY = 0, accX = 0, accY = 0, radius = 1, mass = 0, k_energy = 0, internal_energy = 0 } = {}) {
        this.x = 0;
        this.y = 0;
        this.vX = 0;
        this.vY = 0;
        this.accX = 0;
        this.accY = 0;
        this.radius = 0;
        this.mass = 0;
        this.k_energy = 0;
        this.internal_energy = 0;
        this.x = x;
        this.y = y;
        this.vX = vX;
        this.vY = vY;
        this.accX = accX;
        this.accY = accY;
        this.radius = radius;
        this.mass = mass;
        this.k_energy = k_energy;
        this.internal_energy = internal_energy;
    }
    drawOnCanvas(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.restore();
    }
    print() {
        console.log(`x: ${this.x}, y: ${this.y}`);
    }
}
class Deserializer {
    /*public static parseJsonFifo(blob: string): Fifo<any> {
      let json = JSON.parse(blob);
      let fifo: Fifo<any> = new Fifo();
      for(let i = 0; i<json.states.length; i++) {
        fifo.push(json.states[i]);
      }
      return fifo;
    }*/
    static parseJsonFloat64Array(blob) {
        let numParams = 5;
        try {
            let json = JSON.parse(blob);
            console.log(json);
            let fifo = new Fifo();
            for (let i = 0; i < json.states.length; i++) {
                let len = json.states[i].p.length + 1;
                let objects = new Float64Array(len * numParams);
                objects[0] = len;
                for (let j = 0; j < len - 1; j++) {
                    objects[(j + 1) * numParams] = json.states[i].p[j].x;
                    objects[(j + 1) * numParams + 1] = json.states[i].p[j].y;
                    objects[(j + 1) * numParams + 2] = Deserializer.roundTo1(json.states[i].p[j].r);
                    objects[(j + 1) * numParams + 3] = json.states[i].p[j].k;
                    objects[(j + 1) * numParams + 4] = json.states[i].p[j].i;
                }
                fifo.push(objects);
            }
            return fifo;
        }
        catch (e) {
            throw Error("Failed parsing file");
        }
    }
    static roundTo1(x) {
        if (x > 0 && x < 1)
            return 1;
        else
            return x;
    }
}
class Fifo {
    constructor() {
        this.size = 0;
        this.first = null;
        this.last = null;
    }
    push(element) {
        if (this.size == 0) {
            let e = new FifoElement(element, null);
            this.first = e;
            this.last = e;
        }
        else {
            let e = new FifoElement(element, null);
            this.last.next = e;
            this.last = e;
        }
        this.size++;
    }
    pop() {
        if (this.size == 0) {
            return null;
        }
        else if (this.size == 1) {
            let e = this.first.element;
            this.first = null;
            this.last = null;
            this.size--;
            return e;
        }
        else {
            let e = this.first.element;
            this.first = this.first.next;
            this.size--;
            return e;
        }
    }
    clear() {
        this.size = 0;
        this.first = null;
        this.last = null;
    }
}
class FifoElement {
    constructor(element, next) {
        this.next = null;
        this.element = null;
        this.element = element;
        this.next = next;
    }
}
class FileStreamer {
    constructor(file) {
        this.file = file;
        this.offset = 0;
        this.defaultChunkSize = 64 * 1024; // bytes
        this.rewind();
    }
    rewind() {
        this.offset = 0;
    }
    isEndOfFile() {
        return this.offset >= this.getFileSize();
    }
    readBlockAsText(length = this.defaultChunkSize) {
        const fileReader = new FileReader();
        const blob = this.file.slice(this.offset, this.offset + length);
        this.file.stream;
        return new Promise((resolve, reject) => {
            fileReader.onloadend = (event) => {
                const target = (event.target);
                if (target.error == null) {
                    const result = target.result;
                    this.offset += result.length;
                    this.testEndOfFile();
                    resolve(result);
                }
                else {
                    reject(target.error);
                }
            };
            fileReader.readAsText(blob);
        });
    }
    testEndOfFile() {
        if (this.isEndOfFile()) {
            console.log('Done reading file');
        }
    }
    getFileSize() {
        return this.file.size;
    }
}
class JsonStreamer {
    constructor(fs) {
        this.initialSequenceSize = 12;
        this.initialSequenceElementSize = 16;
        this.afterElementSize = 1;
        this.fs = fs;
        this.buffer = "";
        this.chunkSize = 200;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.fs.isEndOfFile())
                return null;
            let s = yield this.fs.readBlockAsText(this.initialSequenceSize);
            console.log(s);
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.fs.isEndOfFile()) {
                let s1 = yield this.fs.readBlockAsText(this.initialSequenceElementSize);
                console.log(s1);
                if (s1 == ']}')
                    return null;
                let n = parseInt(s1.slice(8, 16)) || null;
                if (n == null)
                    return null;
                console.log(n);
                let s2 = yield this.fs.readBlockAsText(n - this.initialSequenceElementSize + this.afterElementSize);
                console.log(s1 + s2);
                return JSON.parse(s1 + s2.slice(0, -1));
            }
            return null;
        });
    }
}
class Gui {
    constructor() {
    }
}
class Startup {
    static main() {
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
        Startup.mainCanvas = document.getElementById('main-canvas');
        window.onresize = Startup.onWindowResized;
        Startup.resize();
        Startup.loop = new Loop(Startup.mainCanvas, Startup.gui);
        let mouseInput = new MouseInput(Startup.loop);
        return 0;
    }
    static createGui() {
        let guiContainer = document.getElementById("main-container");
        Startup.gui = new guify({
            title: 'Solar system',
            theme: 'light',
            align: 'right',
            width: 350,
            barMode: 'offset',
            panelMode: 'inner',
            opacity: 0.9,
            root: guiContainer,
            open: true
        });
        Startup.gui.Register({
            type: 'file',
            label: 'File',
            onChange: (file) => __awaiter(this, void 0, void 0, function* () {
                yield Startup.loop.reset(file);
            })
        });
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
    static onWindowResized(event) {
        Startup.resize();
    }
    static resize() {
        Startup.mainCanvas.width = window.innerWidth;
        Startup.mainCanvas.height = window.innerHeight;
        Startup.gui.panel.style += "overflow-y: scroll; height: 300px;";
    }
}
Startup.someNumber = 0;
class Loop {
    constructor(canvas, gui) {
        this.panningOffsetX = 0;
        this.panningOffsetY = 0;
        this.loadAllFile = true;
        this.forceLoadAllCheckbox = false;
        this.isPlaying = false;
        this.isEof = false;
        this.reqId = -1;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.file = new File([], "");
        this.buffer = new Fifo();
        this.lastObjects = null;
        this.worker = new Worker('./dist/worker/worker.js');
        this.workerIsStopped = true;
        this.workerTimeout = 0;
        this.workerIntervalTime = 200;
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats.dom.style = "margin-left: 100px;";
        Startup.gui.Register([
            {
                type: 'display',
                label: '',
                folder: "FPS",
                element: this.stats.dom,
            },
            {
                type: 'button',
                label: 'Play/Pause',
                folder: 'Controls',
                streched: true,
                action: () => {
                    this.playPause();
                }
            }, {
                type: 'button',
                label: 'Rewind',
                folder: 'Controls',
                streched: true,
                action: () => {
                    this.reset();
                }
            },
            {
                type: 'checkbox',
                folder: 'Controls',
                label: 'Force loading all file in memory',
                object: this,
                property: 'forceLoadAllCheckbox',
            },
            {
                type: 'display',
                folder: 'Controls',
                label: 'Is playing',
                object: this,
                property: 'isPlaying',
            },
            {
                type: 'display',
                folder: 'Controls',
                label: 'Is EOF',
                object: this,
                property: 'isEof',
            }
        ]);
        this.barContainer = document.getElementById("guify-bar-container");
    }
    draw() {
        this.stats.begin();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "white";
        this.setMatrix(this.canvas.width / 2 + this.panningOffsetX, this.canvas.height / 2 + this.panningOffsetY, 1, 0);
        if (this.lastObjects == null || this.isPlaying) { //Disegno il primo frame sempre o qundo e'play
            let objects = this.buffer.pop();
            if (objects != null && !this.isEof) {
                this.drawStates(objects);
                this.lastObjects = objects;
            }
            else {
                this.isEof = true;
                this.isPlaying = false;
                this.barContainer.innerText = "⏹";
            }
        }
        else if (this.lastObjects != null)
            this.drawStates(this.lastObjects);
        this.reqId = window.requestAnimationFrame(() => this.draw());
        this.stats.end();
    }
    setMatrix(x, y, scale, rotate) {
        var xAx = Math.cos(rotate) * scale; // the x axis x
        var xAy = Math.sin(rotate) * scale; // the x axis y
        this.context.setTransform(xAx, xAy, -xAy, -xAx, x, y);
    }
    /*private drawStatesImageData(pixels: Uint8ClampedArray, canvasWidth: number, canvasHeight: number){
        if(this.buffer != null){
            let el = this.buffer.pop();
            //console.log(this.buffer.size);
            if(el == null) return;
            for(let i=0; i<el.p.length; i++){
                if(el.p[i].x < canvasWidth && el.p[i].x >0 && el.p[i].y < canvasWidth && el.p[i].y >0){
                    let r = 255;
                    let g = 255;
                    let b = 255;
                    var off = (el.p[i].y * canvasWidth + el.p[i].x) * 4;
                    pixels[off] = r;
                    pixels[off + 1] = g;
                    pixels[off + 2] = b;
                    pixels[off + 3] = 255;
                }
            }
        } else {
            this.state = 0;
        }
    }*/
    drawStates(objects) {
        let numParams = 5;
        //console.log(this.buffer.size);
        this.context.beginPath();
        for (let i = 1; i <= objects[0]; i++) {
            this.context.moveTo(objects[i * numParams], objects[i * numParams + 1]);
            this.context.arc(objects[i * numParams], objects[i * numParams + 1], objects[i * numParams + 2], 0, 2 * Math.PI);
        }
        this.context.fill();
    }
    play() {
        if (this.isPlaying || this.isEof)
            return;
        if (!this.loadAllFile) {
            this.requestData();
        }
        this.isPlaying = true;
        this.barContainer.innerText = "⏵";
    }
    pause() {
        if (!this.isPlaying || this.isEof)
            return;
        if (!this.loadAllFile) {
            clearTimeout(this.workerTimeout);
        }
        this.isPlaying = false;
        this.barContainer.innerText = "⏸";
    }
    playPause() {
        if (!this.isPlaying)
            this.play();
        else
            this.pause();
    }
    reset(file = this.file) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("reset");
            this.barContainer.innerText = "";
            window.cancelAnimationFrame(this.reqId);
            if (!this.loadAllFile) {
                clearTimeout(this.workerTimeout);
                console.log(this.workerIsStopped);
                while (!this.workerIsStopped) { // Aspetto la fine del worker
                    yield new Promise((resolve) => { setTimeout(() => { resolve(); }, 100); });
                }
                this.workerIntervalTime = 200;
                this.worker.postMessage({ "type": "stop" });
            }
            // Reset variabili
            this.isEof = false;
            this.isPlaying = false;
            this.buffer.clear();
            this.lastObjects = null;
            try {
                this.file = file;
                yield this.loadFile(file);
                console.log("File loaded");
            }
            catch (e) {
                console.error(e);
            }
            if (!this.loadAllFile) {
                this.requestData(true);
                while (!this.workerIsStopped) { // Aspetto la fine del worker
                    yield new Promise((resolve) => { setTimeout(() => { resolve(); }, 100); });
                }
            }
            this.barContainer.innerText = "⏹";
            this.draw();
            //this.play();
        });
    }
    requestData(once = false) {
        if (this.workerIsStopped) {
            console.log("request");
            //console.log(this.buffer.size);
            if (this.buffer.size < 600) {
                this.worker.postMessage({ "type": "read" });
                this.workerIsStopped = false;
            }
            else {
                this.workerIntervalTime += this.workerIntervalTime * 1 / 3;
            }
        }
        if (once)
            return;
        this.workerTimeout = setTimeout(() => {
            this.requestData();
        }, this.workerIntervalTime);
    }
    loadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            Startup.gui.Loader(true);
            if (this.file.size < 100000000 || this.forceLoadAllCheckbox) { //100MB this.fastMode
                this.loadAllFile = true;
                try {
                    this.buffer = yield this.loadFileAll(file);
                }
                catch (e) {
                    throw Error("Failed loading file");
                }
            }
            else {
                this.loadAllFile = false;
                this.loadFileChunck(file);
            }
            Startup.gui.Loader(false);
            return;
        });
    }
    loadFileAll(file) {
        return __awaiter(this, void 0, void 0, function* () {
            let reader = new FileReader();
            reader.readAsText(file);
            return new Promise((resolve, reject) => {
                reader.onload = function (event) {
                    try {
                        let buffer = Deserializer.parseJsonFloat64Array(reader.result);
                        resolve(buffer);
                    }
                    catch (e) {
                        reject(e);
                    }
                };
            });
        });
    }
    loadFileChunck(file) {
        this.worker.postMessage({ "type": "file", "data": file });
        this.worker.onmessage = (event) => {
            let response = event.data;
            // Sto ricevendo dei messaggi del vecchio file
            if (response.fileName != this.file.name)
                return;
            // Controllo se il worker ha finito il job
            this.workerIsStopped = response.endChunck;
            if (response.endFile) {
                clearTimeout(this.workerTimeout);
                this.buffer.push(null);
                return;
            }
            if (response.array != null) {
                this.buffer.push(response.array);
                this.workerIntervalTime = response.time * response.numIt / 2;
                return;
            }
        };
    }
    setPanningOffset(x, y) {
        this.panningOffsetX = x;
        this.panningOffsetY = y;
    }
}
class MouseInput {
    constructor(loop) {
        this.globalScale = 1;
        this.globalOffsetX = 0;
        this.globalOffsetY = 0;
        this.panningStartX = 0;
        this.panningStartY = 0;
        this.panningOffsetX = 0;
        this.panningOffsetY = 0;
        this.panning = false;
        this.mouseMoveListener = null;
        this.mouseUpListener = null;
        this.loop = loop;
        this.canvas = loop.canvas;
        this.canvas.addEventListener("mousedown", (e) => this.startPan(e, this));
        this.mouseMoveListener = (e) => this.pan(e, this);
        this.mouseUpListener = (e) => this.endPan(e, this);
        this.loop.setPanningOffset(0, 0);
    }
    startPan(e, self) {
        if (self.panning)
            return;
        self.panning = true;
        self.canvas.addEventListener("mousemove", self.mouseMoveListener);
        self.canvas.addEventListener("mouseup", self.mouseUpListener);
        self.canvas.addEventListener("mouseleave", self.mouseUpListener);
        self.panningStartX = e.clientX;
        self.panningStartY = e.clientY;
    }
    pan(e, self) {
        self.panningOffsetX = e.clientX - self.panningStartX;
        self.panningOffsetY = e.clientY - self.panningStartY;
        self.loop.setPanningOffset(self.globalOffsetX + self.panningOffsetX, self.globalOffsetY + self.panningOffsetY);
    }
    endPan(e, self) {
        self.panning = false;
        self.globalOffsetX += self.panningOffsetX;
        self.globalOffsetY += self.panningOffsetY;
        self.canvas.removeEventListener("mousemove", self.mouseMoveListener);
        self.canvas.removeEventListener("mouseup", self.mouseUpListener);
        self.canvas.removeEventListener("mouseleave", self.mouseUpListener);
    }
}
class Mychart {
    constructor(canvas, time, data) {
        this.canvas = canvas;
        this.canvas.height = 400;
        this.context = canvas.getContext("2d");
        this.chart = new Chart(this.context, {
            type: 'line',
            data: {
                labels: time,
                datasets: [{
                        data: data,
                        label: "Body",
                        borderColor: "#3e95cd",
                        fill: false
                    }
                ]
            },
            options: {
                scales: {
                    yAxes: [{
                            ticks: {
                                suggestedMax: 116000,
                                suggestedMin: 109000
                            }
                        }]
                },
                //options to remove animation
                animation: {
                    duration: 0 // general animation time
                },
                hover: {
                    animationDuration: 0 // duration of animations when hovering an item
                },
                responsiveAnimationDuration: 0,
                title: {
                    display: true,
                    text: 'Evolution of Internal Energy'
                }
            }
        });
    }
    updateChart(data) {
        var _a;
        //this.chart.data.labels?.shift();
        //this.chart.data.labels?.push(); 
        (_a = this.chart.data.datasets) === null || _a === void 0 ? void 0 : _a.forEach((dataset) => {
            var _a, _b;
            (_a = dataset.data) === null || _a === void 0 ? void 0 : _a.shift();
            (_b = dataset.data) === null || _b === void 0 ? void 0 : _b.push(data);
        });
        this.chart.update();
    }
}
//# sourceMappingURL=bundle.js.map