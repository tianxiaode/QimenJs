import { TransportFailureReason } from './types';

/**
 * 描述一个“没有产生响应”的失败事实
 */
export interface HttpTransportFailure {
    // 核心标识：明确告诉调用者传输层挂了
    readonly isTransportFailure: true;
    readonly reason: TransportFailureReason;
    readonly message: string;
    readonly error?: any;
}
