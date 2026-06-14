"use strict";
/**
 * @file index.ts
 * @description
 * 手势处理器模块的聚合导出文件。
 *
 * 该文件统一导出手势处理器模块中的所有公共API，
 * 方便其他模块通过单一入口导入所需的手势处理器相关功能。
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
// 导出工厂函数
__exportStar(require("./factory"), exports);
// 导出手势处理器基类
__exportStar(require("./GestureProcessor"), exports);
// 导出具体的手势处理器类
__exportStar(require("./ContextMenuProcessor"), exports);
__exportStar(require("./DoubleTapProcessor"), exports);
__exportStar(require("./DragProcessor"), exports);
__exportStar(require("./HoverProcessor"), exports);
__exportStar(require("./LongPressProcessor"), exports);
__exportStar(require("./SubmitProcessor"), exports);
__exportStar(require("./SwipeProcessor"), exports);
__exportStar(require("./TapProcessor"), exports);
//# sourceMappingURL=index.js.map