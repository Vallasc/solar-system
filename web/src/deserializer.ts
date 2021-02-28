declare var zip : any;
zip.workerScriptsPath = "./dist/lib/zipjs/";

class EnergyArray {
  // Nel file delle energie l'indice dell'array corrisponde all'iterazione
  // size = numero di iterazioni
  // ["Total energy","Kinetic energy", "Internal energy", "Potential energy", "Binding energy"]

  private readonly numParamsRow = 6;
  private buffer : Float32Array;
  public size : number; 

  constructor(blob: ArrayBuffer){
    this.buffer = new Float32Array(blob);
    this.size = this.buffer.length / this.numParamsRow;
    console.log(this.size);
  }

  // index is in [0, 4]
  public getEnergy(index : number, type : number) : number { 
    return this.buffer[type + this.numParamsRow*index];
  }

  public getTime(index : number) : number {
    return this.buffer[5 + this.numParamsRow*index];
  }

  public getArrays(){
    let x = [];
    let time = [];
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
      time.push(this.buffer[5 + this.numParamsRow*i]);
    }
    return {
      x: x,
      time: time,
      yTotalEnergy: yTotalEnergy,
      yKineticEnergy: yKineticEnergy,
      yInternalEnergy: yInternalEnergy,
      yPotentialEnergy: yPotentialEnergy,
      yBindingEnergy: yBindingEnergy,
    }
  }

}

class PotentialMatrix {
  private buffer : Float32Array;
  public m : number; 
  public n : number; 
 
  constructor(blob: ArrayBuffer, m: number, n: number){
    this.buffer = new Float32Array(blob);
    this.m = m;
    this.n = n;
  }

  public getMatrix(){
    let matrix : Array<Array<number>> = [];
    for(let i=0; i<this.m; i++){
      matrix.push([])
      for(let j=0; j<this.n; j++){
        matrix[i].push(this.buffer[i*this.m + j]);
      }
    }
    console.log(matrix);
    return matrix;
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
  static readonly bodyNumParams = 5;
  static readonly numIterationParam = 2; // id + size

  private file : File;
  private numIterations : number;
  private bodies : Array<Float32Array>
  private fileIndex: number;
  private infoJson : any | null = null;
  private entriesMap : Map<string, any>;

  constructor(file: File){
    this.file = file;
    this.entriesMap = new Map<string, any>();
    this.numIterations = 0;
    this.fileIndex = 0;
    this.bodies = new Array<Float32Array>();
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
    this.numIterations = this.infoJson["numIteration"];
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

  public async getPotential(index : number) : Promise<PotentialMatrix> {
    let potentials : Array<any> = this.infoJson["potentials"];
    let saved = null;
    for( let i = 0; i< potentials.length; i++){
      if(index <= potentials[i]["iteration"]){
        saved = potentials[i];
        break;
      }
    }
    let blob = await ZipReader.getEntryFile(this.entriesMap.get(saved["fileName"]));
    let array: ArrayBuffer = await blob.arrayBuffer();
    return new PotentialMatrix(array, saved["xSize"], saved["ySize"]);
  }
  public getPotentialSize() : number {
    return this.infoJson["potentials"].length;
  }

  public getNumberOfBodies() : number {
    let N : number = this.infoJson["num_bodies"];
    return N;
  }

  public getMass() : number {
    let mass : number = this.infoJson["mass_i"];
    return mass;
  }

  public getMomAngStart() : string {
    return this.infoJson["ang_mom_tot_start"];
  }

  public getMomAngEnd() : string {
    return this.infoJson["ang_mom_tot_end"];
  }

  public getMomAngErr() : string {
    return this.infoJson["err_ang_mom"];
  }

  public getMomentumStartX() : string {
    return this.infoJson["mom_tot_x_start"];
  }

  public getMomentumEndX() : string {
    return this.infoJson["mom_tot_x_end"];
  }
  
  public getMomentumErrX() : string {
    return this.infoJson["err_momentum_x"];
  }

  public getMomentumStartY() : string {
    return this.infoJson["mom_tot_y_start"];
  }

  public getMomentumEndY() : string {
    return this.infoJson["mom_tot_y_end"];
  }
  
  public getMomentumErrY() : string {
    return this.infoJson["err_momentum_y"];
  }

  public getEnergyStart() : string {
    return this.infoJson["e_tot_start"];
  }

  public getEnergyEnd() : string {
    return this.infoJson["e_tot_end"];
  }
  
  public getEnergyErr() : string {
    return this.infoJson["err_E"];
  }
  
  private async loadNextFile() : Promise<void> {
    let file = await ZipReader.getEntryFile(this.entriesMap.get(this.infoJson["simFileName"] + this.fileIndex + ".bin"));
    let arrayBuffer = await file.arrayBuffer();
    let floatArray = new Float32Array(arrayBuffer);

    let objects : Float32Array;
    let offset = 0;
    try{
      for(let i=(FileManager.numIterationParam-1); i<floatArray.length; i= i + offset) {
        offset = FileManager.bodyNumParams*floatArray[i] + FileManager.numIterationParam;
        objects = new Float32Array(floatArray.slice(i-(FileManager.numIterationParam-1), i + offset))
        this.bodies.push(objects);
      }
    } catch (e) {
      throw Error("Failed parsing file");
    }

    this.fileIndex++;
  }

  public async getBodies( index: number): Promise<Float32Array | null> {
    // EOF
    if(index >= this.numIterations) return null;

    while(this.bodies.length <= index){
      await this.loadNextFile();
    }
    return this.bodies[index];
  }

  public getNumIterations() : number {
    return this.numIterations;
  }

}