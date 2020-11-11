class NumberChart {

    private canvas : HTMLCanvasElement;
    public container : HTMLElement;
    private div : HTMLElement;
    private context : CanvasRenderingContext2D;
    private chart : typeof Chart; 
    private width : number = 280;
    private height : number = 250;

    constructor(title: string) {
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

        this.chart = new Chart(this.context, {
            type: 'line',
            data: {
                datasets: [{
                    backgroundColor: "rgba(255, 0, 0, 0.5)",
                    borderColor: "rgba(255, 0, 0, 1)",
                    filled: true,
                    data: []
                }]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        type: 'linear',
                        position: 'bottom'
                    }]
                },
                animation: {
                    duration: 200
                }
            }
        });
    }

    public updateChart(x : number, y : number) : void {
        // allow 1px inaccuracy by adding 1
        const isScrolledToLeft = this.container.scrollWidth- this.container.clientWidth <= this.container.scrollLeft + 1
        if(this.chart.data.datasets[0].data.length % 4 == 0){
            this.width += 30;
            this.div.style.width = this.width+'px';
        }
        // Scroll to left
        if (isScrolledToLeft) {
            this.container.scrollLeft = this.container.scrollWidth - this.container.clientWidth
        }
    
        this.chart.data.datasets[0].data.push({x: x, y: y});
        this.chart.update();
    }

    public deleteData() : void {
        this.width = 250;
        this.div.style.width = this.width+'px';
        this.chart.data.datasets[0].data = [];
        this.chart.update();
    }
}