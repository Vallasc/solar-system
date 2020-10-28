"use strict";
var Loop = /** @class */ (function () {
    function Loop(canvas, states) {
        var _this = this;
        this.stop = false;
        this.lastTime = 0;
        this.iteration = 0;
        this.dt = 200;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.states = states;
        setTimeout(function () { _this.draw(0); }, 1000);
    }
    Loop.prototype.draw = function (time) {
        var _this = this;
        var seconds = (time - this.lastTime) / 1000;
        this.lastTime = time;
        this.context.save();
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.restore();
        this.drawStates();
        //console.log("loop");
        if (!this.stop) {
            window.requestAnimationFrame(function (time) { return _this.draw(time); });
            //setTimeout(()=>{ this.draw(time)}, this.dt);
        }
    };
    Loop.prototype.drawStates = function () {
        if (this.iteration >= this.states.length) {
            this.stop = true;
            return;
        }
        for (var i = 0; i < this.states[this.iteration].length; i++)
            this.states[this.iteration][i].drawOnCanvas(this.context);
        this.iteration++;
    };
    Loop.prototype.reset = function () {
        if (this.stop) {
            this.stop = false;
            this.draw(0);
        }
        this.lastTime = 0;
        this.iteration = 0;
    };
    return Loop;
}());
//# sourceMappingURL=loop.js.map