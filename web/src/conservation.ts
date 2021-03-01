class Conservation {
    public angMomStart : string = "0";
    public angMomEnd : string = "0";
    public angMomErr : string = "0";
    public momentumStartX : string = "0";
    public momentumEndX : string = "0";
    public momentumStartY : string = "0";
    public momentumEndY : string = "0";
    public energyStart : string = "0";
    public energyEnd : string = "0";
    public energyErr : string = "0"; 

    private file : File;
    private fileManager : FileManager | null;

    constructor() {
        this.file = new File([],"");
        this.fileManager = null;
    }

    public async reset(file: File = this.file) {
        console.log("reset");
        try {
            this.file = file
            await this.loadFile(file);
        } catch (e) {
            console.error(e);
        }
        //this.drawAxes();
        this.getValues();
        Startup.slider.value = "0";
        Startup.slider.max = this.fileManager!.getNumIterations() + "";
    }

    public async loadFile(file: File) : Promise<void> {
        Startup.gui.Loader(true);
        this.fileManager = new FileManager(file);
        await this.fileManager.init();
        /*if(this.forceLoadAllCheckbox){

        }*/
        Startup.gui.Loader(false);
        return;
    }

    public getValues() : void {
        this.angMomStart = this.fileManager!.getMomAngStart();
        this.angMomEnd = this.fileManager!.getMomAngEnd();
        this.angMomErr = this.fileManager!.getMomAngErr();
        this.momentumStartX = this.fileManager!.getMomentumStartX();
        this.momentumEndX = this.fileManager!.getMomentumEndX();
        this.momentumStartY = this.fileManager!.getMomentumStartY();
        this.momentumEndY = this.fileManager!.getMomentumEndY();
        this.energyStart = this.fileManager!.getEnergyStart();
        this.energyEnd = this.fileManager!.getEnergyEnd();
        this.energyErr = this.fileManager!.getEnergyErr();
    }
}