"use strict";
/**
 * @file entries.ts
 * @description
 * 该文件定义了准备阶段(action prepare)的入口配置，包括公共参数增强器和URL构建器。
 * 这些入口配置定义了动作的名称、类别、描述、顺序偏移量和处理器。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlBuildEntry = exports.CommonParamsEnricherEntry = void 0;
const types_1 = require("../../types");
const CommonParamsEnricher_1 = require("./CommonParamsEnricher");
const UrlBuilder_1 = require("./UrlBuilder");
exports.CommonParamsEnricherEntry = {
    name: 'CommonParamsEnricher',
    category: types_1.ActionCategory.PREPARE, // 4000
    description: '从域配置中获取到的诸如appId等公共参数，添加到上下文中',
    offset: 200, // 同层内的细微排序
    handler: CommonParamsEnricher_1.CommonParamsEnricherHandler,
};
exports.UrlBuildEntry = {
    name: 'UrlBuild',
    category: types_1.ActionCategory.PREPARE, // 4000
    description: '根据上下文中的配置，生成请求的URL',
    offset: 300, // 同层内的细微排序
    handler: UrlBuilder_1.UrlBuildHandler
};
//# sourceMappingURL=entries.js.map