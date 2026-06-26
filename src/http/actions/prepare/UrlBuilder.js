"use strict";
/**
 * @file UrlBuilder.ts
 * @description
 * 该文件负责构建完整的请求URL，包括基础URL、路径参数和查询参数。
 * 它会规范化基础URL路径、拼接路径参数并处理查询参数的编码和组装。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlBuilderHandler = void 0;
const UrlBuilderHandler = async (context) => {
    const { pathParams: segments = [], queryParams: query = {} } = context.request;
    const { baseUrl } = context.metadata.domainConfig || {};
    // 1. 基础路径处理 (防止双斜杠)
    // 如果没有 baseUrl，使用空字符串
    const normalizedBase = baseUrl ? baseUrl.replace(/\/+$/, '') : '';
    const path = segments.filter(Boolean).join('/');
    let url = path ? (normalizedBase ? `${normalizedBase}/${path}` : path) : normalizedBase;
    // 2. 使用 URLSearchParams 自动处理特殊字符转义和空值
    const searchParams = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
        }
    });
    const queryString = searchParams.toString();
    // 3. 组装最终 URL
    if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
    }
    context.request.url = url;
};
exports.UrlBuilderHandler = UrlBuilderHandler;
//# sourceMappingURL=UrlBuilder.js.map