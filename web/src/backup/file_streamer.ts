class FileStreamer {
    private offset: number = 0;
    private readonly defaultChunkSize = 64 * 1024; // bytes
  
  
    constructor(private file: File) {
      this.rewind();
    }
  
    public rewind(): void {
      this.offset = 0;
    }
  
    public isEndOfFile(): boolean {
      return this.offset >= this.getFileSize();
    }
  
    public readBlockAsText(length: number = this.defaultChunkSize) {
  
      const fileReader: FileReader = new FileReader();
      const blob: Blob = this.file.slice(this.offset, this.offset + length);
      this.file.stream
  
  
      return new Promise<string>((resolve, reject) => {

        fileReader.onloadend = (event: ProgressEvent) => {
          const target: FileReader = (event.target) as FileReader;
          if (target.error == null) {
            const result: string = <string> target.result;
            this.offset += result.length;
            this.testEndOfFile();
            resolve(result);
          } else {
            reject(target.error);
          }

        };

        fileReader.readAsText(blob);
      });
    }
  
    private testEndOfFile(): void {
      if (this.isEndOfFile()) {
        console.log('Done reading file');
      }
    }
  
    private getFileSize(): number {
      return this.file.size;
    }
}

class JsonStreamer{
  private fs: FileStreamer;

  private readonly initialSequenceSize: number = 12;
  private readonly initialSequenceElementSize: number = 16;
  private readonly afterElementSize: number = 1;

  private buffer: string;
  private chunkSize: number;

  constructor(fs : FileStreamer){
    this.fs = fs;
    this.buffer = "";
    this.chunkSize = 200;
  }
  public async init() :Promise<void | null>{
    if(this.fs.isEndOfFile()) return null;
    let s = await this.fs.readBlockAsText(this.initialSequenceSize);
    console.log(s);
  }
  
  public async read() :Promise<object | null>{

    if (!this.fs.isEndOfFile()) {
      let s1 = await this.fs.readBlockAsText(this.initialSequenceElementSize);
      console.log(s1);
      if(s1 == ']}') return null;

      let n = parseInt(s1.slice(8,16)) || null;
      if(n == null) return null;
      console.log(n);
      let s2 = await this.fs.readBlockAsText(n - this.initialSequenceElementSize + this.afterElementSize);
      console.log(s1+s2);
      return JSON.parse(s1+s2.slice(0,-1));

    }
    return null;
  }


}