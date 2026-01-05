import { IUrlProcessor, RequestOptions } from '../../../types/http';

/**
 * 查询参数处理器
 * 职责：将查询参数拼接到 URL 中
 * 
 * 处理逻辑：
 * 1. 从请求选项中获取查询参数对象
 * 2. 将查询参数转换为查询字符串格式 (key=value&key2=value2)
 * 3. 将查询字符串拼接到原始 URL 后面，如果 URL 已有查询参数则用 & 连接
 * 
 * @param url - 原始 URL 字符串
 * @param options - 请求选项，包含 queryParams 字段
 * @returns 拼接了查询参数的完整 URL 字符串
 */
export const QueryParamsProcessor: IUrlProcessor = (url: string, options: RequestOptions) => {
    const queryParams = options.queryParams || {};
    const queryParamsString = Object.keys(queryParams)
        .map(key => `${key}=${queryParams[key]}`)
        .join('&');
    
    if (!queryParamsString) return url;
    
    // 检查 URL 是否已包含查询参数
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${queryParamsString}`;
};