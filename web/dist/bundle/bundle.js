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
        let distGrids = 10; //distance between grids
        let bigEvery = 5; // 1 big every 10 small
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
        this.context.strokeStyle = "rgba(255,0,0,0.8)";
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
        this.context.lineWidth = 1;
        let bigTick = 6;
        let smallTick = 3;
        let newW = Math.floor(w / 2) - (Math.floor(w / 2) % (distGrids * bigEvery));
        let xNumTick = (newW / distGrids);
        // Ticks marks along the negative X-axis
        for (let i = 0; i < xNumTick; i++) {
            this.context.beginPath();
            let mod = (this.panningOffsetX + i * distGrids) % (newW);
            mod = mod < 0 ? (newW + mod) : mod; // Riporto il modulo positivo
            if (i % bigEvery == 0) {
                this.context.moveTo(w / 2 + mod, offY + h / 2 - bigTick);
                this.context.lineTo(w / 2 + mod, offY + h / 2 + bigTick);
            }
            else {
                this.context.moveTo(w / 2 + mod, offY + h / 2 - smallTick);
                this.context.lineTo(w / 2 + mod, offY + h / 2 + smallTick);
            }
            this.context.stroke();
        }
        // Ticks marks along the positive X-axis
        for (let i = xNumTick; i > 0; i--) {
            this.context.beginPath();
            let mod = (i * distGrids - this.panningOffsetX) % (newW);
            mod = mod < 0 ? (newW + mod) : mod; // Riporto il modulo positivo
            if ((i) % bigEvery == 0) {
                this.context.moveTo(w / 2 - mod, offY + h / 2 - bigTick);
                this.context.lineTo(w / 2 - mod, offY + h / 2 + bigTick);
            }
            else {
                this.context.moveTo(w / 2 - mod, offY + h / 2 - smallTick);
                this.context.lineTo(w / 2 - mod, offY + h / 2 + smallTick);
            }
            this.context.stroke();
        }
        let newH = Math.floor(h / 2) - (Math.floor(h / 2) % (distGrids * bigEvery));
        let yNumTick = (newH / distGrids);
        // Ticks marks along the negative Y-axis
        for (let i = 0; i < yNumTick; i++) {
            this.context.beginPath();
            let mod = (this.panningOffsetY + i * distGrids) % (newH);
            mod = mod < 0 ? (newH + mod) : mod; // Riporto il modulo positivo
            if (i % bigEvery == 0) {
                this.context.moveTo(offX + w / 2 - bigTick, h / 2 + mod);
                this.context.lineTo(offX + w / 2 + bigTick, h / 2 + mod);
            }
            else {
                this.context.moveTo(offX + w / 2 - smallTick, h / 2 + mod);
                this.context.lineTo(offX + w / 2 + smallTick, h / 2 + mod);
            }
            this.context.stroke();
        }
        // Ticks marks along the positive Y-axis
        for (let i = yNumTick; i > 0; i--) {
            this.context.beginPath();
            let mod = (i * distGrids - this.panningOffsetY) % (newH);
            mod = mod < 0 ? (newH + mod) : mod; // Riporto il modulo positivo
            if (i % bigEvery == 0) {
                this.context.moveTo(offX + w / 2 - bigTick, h / 2 - mod);
                this.context.lineTo(offX + w / 2 + bigTick, h / 2 - mod);
            }
            else {
                this.context.moveTo(offX + w / 2 - smallTick, h / 2 - mod);
                this.context.lineTo(offX + w / 2 + smallTick, h / 2 - mod);
            }
            this.context.stroke();
        }
    }
    setPanningOffset(x, y) {
        this.panningOffsetX = x;
        this.panningOffsetY = y;
        this.drawAxes();
    }
}
class Body {
    constructor({ id = -1, x = 0, y = 0, radius = 0, } = {}) {
        this.id = 0;
        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.visible = false;
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
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
        }
    }
}
zip.workerScriptsPath = "./dist/lib/zipjs/";
class Deserializer {
    static parseBinaryFloat32Array(blob) {
        let floatArray = new Float32Array(blob);
        let fifo = new Fifo();
        let objects;
        //let last : Float32Array | null = null;
        let offset = 0;
        try {
            for (let i = (Deserializer.numIterationParam - 1); i < floatArray.length; i = i + offset) {
                offset = Deserializer.bodyNumParams * floatArray[i] + Deserializer.numIterationParam;
                //console.log(floatArray[i]);
                objects = new Float32Array(floatArray.slice(i - (Deserializer.numIterationParam - 1), i + offset));
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
Deserializer.bodyNumParams = 5;
Deserializer.numIterationParam = 6; // 5 energie + size
class ZipReader {
    static getEntries(file) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                zip.createReader(new zip.BlobReader(file), (zipReader) => {
                    ZipReader.zipReader = zipReader;
                    zipReader.getEntries((entries) => resolve(entries));
                }, () => { console.log("Error loading zip"); reject("error"); });
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
        console.log('Main');
        Startup.mainCanvas = document.getElementById('main-canvas');
        window.onresize = Startup.onWindowResized;
        Startup.trajectoryCanvas = document.getElementById('trajectory-canvas');
        Startup.trajectory = new Trajectory(Startup.trajectoryCanvas);
        Startup.axesCanvas = document.getElementById('axes-canvas');
        Startup.axes = new Axes(Startup.axesCanvas);
        Startup.axes.drawAxes();
        Startup.loop = new Loop(Startup.mainCanvas, Startup.gui);
        let mouseInput = new MouseInput(Startup.loop, Startup.axes, Startup.trajectory);
        Startup.createGui(); // And resize
        return 0;
    }
    static createGui() {
        let guiContainer = document.getElementById("main-container");
        Startup.gui = new guify({
            title: 'Solar system',
            theme: 'light',
            align: 'right',
            width: Startup.canvasMarginRight,
            barMode: 'offset',
            panelMode: 'inner',
            opacity: 0.9,
            root: guiContainer,
            open: true,
            onOpen: (value) => {
                if (value) {
                    Startup.canvasMarginRight = 350;
                }
                else {
                    Startup.canvasMarginRight = 0;
                }
                Startup.resize();
            }
        });
        Startup.gui.Register({
            type: 'file',
            label: 'File',
            onChange: (file) => __awaiter(this, void 0, void 0, function* () {
                yield Startup.loop.reset(file);
            })
        });
        Startup.gui.Register([{
                type: 'button',
                label: 'Play/Pause',
                streched: true,
                action: () => {
                    Startup.loop.playPause();
                }
            }, {
                type: 'button',
                label: 'Rewind',
                streched: true,
                action: () => {
                    Startup.loop.reset();
                }
            }, {
                type: 'display',
                label: 'Energy chart',
                element: Startup.loop.chart.container,
            }, {
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
                type: 'button',
                label: 'Run Main',
                streched: true,
                action: () => {
                    _web_main();
                    Startup.loop.resetArray(new Float32Array(Module.FS.readFile("sim0.bin").buffer));
                }
            }]);
        Startup.gui.Register(Startup.loop.guiPanel);
        Startup.gui.Loader(false);
        Startup.loop.barContainer = document.getElementById("guify-bar-container");
    }
    static onWindowResized(event) {
        Startup.resize();
    }
    static resize() {
        Startup.mainCanvas.width = window.innerWidth - Startup.canvasMarginRight;
        Startup.mainCanvas.height = window.innerHeight - Startup.canvasMarginTop;
        Startup.mainCanvas.style.marginRight = Startup.canvasMarginRight + "px";
        Startup.mainCanvas.style.marginTop = Startup.canvasMarginTop + "px";
        //Startup.gui.panel.style += "overflow-y: scroll; height: 300px;"
        Startup.axesCanvas.width = window.innerWidth - Startup.canvasMarginRight;
        Startup.axesCanvas.height = window.innerHeight - Startup.canvasMarginTop;
        Startup.axesCanvas.style.marginRight = Startup.canvasMarginRight + "px";
        Startup.axesCanvas.style.marginTop = Startup.canvasMarginTop + "px";
        Startup.axes.drawAxes();
        Startup.trajectoryCanvas.width = window.innerWidth - Startup.canvasMarginRight;
        Startup.trajectoryCanvas.height = window.innerHeight - Startup.canvasMarginTop;
        Startup.trajectoryCanvas.style.marginRight = Startup.canvasMarginRight + "px";
        Startup.trajectoryCanvas.style.marginTop = Startup.canvasMarginTop + "px";
    }
}
Startup.canvasMarginTop = 25;
Startup.canvasMarginRight = 350;
Startup.someNumber = 0;
class MouseInput {
    constructor(loop, axes, trajectory) {
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
        this.trajectory = trajectory;
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
    }
    pan(e, self) {
        self.panningOffsetX = e.clientX - self.panningStartX;
        self.panningOffsetY = e.clientY - self.panningStartY;
        self.loop.setPanningOffset(self.globalOffsetX + self.panningOffsetX, self.globalOffsetY + self.panningOffsetY);
        self.axes.setPanningOffset(self.globalOffsetX + self.panningOffsetX, self.globalOffsetY + self.panningOffsetY);
        self.trajectory.setPanningOffset(self.globalOffsetX + self.panningOffsetX, self.globalOffsetY + self.panningOffsetY);
    }
    endPan(e, self) {
        self.panning = false;
        self.globalOffsetX += self.panningOffsetX;
        self.globalOffsetY += self.panningOffsetY;
        self.canvas.removeEventListener("mousemove", self.mouseMoveListener);
        self.canvas.removeEventListener("mouseup", self.mouseUpListener);
        self.canvas.removeEventListener("mouseleave", self.mouseUpListener);
        if (self.panningStartX == e.clientX && self.panningStartY == e.clientY)
            self.click(self, e.clientX, e.clientY);
    }
    click(self, x, y) {
        self.loop.setSelected(x, y - 25); // TODO aggiustare 25
    }
    setOffset(x, y) {
        this.globalOffsetX = x;
        this;
        this.globalOffsetY = y;
        this.loop.setPanningOffset(this.globalOffsetX, this.globalOffsetY);
        this.axes.setPanningOffset(this.globalOffsetX, this.globalOffsetY);
        this.trajectory.setPanningOffset(this.globalOffsetX, this.globalOffsetY);
    }
}
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
        this.lastTime = 0;
        this.indexChunck = 1; //TODO cambiare in indexChunck=0, primo file non letto perche contiene metadati
        this.loadingChunck = false;
        this.entries = null;
        this.rangeSlider = null;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.file = new File([], "");
        this.buffer = new Fifo();
        this.lastObjects = null;
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        this.stats.dom.style = "margin-left: 100px;";
        this.chart = new NumberChart(["Total energy", "Kinetic energy", "Internal energy", "Potential energy", "Binding energy"], ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF"]);
        let div = document.createElement("div");
        div.id = "container";
        this.guiPanel = [
            {
                type: 'display',
                label: '',
                folder: "FPS",
                element: this.stats.dom,
            }, {
                type: 'checkbox',
                folder: 'Controls',
                label: 'Force loading all file in memory',
                object: this,
                property: 'forceLoadAllCheckbox',
            }, {
                type: 'display',
                folder: 'Controls',
                label: 'Is playing',
                object: this,
                property: 'isPlaying',
            }, {
                type: 'display',
                folder: 'Controls',
                label: 'Is EOF',
                object: this,
                property: 'isEof',
            }, {
                type: 'display',
                folder: 'Controls',
                label: 'Iteration',
                object: this,
                property: 'numIteration',
            }, {
                type: 'display',
                folder: 'Controls',
                label: 'Offset X',
                object: this,
                property: 'panningOffsetX',
            }, {
                type: 'display',
                folder: 'Controls',
                label: 'Offset Y',
                object: this,
                property: 'panningOffsetY',
            }, {
                type: 'display',
                folder: 'Selected',
                label: 'X',
                object: this.selectedBody,
                property: 'x',
            }, {
                type: 'display',
                folder: 'Selected',
                label: 'Y',
                object: this.selectedBody,
                property: 'y',
            }, {
                type: 'display',
                folder: 'Selected',
                label: 'Radius',
                object: this.selectedBody,
                property: 'radius',
            }
        ];
        this.barContainer = document.getElementById("guify-bar-container");
        this.tmpCanvas = document.createElement('canvas');
        this.tmpCanvas.height = 100;
        this.tmpCanvas.width = 100;
        let tmpCtx = this.tmpCanvas.getContext("2d");
        tmpCtx.fillStyle = "white";
        tmpCtx.arc(50, 50, 50, 0, 2 * Math.PI);
        tmpCtx.fill();
    }
    draw(time) {
        this.stats.begin();
        if (time - this.lastTime <= 20) {
            //this.context.setTransform(1, 0, 0, 1, 0, 0);
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.fillStyle = "white";
            this.context.strokeStyle = "rgba(0,255,0,0.4)";
            this.context.lineWidth = 2.5;
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
        }
        else {
            this.buffer.pop(); //TODO Aggiustare cosi non funziona
        }
        this.reqId = window.requestAnimationFrame((time) => this.draw(time));
        if (!this.loadAllFile && !this.readEnd && this.buffer.size < 300)
            this.loadFileChunck(this.file, false);
        this.stats.end();
        this.lastTime = time;
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
        let yBase = this.canvas.height / 2 + this.panningOffsetY;
        const numParams = Deserializer.bodyNumParams;
        //console.log(this.buffer.size);
        //console.log(objects);
        this.context.beginPath();
        let bodyIsMerged = true;
        for (let i = 0; i < objects[Deserializer.numIterationParam - 1]; i++) {
            let id = objects[Deserializer.numIterationParam + i * numParams + 0];
            let x = objects[Deserializer.numIterationParam + i * numParams + 1]; // posizione 1 dell'array
            let y = objects[Deserializer.numIterationParam + i * numParams + 2];
            let r = objects[Deserializer.numIterationParam + i * numParams + 3];
            //this.context.drawImage(this.tmpCanvas, xBase + x, yBase + y, r*2, r*2);
            this.context.moveTo(xBase + x, yBase + y);
            this.context.arc(xBase + x, yBase + y, Math.floor(Loop.roundTo1(r)), 0, 2 * Math.PI);
            // End draw
            // Se il corpo e' stato selezionato
            if (this.selectedBody.visible && this.selectedBody.id == id) {
                this.selectedBody.x = x;
                this.selectedBody.y = y;
                this.selectedBody.radius = r;
                bodyIsMerged = false;
            }
            if (this.selectX != null && this.selectY != null) {
                if (this.squareHitTest(xBase + x, yBase + y, r, this.selectX, this.selectY)) {
                    this.selectedBody.id = id;
                    this.selectedBody.x = x;
                    this.selectedBody.y = y;
                    this.selectedBody.radius = r;
                    this.selectedBody.setVisible(true);
                    this.selectX = null;
                    this.selectY = null;
                    Startup.trajectory.clear();
                    bodyIsMerged = false;
                }
                else {
                    bodyIsMerged = true;
                }
            }
        }
        this.context.closePath();
        this.context.fill();
        if (bodyIsMerged) { // Il body ha fatto il merge
            this.selectedBody.setVisible(false);
            Startup.trajectory.clear();
        }
        if (this.selectedBody.visible) { // Body selezionato
            this.context.beginPath();
            this.context.arc(xBase + this.selectedBody.x, yBase + this.selectedBody.y, this.selectedBody.radius + 5, 0, 2 * Math.PI);
            this.context.closePath();
            this.context.stroke();
            if (this.numIteration % 10 == 0)
                Startup.trajectory.addCords(this.selectedBody.x, this.selectedBody.y);
        }
        if (this.numIteration % 30 == 0)
            this.chart.updateChart([
                { x: this.numIteration, y: objects[0] },
                { x: this.numIteration, y: objects[1] },
                { x: this.numIteration, y: objects[2] },
                { x: this.numIteration, y: objects[3] },
                { x: this.numIteration, y: objects[4] }
            ]);
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
            this.chart.deleteData();
            try {
                this.file = file;
                yield this.loadFile(file);
                //console.log("File loaded");
            }
            catch (e) {
                console.error(e);
            }
            this.barContainer.innerText = "⏹";
            this.draw(0);
            //this.play();
        });
    }
    resetArray(arrayBuffer) {
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
            this.chart.deleteData();
            try {
                this.buffer.pushFifo(Deserializer.parseBinaryFloat32Array(arrayBuffer));
            }
            catch (e) {
                console.error(e);
            }
            this.barContainer.innerText = "⏹";
            this.draw(0);
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
            try {
                let entries = yield ZipReader.getEntries(file);
                this.buffer.clear();
                for (let i = 1; i < entries.length; i++) { //TODO cambiare in i=0, primo file non letto perche contiene metadati
                    console.log("Load file: " + entries[i].filename);
                    let arrayBuffer = yield ZipReader.getEntryFile(entries[i]);
                    this.buffer.pushFifo(Deserializer.parseBinaryFloat32Array(arrayBuffer));
                }
                console.log(this.buffer.size);
                ZipReader.closeZipReader();
                this.readEnd = true;
                //this.addGuiRange(0, entries.length);
            }
            catch (e) {
                console.log(e);
            }
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
                this.indexChunck = 1; //TODO cambiare in indexChunck=0, primo file non letto perche contiene metadati
            }
            this.readEnd = false;
            this.loadingChunck = true;
            try {
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
                    //this.addGuiRange(0, this.entries.length-1);
                }
            }
            catch (e) {
                console.log(e);
                this.readEnd = true;
            }
            finally {
                this.loadingChunck = false;
            }
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
    addGuiRange(min, max) {
        if (this.rangeSlider != null) {
            Startup.gui.Remove(this.rangeSlider);
        }
        this.rangeSlider = Startup.gui.Register({
            type: 'range',
            label: 'Stepped Range',
            min: min, max: max, step: 1,
            object: this, property: "indexChunck",
            onChange: (data) => __awaiter(this, void 0, void 0, function* () {
                yield this.setCursor(data);
            })
        });
    }
    setCursor(cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.loadAllFile) {
                while (this.loadingChunck) { // Aspetto la fine del worker
                    yield new Promise((resolve) => { setTimeout(() => { resolve(); }, 100); });
                }
            }
            this.buffer.clear();
            yield this.loadFileChunck(this.file, false);
        });
    }
}
class NumberChart {
    constructor(titles, colors) {
        this.width = 305;
        this.height = 300;
        this.size = titles.length;
        this.container = document.createElement("div");
        this.container.setAttribute("style", "width: 100%; overflow: auto; display: flex; flex-direction: column-reverse;");
        this.div = document.createElement("div");
        this.div.setAttribute("style", "width: " + this.width + "px; height: " + this.height + "px; position: relative;");
        this.container.appendChild(this.div);
        this.canvas = document.createElement("canvas");
        this.canvas.height = this.height;
        //this.canvas.width = this.width;
        this.context = this.canvas.getContext("2d");
        this.div.appendChild(this.canvas);
        let datasets = [];
        for (let i = 0; i < titles.length; i++) {
            datasets.push({
                label: titles[i],
                borderWidth: 1,
                // backgroundColor: "rgba(255, 0, 0, 0.6)",
                borderColor: colors[i],
                filled: false,
                data: []
            });
        }
        this.chart = new Chart(this.context, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                tooltips: {
                    mode: "index"
                },
                elements: {
                    line: {
                        tension: 0 // disables bezier curves
                    },
                    point: {
                        radius: 0,
                        hitRadius: 10,
                        hoverRadius: 3
                    }
                },
                maintainAspectRatio: false,
                responsive: false,
                legend: {
                    display: true,
                    align: "start",
                    labels: {
                        fontSize: 10,
                    }
                },
                scales: {
                    yAxes: [{
                            ticks: {
                                callback: function (val) {
                                    return val.toExponential();
                                }
                            }
                        }],
                    xAxes: [{
                            type: 'linear',
                            position: 'bottom',
                            ticks: {
                                autoSkip: true,
                                maxRotation: 0,
                                minRotation: 0,
                            }
                        }]
                },
                animation: {
                    duration: 0 // general animation time
                },
                hover: {
                    animationDuration: 0 // duration of animations when hovering an item
                },
                responsiveAnimationDuration: 0,
                pan: {
                    enabled: true,
                    mode: "x",
                    speed: 10,
                    threshold: 5
                },
                zoom: {
                    enabled: true,
                    //drag: true,
                    mode: "x",
                    speed: 0.1,
                    threshold: 2,
                    sensitivity: 3
                }
            }
        });
    }
    updateChart(data) {
        /*
        // allow 1px inaccuracy by adding 1
        const isScrolledToLeft = this.container.scrollWidth- this.container.clientWidth <= this.container.scrollLeft + 1
        if(this.chart.data.datasets[0].data.length % 4 == 0){
            this.width += 80;
            this.div.style.width = this.width+'px';
        }
        // Scroll to left
        if (isScrolledToLeft) {
            this.container.scrollLeft = this.container.scrollWidth - this.container.clientWidth
        }*/
        for (let i = 0; i < this.size; i++) {
            this.chart.data.datasets[i].data.push({ x: new Date(data[i].x), y: data[i].y });
        }
        this.chart.update();
    }
    deleteData() {
        this.width = 250;
        this.div.style.width = this.width + 'px';
        for (let i = 0; i < this.size; i++) {
            this.chart.data.datasets[i].data = [];
        }
        this.chart.update();
    }
}
class Trajectory {
    constructor(canvas) {
        this.panningOffsetX = 0;
        this.panningOffsetY = 0;
        this.points = [];
        this.maxSize = 1000;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
    }
    addCords(x, y) {
        this.points.push([x, y]);
        if (this.points.length > this.maxSize)
            this.points.shift();
        this.drawTrajectory();
    }
    drawTrajectory() {
        let xBase = this.canvas.width / 2 + this.panningOffsetX;
        let yBase = this.canvas.height / 2 + this.panningOffsetY;
        this.context.strokeStyle = "rgba(255,255,255,0.4)";
        this.context.lineWidth = 0.7;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.beginPath();
        for (let i = 1; i < this.points.length; i++) {
            if (this.points.length != 1) {
                this.context.moveTo(this.points[i - 1][0] + xBase, this.points[i - 1][1] + yBase);
                this.context.lineTo(this.points[i][0] + xBase, this.points[i][1] + yBase);
            }
        }
        this.context.stroke();
    }
    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.points = [];
    }
    setPanningOffset(x, y) {
        this.panningOffsetX = x;
        this.panningOffsetY = y;
        this.drawTrajectory();
    }
}
//# sourceMappingURL=bundle.js.map