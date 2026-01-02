import { HttpResponseContext, IResponseProcessor } from '../../types';

/**
 * [5] 标准 RESTful 错误处理器
 * 职责：当协议层标记失败时，负责“提取并抛出”错误详情
 */
export const RestErrorProcessor: IResponseProcessor = async (context: HttpResponseContext) => {
    // 1. 直接读取 HttpStatusProcessor 存入的“裁判结果”
    if (context.metadata.isHttpSuccess) {
        // 既然协议层说是成功的，直接放行给 DataExtractor
        return context;
    }

    // 2. 只有在 isHttpSuccess 为 false 时才执行这里
    // 此时 context.data 已经被 JsonParseProcessor 尝试处理过了
    return Promise.reject({
        type: 'REST_ERROR',
        status: context.status,
        // 提取后端返回的错误上下文（如：{ error: "Unauthorized", code: 40101 }）
        details: context.data,
        message: context.data?.message || `Request failed with status ${context.status}`,
    });
};
