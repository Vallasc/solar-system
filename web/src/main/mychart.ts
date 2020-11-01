class Mychart {

    private canvas : HTMLCanvasElement;
    private context : CanvasRenderingContext2D;
    private chart : typeof Chart; 

    constructor(canvas: HTMLCanvasElement, time : Array<number>, data : Array<number>) {
        this.canvas = canvas;
        this.canvas.height = 400;
        this.context = <CanvasRenderingContext2D> canvas.getContext("2d");
        this.chart = new Chart(this.context, {
            type: 'line',
            data: {
                labels: time,
                datasets: [{ 
                    data: data,
                    label: "Body",
                    borderColor: "#3e95cd",
                    fill: false
                }
                ]
            },
            options: {
                scales: {
                    yAxes: [{
                      ticks: {
                       suggestedMax: 116000,
                       suggestedMin: 109000
                       }
                     }]
                },
                //options to remove animation
                animation: {
                    duration: 0 // general animation time
                },
                hover: {
                    animationDuration: 0 // duration of animations when hovering an item
                },
                responsiveAnimationDuration: 0, // animation duration after a resize
                title: {
                    display: true,
                    text: 'Evolution of Internal Energy'
                    }
            }
        });
    }

    public updateChart(data : number) : void {
        //this.chart.data.labels?.shift();
        //this.chart.data.labels?.push(); 
        this.chart.data.datasets?.forEach((dataset: { data: number[]; }) => {
            dataset.data?.shift();
            dataset.data?.push(data);
        });
        this.chart.update();
    }
}