import { HttpMethod, IHeaderProcessor, IUrlProcessor, RequestOptions } from '../types';

/**
 * 核心预处理器：将复杂的配置转化为 Transport 能够理解的原始参数
 * 这个函数是无状态的，方便 HttpClient 和 StreamClient 共享
 * 
 * 该函数执行以下处理步骤：
 * 1. 处理请求信号（用于取消请求）
 * 2. 应用 URL 处理流水线
 * 3. 应用 Header 处理流水线
 * 
 * @param baseUrl 基础 URL
 * @param url 请求 URL
 * @param method HTTP 方法
 * @param options 请求选项
 * @param urlProcessors URL 处理器数组
 * @param headerProcessors Header 处理器数组
 * @returns 包含最终 URL、Header、信号和控制器的对象
 */
export function prepareRequest(
    baseUrl: string,
    url: string,
    method: HttpMethod,
    options: RequestOptions,
    urlProcessors: IUrlProcessor[],
    headerProcessors: IHeaderProcessor[]
): {
    finalUrl: string;
    finalHeaders: Record<string, string>;
    signal: AbortSignal;
    controller?: AbortController;
} {
    // 1. 处理信号与控制器
    // 如果外部已提供信号，则不创建新的 AbortController
    const controller = options.signal ? undefined : new AbortController();
    const signal = options.signal || controller!.signal;

    // 2. URL 处理流水线
    // 首先合并基础 URL 和请求 URL，然后依次应用 URL 处理器
    const initialUrl = combineBaseUrl(baseUrl, url);
    const finalUrl = urlProcessors.reduce((u, fn) => fn(u, options), initialUrl);

    // 3. Headers 处理流水线
    // 以请求选项中的 headers 为基础，依次应用 header 处理器
    const finalHeaders = headerProcessors.reduce((h, fn) => fn(h, finalUrl, method, options), {
        ...options.headers,
    });

    return {
        finalUrl,
        finalHeaders,
        signal,
        controller,
    };
}

/**
 * 内部工具：URL 拼接
 * 
 * 将基础 URL 和相对 URL 拼接成完整的 URL
 * 如果相对 URL 已经是完整 URL（以 http:// 或 https:// 开头），则直接返回
 * 
 * @param base 基础 URL
 * @param relative 相对 URL
 * @returns 拼接后的完整 URL
 */
export function combineBaseUrl(base: string, relative: string): string {
    // 如果没有基础 URL 或相对 URL 是完整 URL，则直接返回相对 URL
    if (!base || /^https?:\/\//.test(relative)) return relative;
    
    // 确保基础 URL 以斜杠结尾
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    // 确保相对 URL 不以斜杠开头
    const cleanRelative = relative.startsWith('/') ? relative.slice(1) : relative;
    
    // 拼接并返回完整 URL
    return `${cleanBase}${cleanRelative}`;
}