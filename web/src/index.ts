const canvas : HTMLCanvasElement = document.getElementById("main-canvas") as HTMLCanvasElement;
const ctx : CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;

ctx.beginPath();
ctx.arc(100, 75, 50, 0, 2 * Math.PI);
ctx.stroke();