/**
 * @file CommonParamsEnricher.ts
 * @description
 * 该文件实现了公共参数增强器，负责将全局配置的公共参数（如queryParams和body参数）合并到HTTP请求中。
 * 支持静态参数和动态函数返回参数两种形式。
 */
import type { RequestContext } from '@orbitjs/context';
export declare const CommonParamsEnricherHandler: (context: RequestContext) => Promise<void>;
//# sourceMappingURL=CommonParamsEnricher.d.ts.map