"use strict";
/**
 * Schema 包
 *
 * 提供数据结构定义和验证规则定义
 *
 * @module @orbitjs/schema
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
exports.SchemaRegistrarName = exports.SchemaRegistrar = void 0;
// 类型导出
__exportStar(require("./types"), exports);
// 注册器导出
var SchemaRegistrar_1 = require("./SchemaRegistrar");
Object.defineProperty(exports, "SchemaRegistrar", { enumerable: true, get: function () { return SchemaRegistrar_1.SchemaRegistrar; } });
Object.defineProperty(exports, "SchemaRegistrarName", { enumerable: true, get: function () { return SchemaRegistrar_1.SchemaRegistrarName; } });
//# sourceMappingURL=index.js.map