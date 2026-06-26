/**
 * data-processor 包错误类测试
 */

import {
    DataProcessorError,
    ProcessorNotFoundError,
    ProcessorExecutionError,
    InvalidProcessorError,
    CommonPipelineNotFoundError
} from '@/data-processor/errors';

describe('data-processor/errors', () => {
    describe('DataProcessorError', () => {
        it('should create error with message and code', () => {
            const error = new DataProcessorError('Test error', 'TEST_CODE');

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(DataProcessorError);
            expect(error.message).toBe('Test error');
            expect(error.code).toBe('TEST_CODE');
            expect(error.name).toBe('DataProcessorError');
        });

        it('should create error with context', () => {
            const context = { key: 'value' };
            const error = new DataProcessorError('Test error', 'TEST_CODE', context);

            expect(error.context).toEqual(context);
        });
    });

    describe('ProcessorNotFoundError', () => {
        it('should create error for missing pipeline', () => {
            const error = new ProcessorNotFoundError('test-pipeline');

            expect(error).toBeInstanceOf(DataProcessorError);
            expect(error).toBeInstanceOf(ProcessorNotFoundError);
            expect(error.message).toBe('Pipeline "test-pipeline" not found');
            expect(error.code).toBe('PROCESSOR_NOT_FOUND');
            expect(error.name).toBe('ProcessorNotFoundError');
            expect(error.context).toEqual({ key: 'test-pipeline', handlerName: undefined });
        });

        it('should create error for missing handler', () => {
            const error = new ProcessorNotFoundError('test-pipeline', 'test-handler');

            expect(error.message).toBe('Handler "test-handler" not found in pipeline "test-pipeline"');
            expect(error.context).toEqual({ key: 'test-pipeline', handlerName: 'test-handler' });
        });
    });

    describe('ProcessorExecutionError', () => {
        it('should create error with original error', () => {
            const originalError = new Error('Original error');
            const error = new ProcessorExecutionError('test-handler', originalError);

            expect(error).toBeInstanceOf(DataProcessorError);
            expect(error).toBeInstanceOf(ProcessorExecutionError);
            expect(error.message).toBe('Handler "test-handler" execution failed: Original error');
            expect(error.code).toBe('PROCESSOR_EXECUTION_FAILED');
            expect(error.name).toBe('ProcessorExecutionError');
            expect(error.handlerName).toBe('test-handler');
            expect(error.originalError).toBe(originalError);
        });

        it('should handle non-Error original errors', () => {
            const error = new ProcessorExecutionError('test-handler', 'string error');

            expect(error.message).toBe('Handler "test-handler" execution failed: string error');
        });
    });

    describe('InvalidProcessorError', () => {
        it('should create error with reason', () => {
            const error = new InvalidProcessorError('Missing handle function');

            expect(error).toBeInstanceOf(DataProcessorError);
            expect(error).toBeInstanceOf(InvalidProcessorError);
            expect(error.message).toBe('Invalid processor: Missing handle function');
            expect(error.code).toBe('INVALID_PROCESSOR');
            expect(error.name).toBe('InvalidProcessorError');
        });

        it('should create error with reason and processor', () => {
            const processor = { name: 'test' };
            const error = new InvalidProcessorError('Missing handle function', processor);

            expect(error.context).toEqual({ reason: 'Missing handle function', processor });
        });
    });

    describe('CommonPipelineNotFoundError', () => {
        it('should create error for missing pipeline', () => {
            const error = new CommonPipelineNotFoundError('test-pipeline');

            expect(error).toBeInstanceOf(DataProcessorError);
            expect(error).toBeInstanceOf(CommonPipelineNotFoundError);
            expect(error.message).toBe('Common pipeline "test-pipeline" not found');
            expect(error.code).toBe('COMMON_PIPELINE_NOT_FOUND');
            expect(error.name).toBe('CommonPipelineNotFoundError');
            expect(error.context).toEqual({ name: 'test-pipeline' });
        });
    });
});
