"use strict";
/**
 * 数据处理管道错误类
 *
 * @module data-processor/errors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonPipelineNotFoundError = exports.InvalidProcessorError = exports.ProcessorExecutionError = exports.ProcessorNotFoundError = exports.DataProcessorError = void 0;
/**
 * 数据处理错误基类
 */
class DataProcessorError extends Error {
    constructor(message, code, context) {
        super(message);
        this.code = code;
        this.context = context;
        this.name = 'DataProcessorError';
    }
}
exports.DataProcessorError = DataProcessorError;
/**
 * 处理器未找到错误
 */
class ProcessorNotFoundError extends DataProcessorError {
    constructor(key, handlerName) {
        super(handlerName
            ? `Handler "${handlerName}" not found in pipeline "${key}"`
            : `Pipeline "${key}" not found`, 'PROCESSOR_NOT_FOUND', { key, handlerName });
        this.name = 'ProcessorNotFoundError';
    }
}
exports.ProcessorNotFoundError = ProcessorNotFoundError;
/**
 * 处理器执行错误
 */
class ProcessorExecutionError extends DataProcessorError {
    constructor(handlerName, originalError) {
        super(`Handler "${handlerName}" execution failed: ${originalError.message || originalError}`, 'PROCESSOR_EXECUTION_FAILED', { handlerName, originalError });
        this.handlerName = handlerName;
        this.originalError = originalError;
        this.name = 'ProcessorExecutionError';
    }
}
exports.ProcessorExecutionError = ProcessorExecutionError;
/**
 * 无效处理器错误
 */
class InvalidProcessorError extends DataProcessorError {
    constructor(reason, processor) {
        super(`Invalid processor: ${reason}`, 'INVALID_PROCESSOR', { reason, processor });
        this.name = 'InvalidProcessorError';
    }
}
exports.InvalidProcessorError = InvalidProcessorError;
/**
 * 通用管道未找到错误
 */
class CommonPipelineNotFoundError extends DataProcessorError {
    constructor(name) {
        super(`Common pipeline "${name}" not found`, 'COMMON_PIPELINE_NOT_FOUND', { name });
        this.name = 'CommonPipelineNotFoundError';
    }
}
exports.CommonPipelineNotFoundError = CommonPipelineNotFoundError;
//# sourceMappingURL=index.js.map