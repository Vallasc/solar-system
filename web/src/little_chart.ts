declare var Chart : any;

class LittleChart {

    private canvas : HTMLCanvasElement;
    public container : HTMLElement;
    private div : HTMLElement;
    private context : CanvasRenderingContext2D;
    private chart : any; 
    private width : number = 305;
    private height : number = 300;

    private size : number;

    constructor(titles: Array<string>, colors: Array<string>) {
        this.size = titles.length;
        this.container = document.createElement("div");
        this.container.setAttribute("style", "width: 100%; overflow: auto; display: flex; flex-direction: column-reverse;");
        this.div = document.createElement("div");
        this.div.setAttribute("style", "width: " + this.width + "px; height: " + this.height + "px; position: relative;");
        this.container.appendChild(this.div);

        this.canvas = <HTMLCanvasElement> document.createElement("canvas");
        this.canvas.height = this.height;
        //this.canvas.width = this.width;
        this.context = <CanvasRenderingContext2D> this.canvas.getContext("2d");
        this.div.appendChild(this.canvas);

        let datasets = [];
        for(let i=0; i<titles.length; i++){
            datasets.push({
                label: titles[i],
                borderWidth: 1,
               // backgroundColor: "rgba(255, 0, 0, 0.6)",
                borderColor: colors[i],
                filled: false,
                data: []
            });
        }
        this.chart = new Chart(this.context, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                tooltips: {
                    mode: "index"
                },
                elements: {
                    line: {
                        tension: 0 // disables bezier curves
                    },
                    point: { 
                        radius: 0,
                        hitRadius: 10, 
                        hoverRadius: 3 
                    } 
                },
                maintainAspectRatio: false,
                responsive: false,
                legend: {
                    display: true,
                    align: "start",
                    labels: {
                        fontColor: "#ebebeb",
                        fontSize: 10,
                    }
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: "#ebebeb",
                            callback: function(val: any) {
                                return val.toExponential()
                            }
                        },
                        gridLines: {
                            zeroLineColor: '#ffffff'
                        }
                    }],
                    xAxes: [{
                        type: 'linear',
                        position: 'bottom',
                        ticks: {
                            fontColor: "#ebebeb",
                            autoSkip: true,
                            maxRotation: 0,
                            minRotation: 0,
                        },
                        gridLines: {
                            zeroLineColor: '#ffffff'
                        }
                    }]
                },
                animation: {
                    duration: 0 // general animation time
                },
                hover: {
                    animationDuration: 0 // duration of animations when hovering an item
                },
                responsiveAnimationDuration: 0, // animation duration after a resize
                pan: {
                    enabled: true,
                    mode: "x",
                    speed: 10,
                    threshold: 5
                },
                zoom: {
                    enabled: true,
                    //drag: true,
                    mode: "x",
                    speed: 0.1,
                    threshold: 2,
                    sensitivity: 3
                }
            }
        });
    }

    public updateChart( data : Array<{x : number, y : number}>) : void {
        for(let i=0; i<this.size; i++){
            this.chart.data.datasets[i].data.push({x: new Date(data[i].x), y: data[i].y});
        }
        this.chart.update();
    }

    public deleteData() : void {
        for(let i=0; i<this.size; i++){
            this.chart.data.datasets[i].data = [];
        }
        this.chart.update();
    }
}