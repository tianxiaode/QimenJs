import { HttpResponseContext, IResponseProcessor } from '../../types';

/**
 * [6] 数据提取处理器
 * 职责：此时已确定是成功响应，直接交付数据
 */
export const DataExtractorProcessor: IResponseProcessor = async (context: HttpResponseContext) => {
    // 对于标准 RESTful，直接把解析后的 body 丢给 UI 即可
    return context.data;
};
