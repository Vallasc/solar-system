declare var Plotly : any;

class ChartStartup{
    public static layoutPlot1 : any;
    public static plot1 : any;
    public static fileManager : FileManager;
    public static potentialSize : number;
    public static lastIndex : number;

    public static main(): number {
        return 0;
    }

    public static reset() {
        document!.getElementById("file")!.innerHTML = (<any> window).file.name;
        ChartStartup.loadFile((<any> window).file);
        ChartStartup.lastIndex = -1;
    }

    private static async loadFile(file: File) {
        ChartStartup.fileManager = new FileManager(file);
        await ChartStartup.fileManager .init();
        let energies = await ChartStartup.fileManager.getEnergies();
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
                autorange: true,
                fixedrange: false
            },
            xaxis: {
                rangeslider:{},
            },
            height: 600,
            autosize: true // set autosize to rescale
        };
        
        let options = {};
        
        ChartStartup.plot1 = await Plotly.newPlot('plot1', data, ChartStartup.layoutPlot1, options);
        let timeDiv = document.getElementById("time1");
        timeDiv!.innerHTML = " t∈"+ChartStartup.getEnergiesTime(energies,0,99);

        let isPressing = false;
        window.onmousedown = (event: any)=>{
            isPressing = true;
        }
        window.onmouseup = (event: any)=>{
            if(isPressing){
                let initRangeX0 = ChartStartup.layoutPlot1.xaxis.range[0];
                let initRangeX1 = ChartStartup.layoutPlot1.xaxis.range[1];
                let index = ChartStartup.potentialSize*initRangeX0/99;
                ChartStartup.drawPotentialsPlot(Math.floor(index));
                timeDiv!.innerHTML = " t∈"+ChartStartup.getEnergiesTime(energies,initRangeX0,initRangeX1);
            }
            isPressing = false;
        }

        ChartStartup.potentialSize = ChartStartup.fileManager.getPotentials().length;
        ChartStartup.drawPotentialsPlot(0);
    }

    public static getEnergiesTime(energies : EnergyArray, start : number, end : number) : string {
        let size = energies.size-1;
        console.log(size);
        console.log(start);
        console.log(end);
        if(end > 99) end = 99;
        if(start < 0) start = 0;
        let startTime = energies.getTime(Math.floor(start * size / 99));
        let endTime = energies.getTime(Math.floor(end * size / 99));
        return '['+startTime.toFixed(3)+', '+endTime.toFixed(3)+']';
    }

    public static async drawPotentialsPlot(index : number){
        if(ChartStartup.lastIndex != index){
            ChartStartup.lastIndex = index;
            let time = ChartStartup.fileManager.getPotentials()[index].time;
            document.getElementById("time2")!.innerHTML = " t="+time;
            let z = (await ChartStartup.fileManager.getPotential(index)).getMatrix();
            console.log(z);
            let x = [];
            let y = [];
            for (let i = 0; i < z.length; i++) {
                x[i] = Array<number>();
                y[i] = Array<number>();
                for (let j = 0; j < z[i].length; j++) {
                    x[i].push((i -(z.length/2)) * 5);
                    y[i].push((j -(z[i].length/2)) * 5);
                }
            }
            let data = [
                {
                    x: x,
                    y: y,
                    z: z,
                    type: 'surface',
                    colorscale:'Bluered',
                    reversescale: true,
                    lighting: {specular: 8, fresnel: 5},
                    contours: {
                      z: {
                        show:true,
                        usecolormap: true,
                        highlightcolor:"#42f462",
                        project:{z: true}
                      }
                    }
                }
              ];

            let layout = {
                height: 800,
                utosize: true, // set autosize to rescale
                margin: {
                    l:100, r:100, b:100, t:100
                },
                scene: {
                    zaxis: {
                        title : "Unità arbitrarie"
                    },
                    /*
                    yaxis: {
                        range: [-80,80]
                    }*/
                }
            };
            Plotly.newPlot('plot2', data, layout);
        }
    }
}