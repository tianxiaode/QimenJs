/**
 * 数据处理管道错误类
 *
 * @module data-processor/errors
 */
/**
 * 数据处理错误基类
 */
export declare class DataProcessorError extends Error {
    readonly code: string;
    readonly context?: any | undefined;
    constructor(message: string, code: string, context?: any | undefined);
}
/**
 * 处理器未找到错误
 */
export declare class ProcessorNotFoundError extends DataProcessorError {
    constructor(key: string, handlerName?: string);
}
/**
 * 处理器执行错误
 */
export declare class ProcessorExecutionError extends DataProcessorError {
    readonly handlerName: string;
    readonly originalError: any;
    constructor(handlerName: string, originalError: any);
}
/**
 * 无效处理器错误
 */
export declare class InvalidProcessorError extends DataProcessorError {
    constructor(reason: string, processor?: any);
}
/**
 * 通用管道未找到错误
 */
export declare class CommonPipelineNotFoundError extends DataProcessorError {
    constructor(name: string);
}
//# sourceMappingURL=index.d.ts.map