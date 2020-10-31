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
        let json = JSON.parse(blob);
        let fifo = new Fifo();
        for (let i = 0; i < json.states.length; i++) {
            let len = json.states[i].p.length + 1;
            let objects = new Float64Array(len * numParams);
            objects[0] = len;
            for (let j = 0; j < len - 1; j++) {
                objects[(j + 1) * numParams] = json.states[i].p[j].x;
                objects[(j + 1) * numParams + 1] = json.states[i].p[j].y;
                objects[(j + 1) * numParams + 2] = json.states[i].p[j].r;
                objects[(j + 1) * numParams + 3] = json.states[i].p[j].k;
                objects[(j + 1) * numParams + 4] = json.states[i].p[j].i;
            }
            fifo.push(objects);
        }
        return fifo;
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
class Startup {
    static main() {
        console.log('Main');
        Startup.mainCanvas = document.getElementById('main-canvas');
        window.onresize = Startup.onWindowResized;
        Startup.resize();
        Startup.loop = new Loop(Startup.mainCanvas);
        const fileSelector = document.getElementById('file-selector');
        fileSelector.addEventListener('change', (event) => __awaiter(this, void 0, void 0, function* () {
            const target = event.target;
            const file = target.files[0];
            // Start the loop
            Startup.loop.loadFile(file);
            Startup.loop.stop();
            Startup.loop.play();
        }));
        const buttonStop = document.getElementById("stop-button");
        buttonStop.onclick = () => {
            Startup.loop.stop();
        };
        const buttonPlay = document.getElementById("play-button");
        buttonPlay.onclick = () => {
            Startup.loop.playPause();
        };
        const realtimeBox = document.getElementById("realtime-box");
        realtimeBox.checked = false;
        realtimeBox.onchange = () => {
            Startup.loop.setReadingMode(realtimeBox.checked);
        };
        return 0;
    }
    static onWindowResized(event) {
        Startup.resize();
    }
    static resize() {
        Startup.mainCanvas.width = window.innerWidth * 0.8;
        Startup.mainCanvas.height = window.innerHeight;
    }
}
class Loop {
    constructor(canvas) {
        this.fastMode = true;
        this.state = 0; // 0 stop, 1 play, 2 pause
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.context.fillStyle = "white";
        this.setMatrix(this.canvas.width / 2, this.canvas.height / 2, 1, 0);
        this.file = null;
        this.buffer = new Fifo();
        this.worker = new Worker('./dist/worker/worker.js');
        this.workerIsStopped = true;
        this.workerTimeout = 0;
        this.workerIntervalTime = 200;
    }
    draw() {
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
        this.drawStates();
        //let imageData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        //this.drawStatesImageData(imageData.data, imageData.width, imageData.height);
        //this.context.putImageData(imageData, 0, 0);
        //console.log(this.buffer.size);
        if (this.state == 1) {
            window.requestAnimationFrame(() => this.draw());
        }
    }
    setMatrix(x, y, scale, rotate) {
        var xAx = Math.cos(rotate) * scale; // the x axis x
        var xAy = Math.sin(rotate) * scale; // the x axis y
        this.context.setTransform(xAx, xAy, -xAy, -xAx, x, y);
    }
    drawStatesImageData(pixels, canvasWidth, canvasHeight) {
        if (this.buffer != null) {
            let el = this.buffer.pop();
            //console.log(this.buffer.size);
            if (el == null)
                return;
            for (let i = 0; i < el.p.length; i++) {
                if (el.p[i].x < canvasWidth && el.p[i].x > 0 && el.p[i].y < canvasWidth && el.p[i].y > 0) {
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
        }
        else {
            this.state = 0;
        }
    }
    drawStates() {
        let numParams = 5;
        if (this.buffer != null) {
            let objects = this.buffer.pop();
            if (objects == null)
                return;
            //console.log(this.buffer.size);
            this.context.beginPath();
            for (let i = 1; i <= objects[0]; i++) {
                //this.context.beginPath();
                //this.context.drawImage(this.brush, objects[i * numParams] -3, objects[i * numParams + 1] -3)
                this.context.moveTo(objects[i * numParams], objects[i * numParams + 1]);
                this.context.arc(objects[i * numParams], objects[i * numParams + 1], objects[i * numParams + 2], 0, 2 * Math.PI);
                //this.context.fillStyle = "white"; 
                //this.context.fill();
            }
            this.context.fill();
        }
        else {
            this.state = 0;
        }
    }
    play() {
        if (this.state == 1)
            return;
        if (!this.fastMode) {
            this.requestData();
        }
        this.state = 1;
        this.draw();
    }
    pause() {
        if (this.state == 2)
            return;
        if (!this.fastMode) {
            clearTimeout(this.workerTimeout);
        }
        this.state = 2;
    }
    stop() {
        if (this.state == 0)
            return;
        if (!this.fastMode) {
            this.workerIntervalTime = 200;
            this.worker.postMessage({ "type": "stop" });
            clearTimeout(this.workerTimeout);
        }
        this.state = 0;
        this.buffer.clear();
        this.loadFile();
    }
    playPause() {
        if (this.state == 0)
            this.play();
        else if (this.state == 1)
            this.pause();
        else if (this.state == 2)
            this.play();
    }
    requestData() {
        if (this.workerIsStopped) {
            //console.log(this.buffer.size);
            if (this.buffer.size < 600) {
                this.worker.postMessage({ "type": "read" });
                this.workerIsStopped = false;
            }
            else {
                this.workerIntervalTime += this.workerIntervalTime * 1 / 3;
            }
        }
        this.workerTimeout = setTimeout(() => {
            this.requestData();
        }, this.workerIntervalTime);
    }
    loadFile(file = this.file) {
        if (file == null)
            return;
        this.file = file;
        //if( this.file.size > 100000000){ //100MB this.fastMode
        //    this.fastMode = false;
        //    this.loadFileChunck(this.file);
        //} else {
        this.fastMode = true;
        this.loadFileAll(this.file);
        //}
    }
    loadFileAll(file) {
        let reader = new FileReader();
        let self = this;
        reader.onload = function (event) {
            //self.buffer = Deserializer.parseJsonFifo(<string> reader.result);
            self.buffer = Deserializer.parseJsonFloat64Array(reader.result);
        };
        reader.readAsText(file);
    }
    loadFileChunck(file) {
        this.worker.postMessage({ "type": "file", "data": file });
        this.worker.onmessage = (event) => {
            let response = event.data;
            //console.log(event.data);
            if (response.fileName != this.file.name)
                return;
            this.workerIsStopped = response.end;
            this.buffer.push(response.array);
            this.workerIntervalTime = response.time * response.numIt / 2;
        };
    }
    setReadingMode(mode) {
        this.fastMode = mode;
    }
}
//# sourceMappingURL=bundle.js.map