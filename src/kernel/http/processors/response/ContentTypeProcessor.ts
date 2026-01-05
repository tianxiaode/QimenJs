import { HttpResponseContext, IResponseProcessor } from '../../../types/http';

/**
 * [3] 内容类型处理器
 * 职责：提取 Content-Type 并填充元数据，为后续解析提供依据
 * 
 * 处理逻辑：
 * 1. 从响应头中获取 Content-Type（兼容大小写不同的情况）
 * 2. 提取主 MIME 类型（去掉 charset=utf-8 等后缀）
 * 3. 设置元数据标记：isJson、isText、isBlob
 * 4. 原样返回上下文，不做任何数据改动
 * 
 * @param context - HTTP 响应上下文
 * @returns 处理后的响应上下文
 */
export const ContentTypeProcessor: IResponseProcessor = async (context: HttpResponseContext) => {
    // 1. 获取原始 Header (考虑到不同平台可能的 key 大小写差异)
    const headers = context.headers || {};
    const rawContentType = (headers['content-type'] || headers['Content-Type'] || '').toLowerCase();

    // 2. 提取主 MIME 类型 (去掉 charset=utf-8 等后缀)
    // 例如: "application/json; charset=utf-8" -> "application/json"
    const mimeType = rawContentType.split(';')[0].trim();

    // 3. 填充元数据
    context.metadata.contentType = mimeType;
    context.metadata.isJson = mimeType === 'application/json';
    context.metadata.isText = mimeType.startsWith('text/');

    // 识别是否为二进制流/图片（后续 DataExtractor 可能会用到）
    context.metadata.isBlob =
        mimeType.startsWith('image/') ||
        mimeType.startsWith('audio/') ||
        mimeType.startsWith('video/') ||
        mimeType === 'application/octet-stream';

    // 4. 原样返回上下文，不做任何数据改动
    return context;
};