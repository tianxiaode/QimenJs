"use strict";
/**
 * @fileoverview 内核错误模块的公共导出文件
 *
 * 此文件作为内核错误模块的统一入口，导出所有错误类型和错误代码，
 * 方便其他模块按需导入使用，避免深层路径引用
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
__exportStar(require("./KernelError"), exports);
__exportStar(require("./EntityError"), exports);
__exportStar(require("./GestureError"), exports);
__exportStar(require("./ComposableRegistrarError"), exports);
__exportStar(require("./StreamError"), exports);
__exportStar(require("./codes"), exports);
__exportStar(require("./EntityActionRegistrarError"), exports);
__exportStar(require("./SchemaRegistrarError"), exports);
//# sourceMappingURL=index.js.map