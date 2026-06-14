"use strict";
/**
 * 管道执行器
 *
 * 统一的管道执行器，内置监控和日志功能
 * 所有模块（validation、http、data-processor）都应该使用此执行器
 *
 * @module pipeline
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipeline = exports.Pipeline = void 0;
// 导出类型
__exportStar(require("./types"), exports);
// 导出执行器
var executor_1 = require("./executor");
Object.defineProperty(exports, "Pipeline", { enumerable: true, get: function () { return executor_1.Pipeline; } });
Object.defineProperty(exports, "pipeline", { enumerable: true, get: function () { return executor_1.pipeline; } });
//# sourceMappingURL=index.js.map