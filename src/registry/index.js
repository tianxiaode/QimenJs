"use strict";
/**
 * Registry模块入口文件
 * 提供注册中心的核心功能和各类注册器
 *
 * 此文件作为registry模块的统一入口，导出所有相关的类型、类和实例
 * 通过此文件可以方便地访问注册中心的所有功能
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
// RegistryHub错误类
__exportStar(require("./errors"), exports);
// RegistryHub主类
__exportStar(require("./RegistryHub"), exports);
// 类型定义
__exportStar(require("./types"), exports);
__exportStar(require("./registrars"), exports);
const registrars_1 = require("./registrars");
const RegistryHub_1 = require("./RegistryHub");
const data_processor_1 = require("../data-processor");
// 初始化默认注册器
// 在模块加载时自动注册常用的注册器实例，确保它们随时可用
RegistryHub_1.RegistryHub.use(registrars_1.MimeTypeRegistrar.getInstance());
RegistryHub_1.RegistryHub.use(registrars_1.SystemRegistrar.getInstance());
RegistryHub_1.RegistryHub.use(registrars_1.HtmlTemplateRegistrar.getInstance());
RegistryHub_1.RegistryHub.use(registrars_1.DomainRegistrar.getInstance());
RegistryHub_1.RegistryHub.use(registrars_1.PatternRegistrar.getInstance());
RegistryHub_1.RegistryHub.use(data_processor_1.DataProcessorRegistrar.getInstance());
//# sourceMappingURL=index.js.map