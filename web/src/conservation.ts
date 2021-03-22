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

    public guiPanel : any;

    constructor() {
        this.file = new File([],"");
        this.fileManager = null;
        this.makeGui();
    }

    public async reset(fileManager: FileManager | null= this.fileManager) {
        this.fileManager = fileManager
        this.getValues();
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

    private makeGui() : void {
        this.guiPanel = [{
            type: 'display',
            folder: 'Angular Momentum',
            label: 'Initial:',
            object: this,
            property: 'angMomStart'
        },{
            type: 'display',
            folder: 'Angular Momentum',
            label: 'Final:',
            object: this,
            property: 'angMomEnd'
        },{
            type: 'display',
            folder: 'Angular Momentum',
            label: 'Difference (%):',
            object: this,
            property: 'angMomErr'
        },{
            type: 'display',
            folder: 'Momentum x',
            label: 'Initial:',
            object: this,
            property: 'momentumStartX'
        },{
            type: 'display',
            folder: 'Momentum x',
            label: 'Final:',
            object: this,
            property: 'momentumEndX'
        },{
            type: 'display',
            folder: 'Momentum y',
            label: 'Initial:',
            object: this,
            property: 'momentumStartY'
        },{
            type: 'display',
            folder: 'Momentum y',
            label: 'Final:',
            object: this,
            property: 'momentumEndY'
        },{
            type: 'display',
            folder: 'Energy',
            label: 'Initial:',
            object: this,
            property: 'energyStart'
        },{
            type: 'display',
            folder: 'Energy',
            label: 'Final:',
            object: this,
            property: 'energyEnd'
        },{
            type: 'display',
            folder: 'Energy',
            label: 'Difference (%):',
            object: this,
            property: 'energyErr'
        }];
    }
}