"use strict";
/**
 * HashTask模块入口文件
 *
 * 该文件导出HashTask模块的所有公共API，包括工厂函数、数据块处理、错误定义、
 * 哈希计算核心功能、类型定义和Worker相关功能
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
__exportStar(require("./factory"), exports);
__exportStar(require("./chunk"), exports);
__exportStar(require("./errors"), exports);
__exportStar(require("./hash"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./worker"), exports);
//# sourceMappingURL=index.js.map