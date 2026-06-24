/**
 * @file CommonParamsEnricher.ts
 * @description 
 * 该文件实现了公共参数增强器，负责将全局配置的公共参数（如queryParams和body参数）合并到HTTP请求中。
 * 支持静态参数和动态函数返回参数两种形式。
 */

import type { RequestContext } from '@orbitjs/context';

export const CommonParamsEnricherHandler = async (context: RequestContext) => {
    const { commonParams, commonBody } = context.metadata.domainConfig || {};

    // 1. 合并公共 Query 参数 (如 appId)
    if (commonParams) {
        // 修正：执行函数获取结果，如果没有结果则取原对象
        const common = typeof commonParams === 'function' ? commonParams() : commonParams;
        context.request.queryParams = { ...common, ...context.request.queryParams };
    }

    // 2. 合并公共 Body 参数
    if (commonBody) {
        // 修正：执行函数获取结果
        const bodyValue = typeof commonBody === 'function' ? commonBody() : commonBody;

        // 安全合并：确保当前有 body 且它是对象类型才进行扩展
        if (context.request.body && typeof context.request.body === 'object') {
            context.request.body = { ...bodyValue, ...context.request.body };
        } else if (!context.request.body) {
            // 如果原本没 Body，直接把公共 Body 塞进去
            context.request.body = bodyValue;
        }
    }
};
