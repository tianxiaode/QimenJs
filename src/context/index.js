"use strict";
/**
 * 上下文包 - 统一导出
 *
 * 提供基础上下文、请求上下文等类型定义和构建器
 * 用于管道执行、验证、HTTP 请求、数据处理等场景
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
exports.RequestContextBuilder = void 0;
// 导出基础上下文
__exportStar(require("./base"), exports);
// 导出类型
__exportStar(require("./types"), exports);
// 导出构建器
var RequestContextBuilder_1 = require("./RequestContextBuilder");
Object.defineProperty(exports, "RequestContextBuilder", { enumerable: true, get: function () { return RequestContextBuilder_1.RequestContextBuilder; } });
//# sourceMappingURL=index.js.map