"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rotate = rotate;
const matrix_1 = require("./matrix");
const translate_1 = require("./translate");
function rotate(angle, cx = 0, cy = 0) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return (0, matrix_1.multiply)((0, matrix_1.multiply)((0, translate_1.translate)(cx, cy), [cos, sin, -sin, cos, 0, 0]), (0, translate_1.translate)(-cx, -cy));
}
//# sourceMappingURL=rotate.js.map