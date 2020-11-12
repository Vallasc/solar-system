declare var zip : any;
zip.workerScriptsPath = "./dist/lib/zipjs/";

class Deserializer {
    static readonly bodyNumParams = 5;
    static readonly numIterationParam = 6; // 5 energie + size

    public static parseBinaryFloat32Array(blob: ArrayBuffer): Fifo<Float32Array> {
      let floatArray = new Float32Array(blob);
      let fifo: Fifo<Float32Array> = new Fifo();

      let objects : Float32Array;
      //let last : Float32Array | null = null;
      let offset = 0;
      try{
        for(let i=(Deserializer.numIterationParam-1); i<floatArray.length; i= i + offset) {
          offset = Deserializer.bodyNumParams*floatArray[i] + Deserializer.numIterationParam;
          //console.log(floatArray[i]);
          objects = new Float32Array(floatArray.slice(i-(Deserializer.numIterationParam-1), i + offset))
          fifo.push(objects);
          //console.log(objects);
        }
        return fifo;
      } catch (e) {
        throw Error("Failed parsing file");
      }
    }
}

class ZipReader {
  private static zipReader: any | null;
  public static async getEntries(file: File) : Promise<any> {
    return new Promise((resolve, reject) =>{
      zip.createReader(new zip.BlobReader(file), (zipReader: any) => {
          ZipReader.zipReader = zipReader;
        zipReader.getEntries( (entries: any) => resolve(entries));
      }, () => {console.log("Error loading zip"); reject("error")});
    });
  }

  public static async getEntryFile(entry: any) : Promise<ArrayBuffer> {
    return new Promise((resolve, reject) =>{
      entry.getData(new zip.BlobWriter(), async (blob: any) => {
        resolve(await blob.arrayBuffer());
      }, (p: any) => { //Decompressing loading
      });
    });
  }

  public static closeZipReader() {
    if(ZipReader.zipReader != null){
      ZipReader.zipReader.close();
      ZipReader.zipReader = null;
    }
  }
}