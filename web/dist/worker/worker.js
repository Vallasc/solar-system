"use strict";
const bodyNumParams = 6;
const numIterations = 128;
let fileStream;
let file;
// This fixes `self`'s type.
self.onmessage = function (e) {
    let request = e.data;
    if (request.type == "file") {
        console.log(request.data);
        file = request.data;
        fileStream = new FileStreamerSync(request.data);
    }
    if (request.type == "read") {
        let startTime;
        let endTime;
        let array = new Float32Array(0);
        for (let i = 0; i < numIterations && array != null; i++) {
            startTime = Date.now();
            array = fileStream.readFloat32Array();
            endTime = Date.now();
            postMessage({
                "endFile": false,
                "endChunck": i == numIterations - 1,
                "array": array,
                "time": endTime - startTime,
                "numIt": numIterations,
                "fileName": file.name
            });
        }
        if (array == null) {
            return postMessage({
                "endFile": true,
                "endChunck": true,
                "fileName": file.name
            });
        }
    }
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
    readBlockAsBinary(length = this.defaultChunkSize) {
        const fileReader = new FileReaderSync();
        const blob = this.file.slice(this.offset, this.offset + length);
        const result = fileReader.readAsArrayBuffer(blob);
        this.offset += result.byteLength;
        return result;
    }
    getFileSize() {
        return this.file.size;
    }
    readFloat32Array() {
        const floatSize = 4;
        let header = new Float32Array(this.readBlockAsBinary(floatSize));
        if (header.length == 0)
            return null;
        let itLen = header[0];
        let floatArray = new Float32Array(this.readBlockAsBinary(floatSize * bodyNumParams * itLen));
        let objects = new Float32Array(header.length + floatArray.length);
        objects.set(header, 0);
        objects.set(floatArray, header.length);
        return objects;
    }
}
//# sourceMappingURL=worker.js.map