const bodyNumParams = 6;
const numIterations : number = 128;
let fileStream : FileStreamerSync;
let file : File;

// This fixes `self`'s type.
(self as DedicatedWorkerGlobalScope).onmessage = function (e: MessageEvent) {

  let request = e.data;
  if(request.type == "file"){
    console.log(request.data);
    file = request.data;
    fileStream = new FileStreamerSync(request.data);
  }

  if(request.type == "read"){
    let startTime;
    let endTime;

    let array: Float32Array | null = new Float32Array(0);
    for(let i=0; i<numIterations && array != null; i++) {
      startTime = Date.now();
      array = fileStream.readFloat32Array();
      endTime = Date.now();
      postMessage({
        "endFile": false,
        "endChunck": i==numIterations-1, 
        "array": array, 
        "time": endTime-startTime,
        "numIt": numIterations,
        "fileName": file.name
      }); 
    }
    if(array == null){
      return postMessage({
        "endFile": true, 
        "endChunck": true, 
        "fileName": file.name
      }); 
    }
  }

  if(request.type == "stop"){
    fileStream.rewind();
  }
}

class FileStreamerSync {
  private offset: number = 0;
  private readonly defaultChunkSize = 1024; // bytes


  constructor(private file: File) {
    this.rewind();
  }

  public rewind(): void {
    this.offset = 0;
  }

  public isEndOfFile(): boolean {
    return this.offset >= this.getFileSize();
  }

  public readBlockAsText(length: number = this.defaultChunkSize): string {

    const fileReader: FileReaderSync = new FileReaderSync();
    const blob: Blob = this.file.slice(this.offset, this.offset + length);
    const result: string = <string> fileReader.readAsText(blob);
    this.offset += result.length;
    return result;
  }

  public readBlockAsBinary(length: number = this.defaultChunkSize): ArrayBuffer {

    const fileReader: FileReaderSync = new FileReaderSync();
    const blob: Blob = this.file.slice(this.offset, this.offset + length);
    const result: ArrayBuffer = <ArrayBuffer> fileReader.readAsArrayBuffer(blob);
    this.offset += result.byteLength;
    return result;
  }

  private getFileSize(): number {
    return this.file.size;
  }

  public readFloat32Array() : Float32Array | null{
    const floatSize = 4;
    let header = new Float32Array(this.readBlockAsBinary(floatSize));
    if(header.length == 0) return null;
    let itLen : number = header[0];
    let floatArray = new Float32Array(this.readBlockAsBinary(floatSize*bodyNumParams*itLen));
    let objects = new Float32Array(header.length + floatArray.length);
    objects.set(header, 0);
    objects.set(floatArray, header.length);
    return objects;
  }
}