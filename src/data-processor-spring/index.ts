/**
 * @qimenjs/data-processor-spring
 *
 * Spring (Spring Boot / Spring Data) 数据处理管道处理器
 *
 * 提供与 Spring 后端框架对接的标准数据处理管道：
 * - 前道：分页参数转换（page/size/sort）
 * - 后道：Page<T> 提取、错误处理
 *
 * 引入此包即自动注册所有 Spring 处理器到 DataProcessor。
 * 如需自定义配置，调用 registerSpringHandlers(options) 重新注册。
 *
 * @example
 * ```ts
 * // 默认配置（引入即生效）
 * import '@qimenjs/data-processor-spring';
 *
 * // 自定义配置
 * import { registerSpringHandlers } from '@qimenjs/data-processor-spring';
 * registerSpringHandlers({ defaultPageSize: 20 });
 * ```
 */

export * from './types';
export { getSpringPreHandlers, createSpringPaginationHandler } from './pre';
export {
    getSpringPostHandlers,
    createSpringExtractHandler,
    createSpringErrorHandler,
} from './post';

// 自动注册（必须在最后）
export * from './register';
