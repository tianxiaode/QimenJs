import { HttpResponseContext, IResponseProcessor } from '../../../types/http';

/**
 * 传输守卫处理器
 * 职责：检查传输层是否发生故障，如果发生故障则抛出错误
 * 
 * 处理逻辑：
 * 1. 检查 metadata 中的 isTransportFailure 标记
 * 2. 如果存在传输故障，则返回拒绝承诺，包含具体的错误信息
 * 3. 如果没有传输故障，则原样放行，进入下一个处理器
 * 
 * @param context - HTTP 响应上下文
 * @returns 处理后的响应上下文或传输错误
 */
export const TransportFailureProcessor: IResponseProcessor = async (
    context: HttpResponseContext
) => {
    // 检查 metadata 里的标记
    if (context.metadata && context.metadata.isTransportFailure) {
        // 建议抛出具体的失败对象 (包含 reason, message, error)
        // 这样外层 catch 拿到的数据更纯粹
        return Promise.reject(context.metadata.error);
    }

    // 如果没有传输故障，原样放行，进入下一个处理器（如 HttpStatusProcessor）
    return context;
};