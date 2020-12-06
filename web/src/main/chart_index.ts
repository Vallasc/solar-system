declare var Plotly : any;

class ChartStartup{

    public static main(): number {
        return 0;
    }

    public static reset() {
        document!.getElementById("file")!.innerHTML = (<any> window).file.name;
        ChartStartup.loadFile((<any> window).file);
    }

    private static async loadFile(file: File) {
        let fm = new FileManager(file);
        await fm.init();
        let energies = await fm.getEnergies();
        let arrays = energies.getArrays();
        
        var trace1 = {
            x: arrays.x,
            y: arrays.yTotalEnergy,
            type: 'scatter'
        };
        var trace2 = {
            x: arrays.x,
            y: arrays.yKineticEnergy,
            type: 'scatter'
        };
        var trace3 = {
            x: arrays.x,
            y: arrays.yInternalEnergy,
            type: 'scatter'
        };
        var trace4 = {
            x: arrays.x,
            y: arrays.yPotentialEnergy,
            type: 'scatter'
        };
        var trace5 = {
            x: arrays.x,
            y: arrays.yBindingEnergy,
            type: 'scatter'
        };
            
        var data = [trace1, trace2, trace3, trace4, trace5];
        var layout = {
            xaxis: {
                rangeslider:{},
            }
        };
        
        var options = {};
        
        Plotly.newPlot('plot1', data, layout, options);

        let p = await fm.getPotential(10);
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