"use strict";
/**
 * 注册中心类型定义
 * 定义了系统配置、域配置等类型以及注册器名称常量
 *
 * 此文件包含了注册系统所需的所有类型定义，为TypeScript提供类型安全
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProcessorRegistrarName = exports.HtmlTemplateRegistrarName = exports.DomainRegistrarName = exports.MimeTypeRegistrarName = exports.PatternRegistrarName = exports.SystemRegistrarName = void 0;
/**
 * 注册器名称常量定义
 * 用于标识不同类型的注册器
 * 使用const断言确保类型安全，防止意外修改
 */
exports.SystemRegistrarName = 'system';
exports.PatternRegistrarName = 'pattern';
exports.MimeTypeRegistrarName = 'mimeType';
exports.DomainRegistrarName = 'domain';
exports.HtmlTemplateRegistrarName = 'html';
exports.DataProcessorRegistrarName = 'data-processor';
//# sourceMappingURL=types.js.map