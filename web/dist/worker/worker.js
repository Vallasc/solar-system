"use strict";
const numIterations = 128;
let fileStream;
let file;
// This fixes `self`'s type.
self.onmessage = function (e) {
    let request = e.data;
    if (request.type == "file") {
        console.log(request.data);
        file = request.data;
        fileStream = new JsonStreamerSync(new FileStreamerSync(request.data));
    }
    if (request.type == "read") {
        let startTime;
        let endTime;
        let array = new Float64Array(0);
        for (let i = 0; i < numIterations && array != null; i++) {
            startTime = Date.now();
            array = fileStream.readFloat64Array();
            endTime = Date.now();
            postMessage({
                "end": i == numIterations - 1,
                "array": array,
                "time": endTime - startTime,
                "numIt": numIterations,
                "fileName": file.name
            });
        }
    }
    /*if(request.type == "read"){
      let data :Float64Array | null = new Float64Array(0);
      let buffLen = 100;
      let i = 0;
      do {
        data = fileStream.readFloat64Array();
        postMessage({"end": i==buffLen-1, "data":data});
        i++
      } while(i<buffLen && data != null);
    }*/
    if (request.type == "stop") {
        fileStream.rewind();
    }
};
class FileStreamerSync {
    constructor(file) {
        this.file = file;
        this.offset = 0;
        this.defaultChunkSize = 1024; // bytes
        this.rewind();
    }
    rewind() {
        this.offset = 0;
    }
    isEndOfFile() {
        return this.offset >= this.getFileSize();
    }
    readBlockAsText(length = this.defaultChunkSize) {
        const fileReader = new FileReaderSync();
        const blob = this.file.slice(this.offset, this.offset + length);
        const result = fileReader.readAsText(blob);
        this.offset += result.length;
        return result;
    }
    getFileSize() {
        return this.file.size;
    }
}
class JsonStreamerSync {
    constructor(fs) {
        this.initialSequenceSize = 12;
        this.initialSequenceElementSize = 16;
        this.afterElementSize = 1;
        this.fs = fs;
        this.buffer = "";
        this.chunkSize = 200;
        this.rewind();
    }
    read() {
        if (!this.fs.isEndOfFile()) {
            let s1 = this.fs.readBlockAsText(this.initialSequenceElementSize);
            //console.log(s1);
            if (s1 == ']}')
                return null;
            let n = parseInt(s1.slice(8, 16)) || null;
            if (n == null)
                return null;
            //console.log(n);
            let s2 = this.fs.readBlockAsText(n - this.initialSequenceElementSize + this.afterElementSize);
            //console.log(s1+s2);
            return JSON.parse(s1 + s2.slice(0, -1));
        }
        return null;
    }
    readFloat64Array() {
        let numParams = 5;
        let json = this.read();
        if (json == null)
            return null;
        let len = json.p.length + 1;
        let objects = new Float64Array(len * numParams);
        objects[0] = len;
        for (let j = 0; j < len - 1; j++) {
            objects[(j + 1) * numParams] = json.p[j].x;
            objects[(j + 1) * numParams + 1] = json.p[j].y;
            objects[(j + 1) * numParams + 2] = json.p[j].r;
            objects[(j + 1) * numParams + 3] = json.p[j].k;
            objects[(j + 1) * numParams + 4] = json.p[j].i;
        }
        return objects;
    }
    rewind() {
        this.fs.rewind();
        if (this.fs.isEndOfFile())
            return;
        let s = this.fs.readBlockAsText(this.initialSequenceSize);
    }
}
//# sourceMappingURL=worker.js.map