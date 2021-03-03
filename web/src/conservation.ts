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

    public async reset(fileManager: FileManager | null= this.fileManager) {
        console.log("reset");
        try {
            this.fileManager = fileManager
            await this.loadFile(fileManager);
        } catch (e) {
            console.error(e);
        }
        this.getValues();
        Startup.slider.value = "0";
        Startup.slider.max = fileManager!.getNumIterations() + "";
    }

    private async loadFile(fileManager: FileManager | null) : Promise<void> {
        Startup.gui.Loader(true);
        await fileManager!.init();
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