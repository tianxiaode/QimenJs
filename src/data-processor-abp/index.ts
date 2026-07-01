/**
 * @orbitjs/data-processor-abp
 *
 * ABP (ASP.NET Boilerplate) 数据处理管道处理器
 *
 * 提供与 ABP 后端框架对接的标准数据处理管道：
 * - 前道：分页参数转换（skipCount/takeCount）、租户 Header 注入
 * - 后道：PagedResultDto 提取、审计字段清理、软删除过滤、错误处理
 *
 * 引入此包即自动注册所有 ABP 处理器到 DataProcessor。
 * 如需自定义配置，调用 registerAbpHandlers(options) 重新注册。
 *
 * @example
 * ```ts
 * // 默认配置（引入即生效）
 * import '@orbitjs/data-processor-abp';
 *
 * // 自定义配置
 * import { registerAbpHandlers } from '@orbitjs/data-processor-abp';
 * registerAbpHandlers({ tenantId: 'my-tenant', defaultPageSize: 20 });
 * ```
 */

export * from './types';
export { getAbpPreHandlers, createAbpPaginationHandler, createAbpTenantHeaderHandler } from './pre';
export { getAbpPostHandlers, createAbpExtractHandler, createAbpAuditCleanHandler, createAbpSoftDeleteFilterHandler, createAbpErrorHandler, convertToFieldErrors } from './post';

// 自动注册（必须在最后）
export * from './register';
