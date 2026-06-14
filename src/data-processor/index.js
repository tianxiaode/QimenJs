"use strict";
/**
 * 数据处理管道模块入口
 *
 * @module data-processor
 *
 * 提供统一的数据处理管道系统，通过关键字路由不同的处理逻辑
 *
 * 核心概念：
 * - DataProcessorRegistrar: 统一注册器，管理所有数据处理管道
 * - DataProcessorHandler: 处理器，管道的基本处理单元
 * - DataProcessorKey: 关键字，用于标识不同的管道
 *
 * 使用方式：
 * 1. 注册处理器
 * 2. 执行管道
 *
 * @example
 * import { DataProcessor } from '@orbitjs/data-processor';
 *
 * // 注册处理器
 * DataProcessor.register('abp-post', {
 *     name: 'abp-extract',
 *     weight: 100,
 *     handle: async (ctx) => {
 *         // 数据提取逻辑
 *     }
 * });
 *
 * // 执行管道
 * await DataProcessor.execute('abp-post', context);
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
exports.dataProcessorExecutor = exports.DataProcessorExecutor = exports.DataProcessorRegistrarName = exports.DataProcessor = exports.DataProcessorRegistrar = void 0;
// 导出类型
__exportStar(require("./types"), exports);
// 导出权重
__exportStar(require("./weights"), exports);
// 导出错误类
__exportStar(require("./errors"), exports);
// 导出注册器
var DataProcessorRegistrar_1 = require("./DataProcessorRegistrar");
Object.defineProperty(exports, "DataProcessorRegistrar", { enumerable: true, get: function () { return DataProcessorRegistrar_1.DataProcessorRegistrar; } });
Object.defineProperty(exports, "DataProcessor", { enumerable: true, get: function () { return DataProcessorRegistrar_1.DataProcessor; } });
Object.defineProperty(exports, "DataProcessorRegistrarName", { enumerable: true, get: function () { return DataProcessorRegistrar_1.DataProcessorRegistrarName; } });
// 导出执行器
var executor_1 = require("./executor");
Object.defineProperty(exports, "DataProcessorExecutor", { enumerable: true, get: function () { return executor_1.DataProcessorExecutor; } });
Object.defineProperty(exports, "dataProcessorExecutor", { enumerable: true, get: function () { return executor_1.dataProcessorExecutor; } });
// 导出模块增强（必须在最后）
__exportStar(require("./register"), exports);
// 导出通用管道（稍后实现）
// export * from './common';
//# sourceMappingURL=index.js.map