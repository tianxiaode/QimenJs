import { HttpResponseContext, IResponseProcessor } from '../../types';

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
