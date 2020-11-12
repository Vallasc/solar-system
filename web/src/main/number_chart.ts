class NumberChart {

    private canvas : HTMLCanvasElement;
    public container : HTMLElement;
    private div : HTMLElement;
    private context : CanvasRenderingContext2D;
    private chart : typeof Chart; 
    private width : number = 280;
    private height : number = 250;

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
                pointRadius: 2,
                pointHoverRadius: 8,
                //backgroundColor: "rgba(255, 0, 0, 0.6)",
                borderColor: colors[i],
                filled: true,
                data: []
            });
        }
        this.chart = new Chart(this.context, {
            type: 'line',
            data: {
                datasets: datasets
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                legend: {
                    display: true
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

    public updateChart( data : Array<{x : number, y : number}>) : void {
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
    
        for(let i=0; i<this.size; i++){
            this.chart.data.datasets[i].data.push({x: data[i].x, y: data[i].y});
        }
        this.chart.update();
    }

    public deleteData() : void {
        this.width = 250;
        this.div.style.width = this.width+'px';
        for(let i=0; i<this.size; i++){
            this.chart.data.datasets[i].data = [];
        }
        this.chart.update();
    }
}