declare var Plotly : any;

class ChartStartup{
    public static layoutPlot1 : any;
    public static plot1 : any;
    public static fileManager : any;
    public static potentialSize : number;

    public static main(): number {
        return 0;
    }

    public static reset() {
        document!.getElementById("file")!.innerHTML = (<any> window).file.name;
        ChartStartup.loadFile((<any> window).file);
    }

    private static async loadFile(file: File) {
        ChartStartup.fileManager = new FileManager(file);
        await ChartStartup.fileManager .init();
        let energies = await ChartStartup.fileManager .getEnergies();
        let arrays = energies.getArrays();
        let data = [{
                name: 'Total energy',
                x: arrays.time,
                y: arrays.yTotalEnergy,
                type: 'scatter',
                line: {
                    color: '#ff0000',
                }
            },{
                name: 'Internal energy',
                x: arrays.time,
                y: arrays.yKineticEnergy,
                type: 'scatter',
                line: {
                    color: '#00ff4e',
                }
            },{
                name: 'Kinetic energy',
                x: arrays.time,
                y: arrays.yInternalEnergy,
                type: 'scatter',
                line: {
                    color: '#ffb100',
                }
            },{
                name: 'Potential energy',
                x: arrays.time,
                y: arrays.yPotentialEnergy,
                type: 'scatter',
                line: {
                    color: '#0066ff',
                }
            },{
                name: 'Binding energy',
                x: arrays.time,
                y: arrays.yBindingEnergy,
                type: 'scatter',
                line: {
                    color: '#ff00eb',
                }
            }
        ];

        ChartStartup.layoutPlot1 = {
            yaxis: {
                //type: 'log', 
                autorange: true
            },
            xaxis: {
                rangeslider:{},
            }
        };
        
        let options = {};
        
        ChartStartup.plot1 = await Plotly.newPlot('plot1', data, ChartStartup.layoutPlot1, options);
        let isPressing = false;
        window.onmousedown = (event: any)=>{
            isPressing = true;
            console.log("ko"); 
        }
        window.onmouseup = (event: any)=>{
            if(isPressing){
                let initRangeX = ChartStartup.layoutPlot1.xaxis.range[0];
                let index = ChartStartup.potentialSize*initRangeX/100;
                ChartStartup.drawPotentialsPlot(index);
            }
            isPressing = false;
            console.log("ok"); 
        }

        ChartStartup.potentialSize = ChartStartup.fileManager.getPotentialSize();
        ChartStartup.drawPotentialsPlot(0);
    }

    public static async drawPotentialsPlot(index : number){
        let p = await ChartStartup.fileManager.getPotential(index);
        let data2 = [
            {
              z: p.getMatrix(),
               type: 'surface'
            }
          ];
        var layout2 = {
        };
        Plotly.newPlot('plot2', data2, layout2);
    }
}