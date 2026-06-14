"use strict";
// 字符串工具函数集合
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
// 基础字符串操作
__exportStar(require("./base"), exports);
// 文本替换和格式化
__exportStar(require("./format"), exports);
// CSS单位处理
__exportStar(require("./css"), exports);
// ID生成和唯一性处理
__exportStar(require("./id"), exports);
// 复数形式处理
__exportStar(require("./plural"), exports);
//# sourceMappingURL=index.js.map