import { FileHashError, FileHashErrorCodes } from './FileHashError';
import { WorkerHashError, WorkerHashErrorCodes } from './WorkerHashErrorCodes';
import { AlgorithmHashError, AlgorithmHashErrorCodes } from './AlgorithmHashError';
import { UserOperationHashError, UserOperationErrorCodes } from './UserOperationHashError';
import { ResourceHashError, ResourceErrorCodes } from './ResourceErrorCodes';

/**
 * 🎯 错误工厂 - 创建标准化的错误对象
 */
export const HashErrorFactory = {
    // 文件错误
    fileReadError: (fileName: string, originalError?: Error, context?: Record<string, any>) =>
        new FileHashError(`Failed to read file: ${fileName}`, FileHashErrorCodes.FILE_READ_ERROR, {
            fileName,
            originalError,
            ...context,
        }),

    chunkReadError: (chunkIndex: number, offset: number, originalError?: Error) =>
        new FileHashError(
            `Failed to read chunk ${chunkIndex} at offset ${offset}`,
            FileHashErrorCodes.CHUNK_READ_ERROR,
            { chunkIndex, offset, originalError }
        ),

    // Worker错误
    workerCrashed: (workerId: number, originalError?: Error) =>
        new WorkerHashError(
            `Worker ${workerId} crashed unexpectedly`,
            WorkerHashErrorCodes.WORKER_CRASHED,
            { workerId, originalError }
        ),

    workerTimeout: (taskId: string, timeoutMs: number) =>
        new WorkerHashError(
            `Worker timeout after ${timeoutMs}ms for task ${taskId}`,
            WorkerHashErrorCodes.WORKER_TIMEOUT,
            { taskId, timeoutMs } as any
        ),

    // 算法错误
    algorithmError: (chunkIndex: number, algorithmName: string, originalError?: Error) =>
        new AlgorithmHashError(
            `Algorithm error on chunk ${chunkIndex} using ${algorithmName}`,
            AlgorithmHashErrorCodes.ALGORITHM_EXECUTION_ERROR,
            { chunkIndex, algorithmName, originalError }
        ),

    // 用户操作错误
    operationCancelled: () =>
        new UserOperationHashError(
            'Operation cancelled by user',
            UserOperationErrorCodes.OPERATION_CANCELLED
        ),

    operationPaused: () =>
        new UserOperationHashError('Operation is paused', UserOperationErrorCodes.OPERATION_PAUSED),

    // 资源错误
    memoryLimitExceeded: (limitMB: number, currentMB: number) =>
        new ResourceHashError(
            `Memory limit exceeded: ${currentMB.toFixed(1)}MB > ${limitMB}MB`,
            ResourceErrorCodes.MEMORY_LIMIT_EXCEEDED,
            { limit: limitMB, current: currentMB, resourceType: 'memory' }
        ),

    workerLimitExceeded: (maxWorkers: number, requested: number) =>
        new ResourceHashError(
            `Worker limit exceeded: requested ${requested}, maximum ${maxWorkers}`,
            ResourceErrorCodes.WORKER_LIMIT_EXCEEDED,
            { limit: maxWorkers, current: requested, resourceType: 'workers' }
        ),
};
