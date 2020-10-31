class Loop {
    private canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;
    private buffer : Fifo<any>;
    private file : File | null;

    private worker : Worker;
    private workerIsStopped : boolean;
    private workerTimeout : number;
    private workerIntervalTime : number;

    private fastMode : boolean = true;
    private state : number = 0; // 0 stop, 1 play, 2 pause

    constructor( canvas: HTMLCanvasElement) {

        this.canvas = canvas;
        this.context = <CanvasRenderingContext2D> canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;

        this.context.fillStyle = "white"; 
        this.setMatrix(this.canvas.width/2, this.canvas.height/2, 1, 0);

        this.file = null;
        this.buffer = new Fifo();

        this.worker = new Worker('./dist/worker/worker.js');
        this.workerIsStopped = true;
        this.workerTimeout = 0;
        this.workerIntervalTime = 200;
    }


    private draw() : void {
        
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();

        this.drawStates();

        //let imageData: ImageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        //this.drawStatesImageData(imageData.data, imageData.width, imageData.height);
        //this.context.putImageData(imageData, 0, 0);

        //console.log(this.buffer.size);
        if( this.state == 1 ){
            window.requestAnimationFrame(() => this.draw());
        }
    }
    private setMatrix(x: number, y: number, scale: number, rotate: number){
        var xAx = Math.cos(rotate) * scale;  // the x axis x
        var xAy = Math.sin(rotate) * scale;  // the x axis y
        this.context.setTransform(xAx, xAy, -xAy, -xAx, x, y);
    }

    private drawStatesImageData(pixels: Uint8ClampedArray, canvasWidth: number, canvasHeight: number){
        if(this.buffer != null){
            let el = this.buffer.pop();
            //console.log(this.buffer.size);
            if(el == null) return;
            for(let i=0; i<el.p.length; i++){
                if(el.p[i].x < canvasWidth && el.p[i].x >0 && el.p[i].y < canvasWidth && el.p[i].y >0){
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
        } else {
            this.state = 0;
        }
    }
    private drawStates(){
        let numParams = 5;
        if(this.buffer != null){
            let objects = this.buffer.pop();
            if(objects == null) return;
            //console.log(this.buffer.size);
            this.context.beginPath();
            for(let i=1; i<=objects[0]; i++){
                    //this.context.beginPath();
                    //this.context.drawImage(this.brush, objects[i * numParams] -3, objects[i * numParams + 1] -3)
                    this.context.moveTo(objects[i * numParams], objects[i * numParams + 1]);
                    this.context.arc(objects[i * numParams], objects[i * numParams + 1], objects[i * numParams + 2], 0, 2 * Math.PI);
                    //this.context.fillStyle = "white"; 
                    //this.context.fill();
            }
            this.context.fill();
        } else {
            this.state = 0;
        }
    }

    public play(){
        if(this.state == 1) return;
        if(!this.fastMode){
            this.requestData();
        }
        this.state = 1;
        this.draw();
    }

    public pause(){
        if(this.state == 2) return;
        if(!this.fastMode){
            clearTimeout(this.workerTimeout); 
        }
        this.state = 2;
    }

    public stop(){
        if(this.state == 0) return;
        if(!this.fastMode){
            this.workerIntervalTime = 200;
            this.worker.postMessage({"type": "stop"});
            clearTimeout(this.workerTimeout); 
        }
        this.state = 0;
        this.buffer.clear();
        this.loadFile();
    }

    public playPause(){
        if(this.state == 0)
            this.play();
        else if(this.state == 1)
            this.pause()
        else if(this.state == 2)
            this.play();
    }

    private requestData(){
        if(this.workerIsStopped){
            //console.log(this.buffer.size);
            if(this.buffer.size < 600){
                this.worker.postMessage({"type": "read"});
                this.workerIsStopped = false;
            } else {
                this.workerIntervalTime += this.workerIntervalTime * 1/3;
            }
        }
        this.workerTimeout = setTimeout(() => {
            this.requestData();
        }, this.workerIntervalTime)
    }

    public loadFile(file: File | null = this.file){
        if(file == null) return;
        this.file = file
        //if( this.file.size > 100000000){ //100MB this.fastMode
        //    this.fastMode = false;
        //    this.loadFileChunck(this.file);
        //} else {
            this.fastMode = true;
            this.loadFileAll(this.file);
        //}
    }
    private loadFileAll(file: File){
        let reader = new FileReader();
        let self = this;
        reader.onload = function(event) {
            //self.buffer = Deserializer.parseJsonFifo(<string> reader.result);
            self.buffer = Deserializer.parseJsonFloat64Array(<string> reader.result);
        };
        reader.readAsText(file);
    }

    private loadFileChunck(file: File){
        this.worker.postMessage({"type": "file", "data": file});

        this.worker.onmessage = (event) => {
            let response = event.data;
            //console.log(event.data);
            if(response.fileName != this.file!.name) return;

            this.workerIsStopped = response.end;
            this.buffer.push(response.array);
            this.workerIntervalTime = response.time * response.numIt /2;
        };
    }

    public setReadingMode(mode : boolean){
        this.fastMode = mode;
    }

}

