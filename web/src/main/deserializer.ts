declare var zip : any;
zip.workerScriptsPath = "./dist/lib/zipjs/";

class Deserializer {
    static readonly bodyNumParams = 5;
    static readonly numIterationParam = 2; // id + size

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

class EnergyArray {
  // Nel file delle energie l'indice dell'array corrisponde all'iterazione
  // size = numero di iterazioni
  // ["Total energy","Kinetic energy", "Internal energy", "Potential energy", "Binding energy"]

  private readonly numParamsRow = 5;
  private buffer : Float32Array;
  private size : number; 

  constructor(blob: ArrayBuffer){
    this.buffer = new Float32Array(blob);
    this.size = this.buffer.length / this.numParamsRow;
    console.log(this.size);
  }

  public getEnergy(index : number, type : number) : number {
    return this.buffer[type + this.numParamsRow*index];
  }

  public getArrays(){
    let x = [];
    let yTotalEnergy = [];
    let yKineticEnergy = [];
    let yInternalEnergy = [];
    let yPotentialEnergy = [];
    let yBindingEnergy = [];
    for(let i = 0; i<this.size; i++){
      x.push(i);
      yTotalEnergy.push(this.buffer[0 + this.numParamsRow*i]);
      yKineticEnergy.push(this.buffer[1 + this.numParamsRow*i]);
      yInternalEnergy.push(this.buffer[2 + this.numParamsRow*i]);
      yPotentialEnergy.push(this.buffer[3 + this.numParamsRow*i]);
      yBindingEnergy.push(this.buffer[4 + this.numParamsRow*i]);
    }
    return {
      x: x,
      yTotalEnergy: yTotalEnergy,
      yKineticEnergy: yKineticEnergy,
      yInternalEnergy: yInternalEnergy,
      yPotentialEnergy: yPotentialEnergy,
      yBindingEnergy: yBindingEnergy
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

  public static async getEntryFile(entry: any) : Promise<Blob> {
    return new Promise((resolve, reject) =>{
      entry.getData(new zip.BlobWriter(), async (blob: any) => {
        resolve(blob);
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

class FileManager{
  private file : File;
  private infoJson : any | null = null;
  private entriesMap : Map<string, any>;

  constructor(file: File){
    this.file = file;
    this.entriesMap = new Map<string, any>();
  }

  public async init(){
    let entries = await ZipReader.getEntries(this.file);
    //console.log(entries);
    for(let i=0; i<entries.length; i++) {
      this.entriesMap.set(entries[i].filename, entries[i]);
    }
    let infoFile = await ZipReader.getEntryFile(this.entriesMap.get("info.json"));
    this.infoJson = JSON.parse(await infoFile!.text());
    console.log(this.infoJson);
  }

  public close(){
    ZipReader.closeZipReader();
  }

  public async getInfo() {
    return this.infoJson;
  }

  public async getEnergies() {
    let energiesFileName = this.infoJson["energiesFileName"];
    let blob = await ZipReader.getEntryFile(this.entriesMap.get(energiesFileName));
    let array: ArrayBuffer = await blob.arrayBuffer();
    return new EnergyArray(array);
  }

}