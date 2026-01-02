import { HttpResponseContext, IResponseProcessor } from '../../types';

/**
 * HTTP 状态处理器
 * 职责：检查 HTTP 状态码并设置元数据标记
 * 
 * 处理逻辑：
 * 1. 检查响应状态码是否在 200-299 范围内（表示成功）
 * 2. 设置 metadata.isHttpSuccess 标记
 * 3. 即使状态码是 400/500，也原样返回 context，让后续处理器继续处理
 * 
 * @param context - HTTP 响应上下文
 * @returns 处理后的响应上下文
 */
export const HttpStatusProcessor: IResponseProcessor = async (context: HttpResponseContext) => {
    const { status } = context;

    // 记录状态是否属于"协议成功"
    context.metadata.isHttpSuccess = status >= 200 && status < 300;

    // 即使状态码是 400/500，我们也原样返回 context，
    // 让后面的 JsonParseProcessor 继续解析 Body，
    // 让 RestErrorProcessor 去提取具体的业务错误码。
    return context;
};