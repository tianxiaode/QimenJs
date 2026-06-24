"use strict";
/**
 * Validation 包类型导出
 *
 * 验证规则类型从 schema 包导入
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
exports.ValidationPatternType = void 0;
// 从 schema 包导入枚举（需要作为值使用）
var schema_1 = require("@orbitjs/schema");
Object.defineProperty(exports, "ValidationPatternType", { enumerable: true, get: function () { return schema_1.ValidationPatternType; } });
// 本地类型
__exportStar(require("./context"), exports);
__exportStar(require("./processor"), exports);
__exportStar(require("./validate"), exports);
__exportStar(require("./base"), exports);
//# sourceMappingURL=index.js.map