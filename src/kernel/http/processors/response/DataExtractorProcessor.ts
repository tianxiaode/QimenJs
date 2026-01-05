import { HttpResponseContext, IResponseProcessor } from '../../../types/http';

/**
 * [6] 数据提取处理器
 * 职责：此时已确定是成功响应，直接交付数据
 * 
 * 处理逻辑：
 * - 对于标准 RESTful 响应，直接把解析后的 body 数据返回给调用方
 * - 此处理器是响应处理链的最后一步
 * 
 * @param context - HTTP 响应上下文
 * @returns 解析后的响应数据
 */
export const DataExtractorProcessor: IResponseProcessor = async (context: HttpResponseContext) => {
    // 对于标准 RESTful，直接把解析后的 body 丢给 UI 即可
    return context.data;
};