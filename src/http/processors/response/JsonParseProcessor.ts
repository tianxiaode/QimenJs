import { HttpResponseContext, IResponseProcessor } from '../../types';

export const JsonParseProcessor: IResponseProcessor = async (context: HttpResponseContext) => {
    // 依据上一步打的标签来执行
    if (context.metadata.isJson && typeof context.data === 'string' && context.data.length > 0) {
        try {
            context.data = JSON.parse(context.data);
        } catch (e) {
            // 此时可以决定是抛错，还是保留原样让 RestError 处理
            // 建议：如果标了是 JSON 但解析失败，通常意味着数据损坏
            return Promise.reject({ type: 'PARSE_ERROR', message: 'Invalid JSON format' });
        }
    }
    return context;
};
