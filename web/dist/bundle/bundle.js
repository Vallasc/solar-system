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
class Axes {
    constructor(canvas) {
        this.panningOffsetX = 0;
        this.panningOffsetY = 0;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
    }
    drawAxes() {
        let w = this.canvas.width;
        let h = this.canvas.height;
        let dist_grids = 10; //distance between grids
        let offX = 0;
        let offY = 0;
        let margin = 20;
        if (this.panningOffsetX >= (w * 0.5) - margin)
            offX = (w * 0.5) - margin;
        else if (this.panningOffsetX <= margin - (w * 0.5))
            offX = margin - (w * 0.5);
        else
            offX = this.panningOffsetX;
        if (this.panningOffsetY >= (h * 0.5) - margin)
            offY = (h * 0.5) - margin;
        else if (this.panningOffsetY <= margin - (h * 0.5))
            offY = margin - (h * 0.5);
        else
            offY = this.panningOffsetY;
        this.context.clearRect(0, 0, w, h);
        this.context.strokeStyle = "rgba(255,0,0,0.5)";
        this.context.lineWidth = 2;
        // Draw >  
        this.context.beginPath();
        this.context.moveTo(w - 15, offY + h * 0.5 - 10);
        this.context.lineTo(w, offY + h * 0.5);
        this.context.lineTo(w - 15, offY + h * 0.5 + 10);
        this.context.stroke();
        // Draw ^ 
        this.context.beginPath();
        this.context.moveTo(offX + w * 0.5 - 10, 15);
        this.context.lineTo(offX + w * 0.5, 0);
        this.context.lineTo(offX + w * 0.5 + 10, 15);
        this.context.stroke();
        // Draw X-axis
        this.context.lineWidth = 1.5;
        this.context.beginPath();
        this.context.moveTo(0, offY + h * 0.5);
        this.context.lineTo(w, offY + h * 0.5);
        this.context.stroke();
        // Draw Y-axis
        this.context.beginPath();
        this.context.moveTo(offX + w * 0.5, 0);
        this.context.lineTo(offX + w * 0.5, h);
        this.context.stroke();
        /*
        // Ticks marks along the positive X-axis
        for(let i=1; i<Math.round(w*0.5); i++) {
            this.context.beginPath();
            this.context.lineWidth = 0.7;
            this.context.strokeStyle = "rgba(250,0,0,0.70)";
            
            // Draw a tick mark 5px long (-2 to 2)
            this.context.moveTo(w*0.5+i*dist_grids+0.5, h*0.5-2+0.5);
            this.context.lineTo(w*0.5+i*dist_grids+0.5, h*0.5+2+0.5);
            this.context.stroke();
        
            
            // Text value at that point
            //ctx.font = '9px Arial';
            //ctx.textAlign = 'start';
            //ctx.fillText(x_axis_starting_point.number*i + x_axis_starting_point.suffix, dist_grids*i-2, 15);
            
        }

        // Ticks marks along the negative X-axis
        for(let i=Math.round(w*0.5); i>0; i--) {
            this.context.beginPath();
            this.context.lineWidth = 0.7;
            this.context.strokeStyle = "rgba(250,0,0,0.70)";

            // Draw a tick mark 5px long (-2 to 2)
            this.context.moveTo(w*0.5-i*dist_grids+0.5, h*0.5-2+0.5);
            this.context.lineTo(w*0.5-i*dist_grids+0.5, h*0.5+2+0.5);
            this.context.stroke();

            
            // Text value at that point
            //ctx.font = '9px Arial';
            //ctx.textAlign = 'end';
            //ctx.fillText(-x_axis_starting_point.number*i + x_axis_starting_point.suffix, -dist_grids*i+2, 15);
            
        }

        // Ticks marks along the positive Y-axis
        for(let i=1; i<Math.round(h*0.5); i++) {
            this.context.beginPath();
            this.context.lineWidth = 0.7;
            this.context.strokeStyle = "rgba(250,0,0,0.70)";

            // Draw a tick mark 5px long (-2 to 2)
            this.context.moveTo(w*0.5-2+0.5, h*0.5-i*dist_grids+0.5);
            this.context.lineTo(w*0.5+2+0.5, h*0.5-i*dist_grids+0.5);
            this.context.stroke();

            
            // Text value at that point
            //ctx.font = '9px Arial';
            //ctx.textAlign = 'start';
            //ctx.fillText(-y_axis_starting_point.number*i + y_axis_starting_point.suffix, 8, dist_grids*i+2);
            
        }

        // Ticks marks along the negative Y-axis
        for(let i=Math.round(h*0.5); i>0; i--) {
            this.context.beginPath();
            this.context.lineWidth = 0.7;
            this.context.strokeStyle = "rgba(250,0,0,0.70)";

            // Draw a tick mark 5px long (-2 to 2)
            this.context.moveTo(w*0.5-2+0.5, h*0.5+i*dist_grids+0.5);
            this.context.lineTo(w*0.5+2+0.5, h*0.5+i*dist_grids+0.5);
            this.context.stroke();

            
            // Text value at that point
            //ctx.font = '9px Arial';
            //ctx.textAlign = 'start';
            //ctx.fillText(y_axis_starting_point.number*i + y_axis_starting_point.suffix, 8, -dist_grids*i+3);
            
        }
        */
    }
    setPanningOffset(x, y) {
        this.panningOffsetX = x;
        this.panningOffsetY = y;
        this.drawAxes();
    }
}
class Body {
    constructor({ id = -1, x = 0, y = 0, radius = 0, k_energy = 0, internal_energy = 0 } = {}) {
        this.id = 0;
        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.k_energy = 0;
        this.internal_energy = 0;
        this.visible = false;
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
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
    setVisible(value) {
        this.visible = value;
        if (!value) {
            this.id = -1;
            this.x = 0;
            this.y = 0;
            this.radius = 0;
            this.k_energy = 0;
            this.internal_energy = 0;
        }
    }
}
zip.workerScriptsPath = "./dist/lib/zipjs/";
class Deserializer {
    static parseBinaryFloat32Array(blob) {
        let floatArray = new Float32Array(blob);
        let fifo = new Fifo();
        let objects;
        let last = null;
        let itLen = 0;
        try {
            for (let i = 0; i < floatArray.length; i = i + Deserializer.bodyNumParams * itLen + 1) {
                itLen = floatArray[i];
                objects = new Float32Array(floatArray.slice(i, i + Deserializer.bodyNumParams * itLen + 1));
                fifo.push(objects);
                //console.log(objects);
            }
            return fifo;
        }
        catch (e) {
            throw Error("Failed parsing file");
        }
    }
}
Deserializer.bodyNumParams = 6;
class ZipReader {
    static getEntries(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                zip.createReader(new zip.BlobReader(file), (zipReader) => {
                    ZipReader.zipReader = zipReader;
                    zipReader.getEntries((entries) => resolve(entries));
                }, () => console.log("Error loading zip"));
            });
        });
    }
    static getEntryFile(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                entry.getData(new zip.BlobWriter(), (blob) => __awaiter(this, void 0, void 0, function* () {
                    resolve(yield blob.arrayBuffer());
                }), (p) => {
                });
            });
        });
    }
    static closeZipReader() {
        if (ZipReader.zipReader != null) {
            ZipReader.zipReader.close();
            ZipReader.zipReader = null;
        }
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
    pushFifo(fifo) {
        if (this.size == 0) {
            this.first = fifo.first;
            this.last = fifo.last;
        }
        else {
            this.last.next = fifo.first;
            this.last = fifo.last;
        }
        this.size += fifo.size;
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
        Startup.axesCanvas = document.getElementById('axes-canvas');
        Startup.axes = new Axes(Startup.axesCanvas);
        Startup.axes.drawAxes();
        Startup.loop = new Loop(Startup.mainCanvas, Startup.gui);
        let mouseInput = new MouseInput(Startup.loop, Startup.axes);
        Startup.resize();
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
        Startup.gui.Register([{
                type: 'folder',
                label: 'Controls',
                open: true
            }, {
                type: 'folder',
                label: 'Selected',
                open: true
            }, {
                type: 'folder',
                label: 'FPS',
                open: false
            }, {
                type: 'folder',
                label: 'Charts',
                open: false
            }]);
        Startup.gui.Loader(false);
    }
    static onWindowResized(event) {
        Startup.resize();
    }
    static resize() {
        Startup.mainCanvas.width = window.innerWidth;
        Startup.mainCanvas.height = window.innerHeight - 25;
        Startup.gui.panel.style += "overflow-y: scroll; height: 300px;";
        Startup.axesCanvas.width = window.innerWidth;
        Startup.axesCanvas.height = window.innerHeight - 25;
        Startup.axes.drawAxes();
    }
}
Startup.someNumber = 0;
class MouseInput {
    constructor(loop, axes) {
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
        this.axes = axes;
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
        //console.log("start pan");
        self.canvas.addEventListener("mousemove", self.mouseMoveListener);
        self.canvas.addEventListener("mouseup", self.mouseUpListener);
        self.canvas.addEventListener("mouseleave", self.mouseUpListener);
        self.panningStartX = e.clientX;
        self.panningStartY = e.clientY;
        self.loop.setSelected(e.clientX, e.clientY - 25); // TODO aggiustare 25
    }
    pan(e, self) {
        self.panningOffsetX = e.clientX - self.panningStartX;
        self.panningOffsetY = e.clientY - self.panningStartY;
        self.loop.setPanningOffset(self.globalOffsetX + self.panningOffsetX, self.globalOffsetY + self.panningOffsetY);
        self.axes.setPanningOffset(self.globalOffsetX + self.panningOffsetX, self.globalOffsetY + self.panningOffsetY);
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
// TODO hittest
class Loop {
    constructor(canvas, gui) {
        this.panningOffsetX = 0;
        this.panningOffsetY = 0;
        this.bufferSize = 90;
        this.loadAllFile = true;
        this.forceLoadAllCheckbox = false;
        this.isPlaying = false;
        this.isEof = false;
        this.readEnd = false;
        this.reqId = -1;
        this.selectX = null;
        this.selectY = null;
        this.selectedBody = new Body();
        this.numIteration = 0;
        this.indexChunck = 0;
        this.loadingChunck = false;
        this.entries = null;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.file = new File([], "");
        this.buffer = new Fifo();
        this.lastObjects = null;
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
            },
            {
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
            },
            {
                type: 'display',
                folder: 'Controls',
                label: 'Iteration',
                object: this,
                property: 'numIteration',
            },
            {
                type: 'display',
                folder: 'Controls',
                label: 'Offset X',
                object: this,
                property: 'panningOffsetX',
            },
            {
                type: 'display',
                folder: 'Controls',
                label: 'Offset Y',
                object: this,
                property: 'panningOffsetY',
            },
            {
                type: 'display',
                folder: 'Selected',
                label: 'X',
                object: this.selectedBody,
                property: 'x',
            },
            {
                type: 'display',
                folder: 'Selected',
                label: 'Y',
                object: this.selectedBody,
                property: 'y',
            },
            {
                type: 'display',
                folder: 'Selected',
                label: 'Radius',
                object: this.selectedBody,
                property: 'radius',
            },
            {
                type: 'display',
                folder: 'Selected',
                label: 'Kinetic energy',
                object: this.selectedBody,
                property: 'k_energy',
            },
            {
                type: 'display',
                folder: 'Selected',
                label: 'Internal energy',
                object: this.selectedBody,
                property: 'internal_energy',
            }
        ]);
        this.barContainer = document.getElementById("guify-bar-container");
    }
    draw() {
        this.stats.begin();
        //this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = "white";
        this.context.strokeStyle = "green";
        this.context.lineWidth = 3;
        //this.context.setTransform(xAx, xAy, -xAy, -xAx, x, y);
        //this.setMatrix(this.canvas.width/2 + this.panningOffsetX, this.canvas.height/2 + this.panningOffsetY, 1, 0);
        if (this.lastObjects == null || this.isPlaying) { //Disegno il primo frame sempre o qundo e'play
            let objects = this.buffer.pop();
            if (objects != null && !this.isEof) {
                this.drawStates(objects);
                this.lastObjects = objects;
                this.numIteration++;
            }
            else if (!this.loadingChunck) {
                this.isEof = true;
                this.isPlaying = false;
                this.barContainer.innerText = "⏹";
            } //else if(this.lastObjects != null)
            // this.drawStates(this.lastObjects);
        }
        else if (this.lastObjects != null)
            this.drawStates(this.lastObjects);
        this.reqId = window.requestAnimationFrame(() => this.draw());
        if (!this.loadAllFile && !this.readEnd && this.buffer.size < 300)
            this.loadFileChunck(this.file, false);
        this.stats.end();
    }
    // per aumentare la velocita di calcolo utilizzo un quadrato circoscritto
    squareHitTest(x, y, r, xp, yp) {
        let x1 = x - r;
        let y1 = y - r;
        let x2 = x + r;
        let y2 = y + r;
        return (x1 <= xp && xp <= x2 && y1 <= yp && yp <= y2);
    }
    static roundTo1(x) {
        if (x > 0 && x < 1)
            return 1;
        else
            return x;
    }
    drawStates(objects) {
        let xBase = this.canvas.width / 2 + this.panningOffsetX;
        let yBase = (this.canvas.height / 2 + this.panningOffsetY);
        const numParams = Deserializer.bodyNumParams;
        //console.log(this.buffer.size);
        //console.log(objects);
        this.context.beginPath();
        let selectedIsMerged = true;
        for (let i = 0; i < objects[0]; i++) {
            let id = objects[1 + i * numParams + 0];
            let x = objects[1 + i * numParams + 1]; // posizione 1 dell'array
            let y = objects[1 + i * numParams + 2];
            let r = objects[1 + i * numParams + 3];
            let k_energy = objects[1 + i * numParams + 4];
            let i_energy = objects[1 + i * numParams + 5];
            this.context.moveTo(xBase + x, yBase + y);
            this.context.arc(xBase + x, yBase + y, Loop.roundTo1(r), 0, 2 * Math.PI);
            // End draw
            if (this.selectedBody.visible && this.selectedBody.id == id) {
                this.selectedBody.x = x;
                this.selectedBody.y = y;
                this.selectedBody.radius = r;
                this.selectedBody.k_energy = k_energy;
                this.selectedBody.internal_energy = i_energy;
                selectedIsMerged = false;
            }
            if (this.selectX != null && this.selectY != null &&
                this.squareHitTest(xBase + x, yBase + y, r, this.selectX, this.selectY)) {
                this.selectedBody.id = id;
                this.selectedBody.x = x;
                this.selectedBody.y = y;
                this.selectedBody.radius = r;
                this.selectedBody.k_energy = k_energy;
                this.selectedBody.internal_energy = i_energy;
                this.selectedBody.setVisible(true);
                this.selectX = null;
                this.selectY = null;
                selectedIsMerged = false;
            }
        }
        this.context.closePath();
        this.context.fill();
        if (selectedIsMerged) {
            this.selectedBody.setVisible(false);
        }
        if (this.selectedBody.visible) {
            this.context.beginPath();
            this.context.arc(xBase + this.selectedBody.x, yBase + this.selectedBody.y, this.selectedBody.radius + 5, 0, 2 * Math.PI);
            this.context.closePath();
            this.context.stroke();
        }
    }
    play() {
        if (this.isPlaying || this.isEof)
            return;
        this.isPlaying = true;
        this.barContainer.innerText = "⏵";
    }
    pause() {
        if (!this.isPlaying || this.isEof)
            return;
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
            // Reset variabili
            this.isEof = false;
            this.isPlaying = false;
            this.lastObjects = null;
            this.numIteration = 0;
            this.bufferSize = 90;
            this.selectedBody.visible = false;
            this.selectX = null;
            this.selectY = null;
            if (!this.loadAllFile) {
                while (this.loadingChunck) { // Aspetto la fine del worker
                    yield new Promise((resolve) => { setTimeout(() => { resolve(); }, 100); });
                }
            }
            this.buffer.clear();
            try {
                this.file = file;
                yield this.loadFile(file);
                //console.log("File loaded");
            }
            catch (e) {
                console.error(e);
            }
            this.barContainer.innerText = "⏹";
            this.draw();
            //this.play();
        });
    }
    loadFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            Startup.gui.Loader(true);
            //if( this.file.size < 100000000 || this.forceLoadAllCheckbox){ //100MB 
            if (this.forceLoadAllCheckbox) {
                this.loadAllFile = true;
                try {
                    yield this.loadFileAll(file);
                }
                catch (e) {
                    throw Error("Failed loading file");
                }
            }
            else {
                this.loadAllFile = false;
                yield this.loadFileChunck(file, true);
            }
            Startup.gui.Loader(false);
            return;
        });
    }
    loadFileAll(file) {
        return __awaiter(this, void 0, void 0, function* () {
            let entries = yield ZipReader.getEntries(file);
            this.buffer.clear();
            for (let i = 0; i < entries.length; i++) {
                console.log("Load file: " + entries[i].filename);
                let arrayBuffer = yield ZipReader.getEntryFile(entries[i]);
                this.buffer.pushFifo(Deserializer.parseBinaryFloat32Array(arrayBuffer));
            }
            console.log(this.buffer.size);
            ZipReader.closeZipReader();
            this.readEnd = true;
        });
    }
    loadFileChunck(file, reset) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((this.loadingChunck || this.readEnd) && !reset) {
                return;
            }
            if (reset) {
                ZipReader.closeZipReader();
                this.entries = null;
                this.indexChunck = 0;
            }
            this.readEnd = false;
            this.loadingChunck = true;
            if (this.entries == null) {
                this.entries = yield ZipReader.getEntries(file); // TODO devochiudere lo zip
            }
            if (this.entries != null && this.indexChunck < this.entries.length) {
                console.log("Load file: " + this.entries[this.indexChunck].filename);
                let arrayBuffer = yield ZipReader.getEntryFile(this.entries[this.indexChunck]);
                let b = Deserializer.parseBinaryFloat32Array(arrayBuffer);
                // Funzione ch bilancia le richieste
                this.bufferSize = b.size > 12000 ? 60 : -100 * Math.log(b.size) + 1000;
                //this.bufferSize = 600;
                //console.log(this.bufferSize);
                this.buffer.pushFifo(b);
                this.indexChunck++;
                if (this.indexChunck == this.entries.length) {
                    this.readEnd = true;
                    ZipReader.closeZipReader();
                }
            }
            this.loadingChunck = false;
        });
    }
    setPanningOffset(x, y) {
        this.panningOffsetX = x;
        this.panningOffsetY = y;
    }
    setSelected(x, y) {
        this.selectX = x;
        this.selectY = y;
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