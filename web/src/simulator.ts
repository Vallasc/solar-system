declare var createSimulatorIstance : any; // Entry point wasm

class Simulator {

    public N : number;
    public t_f : number;
    public dt : number;
    public rho : number;
    public v_max : number;
    public mass_i : number;
    public radius_i : number;

    public guiPanel : any;
    public filename : string;
    public textBox : HTMLElement;

    constructor(){
        this.N = 1000;
        this.t_f = 25;
        this.dt = 0.01;
        this.rho = 300;
        this.v_max = 3;
        this.mass_i = 50;
        this.radius_i = 1;
        this.filename = "generated.sim";
        this.textBox = <HTMLDivElement> document.createElement("div");
        this.makeGui();
    }

    public async runMain() : Promise<File> {
        let Module = await createSimulatorIstance(/* optional default settings */);
        //console.log(Module);
        Module._web_main(this.N, this.t_f, this.dt, this.rho, this.v_max, this.mass_i, this.radius_i);
        let file: File = new File([new Blob([Module.FS.readFile(this.filename)])], this.filename);
        return file;
    }

    private makeGui() : void{
        this.guiPanel = [{
            folder: 'Simulator',
            type: 'range',
            label: 'Numbers of bodies',
            min: 0, max: 10000, step: 1,
            object: this, property: "N",
        },{
            folder: 'Simulator',
            type: 'range',
            label: 'Final time',
            min: 1, max: 100, step: 1,
            object: this, property: "t_f",
        },{
            folder: 'Simulator',
            type: 'range',
            label: 'Time interval',
            min: 0.01, max: 4,
            object: this, property: "dt",
        },{
            folder: 'Simulator',
            type: 'range',
            label: 'Rho',
            min: 1, max: 1000,
            object: this, property: "rho",
        },{
            folder: 'Simulator',
            type: 'range',
            label: 'Maximum velocity',
            min: 0.1, max: 50,
            object: this, property: "v_max",
        },{
            folder: 'Simulator',
            type: 'range',
            label: 'Initial mass',
            min: 1, max: 300,
            object: this, property: "mass_i",
        },{
            folder: 'Simulator',
            type: 'range',
            label: 'Initial radius',
            min: 1, max: 300,
            object: this, property: "radius_i",
        },{
            folder: "Simulator",
            type: 'display',
            label: 'Stdout',
            element: this.textBox,
        }];
    }


}