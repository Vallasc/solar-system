"use strict";
var Body = /** @class */ (function () {
    function Body(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.x, x = _c === void 0 ? 0 : _c, _d = _b.y, y = _d === void 0 ? 0 : _d, _e = _b.vX, vX = _e === void 0 ? 0 : _e, _f = _b.vY, vY = _f === void 0 ? 0 : _f, _g = _b.accX, accX = _g === void 0 ? 0 : _g, _h = _b.accY, accY = _h === void 0 ? 0 : _h, _j = _b.radius, radius = _j === void 0 ? 1 : _j, _k = _b.mass, mass = _k === void 0 ? 0 : _k, _l = _b.k_energy, k_energy = _l === void 0 ? 0 : _l, _m = _b.internal_energy, internal_energy = _m === void 0 ? 0 : _m;
        this.x = 0;
        this.y = 0;
        this.vX = 0;
        this.vY = 0;
        this.accX = 0;
        this.accY = 0;
        this.radius = 0;
        this.mass = 0;
        this.k_energy = 0;
        this.internal_energy = 0;
        this.x = x;
        this.y = y;
        this.vX = vX;
        this.vY = vY;
        this.accX = accX;
        this.accY = accY;
        this.radius = radius;
        this.mass = mass;
        this.k_energy = k_energy;
        this.internal_energy = internal_energy;
    }
    Body.prototype.drawOnCanvas = function (ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.restore();
    };
    Body.prototype.print = function () {
        console.log("x: " + this.x + ", y: " + this.y);
    };
    return Body;
}());
//# sourceMappingURL=body.js.map