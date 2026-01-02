import { HttpMethod, IHeaderProcessor, IUrlProcessor, RequestOptions } from '../types';

/**
 * 核心预处理器：将复杂的配置转化为 Transport 能够理解的原始参数
 * 这个函数是无状态的，方便 HttpClient 和 StreamClient 共享
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
    const controller = options.signal ? undefined : new AbortController();
    const signal = options.signal || controller!.signal;

    // 2. URL 处理流水线
    const initialUrl = combineBaseUrl(baseUrl, url);
    const finalUrl = urlProcessors.reduce((u, fn) => fn(u, options), initialUrl);

    // 3. Headers 处理流水线
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
 */
export function combineBaseUrl(base: string, relative: string): string {
    if (!base || /^https?:\/\//.test(relative)) return relative;
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanRelative = relative.startsWith('/') ? relative.slice(1) : relative;
    return `${cleanBase}${cleanRelative}`;
}
