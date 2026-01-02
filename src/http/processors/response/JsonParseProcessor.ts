import { HttpResponseContext, IResponseProcessor } from '../../types';

/**
 * JSON 解析处理器
 * 职责：根据元数据标记解析 JSON 响应数据
 * 
 * 处理逻辑：
 * 1. 检查 metadata.isJson 标记以及响应数据类型
 * 2. 如果是 JSON 类型且数据为字符串，则尝试解析
 * 3. 解析失败时返回错误承诺，避免后续处理
 * 
 * @param context - HTTP 响应上下文
 * @returns 处理后的响应上下文或解析错误
 */
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