"use strict";
/**
 * Hash任务模块的公共API导出
 *
 * 该模块提供了一个用于处理大文件或数据流的哈希计算任务的完整解决方案，
 * 包括进度监控、暂停/恢复/取消操作、资源管理等功能。
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
__exportStar(require("./HashTask"), exports);
__exportStar(require("./HashTaskProgress"), exports);
__exportStar(require("./HashTaskResources"), exports);
__exportStar(require("./HashTaskRunner"), exports);
__exportStar(require("./HashTaskState"), exports);
__exportStar(require("./HashTaskHealthMonitor"), exports);
//# sourceMappingURL=index.js.map