"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matrixScale = matrixScale;
const matrix_1 = require("./matrix");
const translate_1 = require("./translate");
function matrixScale(sx, sy, cx = 0, cy = 0) {
    return (0, matrix_1.multiply)((0, matrix_1.multiply)((0, translate_1.translate)(cx, cy), [sx, 0, 0, sy, 0, 0]), (0, translate_1.translate)(-cx, -cy));
}
//# sourceMappingURL=scale.js.map