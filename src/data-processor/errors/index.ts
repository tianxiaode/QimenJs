/**
 * 数据处理管道错误类
 *
 * @module data-processor/errors
 */

/**
 * 数据处理错误基类
 */
export class DataProcessorError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context?: any
    ) {
        super(message);
        this.name = 'DataProcessorError';
    }
}

/**
 * 处理器未找到错误
 */
export class ProcessorNotFoundError extends DataProcessorError {
    constructor(key: string, handlerName?: string) {
        super(
            handlerName
                ? `Handler "${handlerName}" not found in pipeline "${key}"`
                : `Pipeline "${key}" not found`,
            'PROCESSOR_NOT_FOUND',
            { key, handlerName }
        );
        this.name = 'ProcessorNotFoundError';
    }
}

/**
 * 处理器执行错误
 */
export class ProcessorExecutionError extends DataProcessorError {
    constructor(
        public readonly handlerName: string,
        public readonly originalError: any
    ) {
        super(
            `Handler "${handlerName}" execution failed: ${originalError.message || originalError}`,
            'PROCESSOR_EXECUTION_FAILED',
            { handlerName, originalError }
        );
        this.name = 'ProcessorExecutionError';
    }
}

/**
 * 无效处理器错误
 */
export class InvalidProcessorError extends DataProcessorError {
    constructor(reason: string, processor?: any) {
        super(`Invalid processor: ${reason}`, 'INVALID_PROCESSOR', { reason, processor });
        this.name = 'InvalidProcessorError';
    }
}

/**
 * 通用管道未找到错误
 */
export class CommonPipelineNotFoundError extends DataProcessorError {
    constructor(name: string) {
        super(`Common pipeline "${name}" not found`, 'COMMON_PIPELINE_NOT_FOUND', { name });
        this.name = 'CommonPipelineNotFoundError';
    }
}
