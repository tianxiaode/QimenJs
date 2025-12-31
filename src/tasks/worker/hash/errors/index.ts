import { AlgorithmHashError } from './AlgorithmHashError';
import { FileHashError } from './FileHashError';
import { ResourceHashError } from './ResourceErrorCodes';
import { UserOperationHashError } from './UserOperationHashError';
import { WorkerHashError } from './WorkerHashErrorCodes';

export { FileHashErrorCodes } from './FileHashError';
export { WorkerHashErrorCodes } from './WorkerHashErrorCodes';
export { AlgorithmHashErrorCodes } from './AlgorithmHashError';
export { UserOperationErrorCodes } from './UserOperationHashError';
export { ResourceErrorCodes } from './ResourceErrorCodes';
export * from './factory';
export * from './guards';

// 导出工厂和守卫
export { HashErrorFactory } from './factory';
export {
    HashErrorGuards,
    type ErrorRecoveryStrategy,
    DefaultErrorRecoveryStrategy,
} from './guards';

// 导出错误联合类型
export type HashError =
    | FileHashError
    | WorkerHashError
    | AlgorithmHashError
    | UserOperationHashError
    | ResourceHashError;
