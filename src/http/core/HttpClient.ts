import { FetchTransport, XhrTransport } from '../transport';
import {
    HttpMethod,
    HttpResponseContext,
    IHeaderProcessor,
    IHttpRequest,
    IHttpTransport,
    IResponseProcessor,
    IUrlProcessor,
    RequestOptions,
    RequestResult,
    RequestTask,
} from '../types';

/**
 * HttpClient
 * ------------------------------------------------------------------
 * 一个“纯工具型”的 HTTP 请求协调器。
 *
 * 【它做什么】
 * - 负责一次 HTTP 请求的完整生命周期编排：
 *   1. 执行 URL 处理流水线（IUrlProcessor）
 *   2. 执行 Header 处理流水线（IHeaderProcessor）
 *   3. 根据 options 选择具体的传输实现（Fetch / XHR）
 *   4. 执行响应处理流水线（IResponseProcessor）
 *   5. 提供统一的取消（Abort）能力
 *
 * - HttpClient 只负责“流程”，不负责“语义”
 *
 * 【它刻意不做什么（非常重要）】
 * - ❌ 不假设任何后端协议规范（REST / GraphQL / RPC 等）
 * - ❌ 不根据 HTTP status 判断成功或失败
 * - ❌ 不解析 JSON，也不假设返回一定是 JSON
 * - ❌ 不做错误结构识别（如 code / message / error 等）
 * - ❌ 不做数据提取或字段映射
 * - ❌ 不做本地化、错误提示、重试、兜底包装
 * - ❌ 不内置业务中间件或拦截器
 *
 * 所有“如何理解响应”的逻辑：
 * - 包括错误识别、数据提取、状态码解释、非 200 返回处理等
 * - 都应通过 IResponseProcessor 以流水线方式注入
 *
 * 【设计原则】
 * - 工具不做决定，只提供能力
 * - 不猜测、不兜底、不隐藏细节
 * - 所有复杂性外移到可组合、可替换的 Processor 中
 *
 * 【关于错误】
 * - Transport 层应返回失败结果，而不是直接抛异常
 * - HttpClient 本身不捕获异常，也不包装错误
 * - 是否抛错、何时抛错，由 ResponseProcessor 决定
 *
 * 【关于扩展】
 * - 不同系统、不同协议、不同错误规范：
 *   通过组合不同的 Processor 来适配
 * - 同一个 HttpClient 可以服务于多种后端，只取决于配置
 *
 * 如果你正在考虑在这里加 if / else 来处理“某种特殊情况”：
 * 👉 请先考虑是否应该新增一个 Processor。
 */
export class HttpClient {
    private readonly fetchTransport: IHttpTransport;
    private readonly xhrTransport: IHttpTransport;

    private readonly urlProcessors: IUrlProcessor[];
    private readonly headerProcessors: IHeaderProcessor[];
    private readonly responseProcessors: IResponseProcessor[];
    private readonly baseUrl: string;

    constructor(config: {
        baseUrl?: string;
        fetchTransport?: IHttpTransport;
        xhrTransport?: IHttpTransport;
        urlProcessors?: IUrlProcessor[];
        headerProcessors?: IHeaderProcessor[];
        responseProcessors?: IResponseProcessor[];
    }) {
        this.fetchTransport = config.fetchTransport || new FetchTransport();
        this.xhrTransport = config.xhrTransport || new XhrTransport();

        this.urlProcessors = config.urlProcessors || [];
        this.headerProcessors = config.headerProcessors || [];
        this.responseProcessors = config.responseProcessors || [];
        this.baseUrl = config.baseUrl || '';
    }

    public request<T>(
        method: HttpMethod,
        url: string,
        options: RequestOptions = {}
    ): RequestTask<T> {
        // 1. 确保信号控制权限
        const controller = options.signal ? null : new AbortController();
        const signal = options.signal || controller!.signal;
        const initialUrl = this.combineBaseUrl(this.baseUrl, url);
        // 2. 预处理：URL 流水线
        const finalUrl = this.urlProcessors.reduce((u, fn) => fn(u, options), initialUrl);

        // 3. 预处理：Headers 流水线
        const finalHeaders = this.headerProcessors.reduce(
            (h, fn) => fn(h, finalUrl, method, options),
            { ...options.headers }
        );

        // 4. 构建请求模型 (将整合后的信号存入 options)
        const req: IHttpRequest = {
            url: finalUrl,
            method,
            headers: finalHeaders,
            body: options.body,
            options: { ...options, signal },
        };

        // 5. 引擎选择
        const transport = options.useXhr ? this.xhrTransport : this.fetchTransport;

        // 6. 执行与响应流水线
        const promise = (async () => {
            // 1. 获取 Transport 原始结果
            // 假设 transport.send 返回的是：{ status: 200, headers: {...}, data: "..." }
            const rawResult = await transport.send(req);
            // 2. 转换为标准上下文 (隔离变化)
            let context = this.createContext(rawResult, options);

            // 3. 顺序执行处理器流水线
            // 现在 fn 接收的是 context，返回的也是经过加工的 context
            for (const fn of this.responseProcessors) {
                // 这里的 await 保证了异步处理和 reject 熔断机制
                context = await fn(context, options);
            }

            // 4. 返回最终结果
            // 最后一个处理器（DataExtractorProcessor）通常会直接返回 data 字段
            // 所以这里的 context 此时可能已经是最终的业务数据对象了
            return context as T;
        })();

        return {
            promise,
            cancel: () => (controller ? controller.abort() : null),
        };
    }

    // --- 语法糖 (通过 normalizeOptions 统一收拢引擎倾向) ---

    public get<T>(url: string, options?: RequestOptions) {
        return this.request<T>('GET', url, this.normalizeOptions(false, options));
    }

    public post<T>(url: string, body: any, options?: RequestOptions) {
        return this.request<T>('POST', url, this.normalizeOptions(false, { ...options, body }));
    }

    public put<T>(url: string, body: any, options?: RequestOptions) {
        return this.request<T>('PUT', url, this.normalizeOptions(false, { ...options, body }));
    }

    public patch<T>(url: string, body: any, options?: RequestOptions) {
        return this.request<T>('PATCH', url, this.normalizeOptions(false, { ...options, body }));
    }

    public head<T>(url: string, options?: RequestOptions) {
        return this.request<T>('HEAD', url, this.normalizeOptions(false, options));
    }

    public delete<T>(url: string, options?: RequestOptions) {
        return this.request<T>('DELETE', url, this.normalizeOptions(false, options));
    }

    public upload<T>(
        url: string,
        body: any,
        onProgress: (ev: ProgressEvent) => void,
        options?: RequestOptions
    ) {
        return this.request<T>(
            'POST',
            url,
            this.normalizeOptions(true, { ...options, body, onProgress })
        );
    }

    private normalizeOptions(useXhr: boolean, options: RequestOptions = {}): RequestOptions {
        return {
            useXhr: options.useXhr ?? useXhr,
            ...options,
            headers: { ...options.headers },
        };
    }

    private combineBaseUrl(base: string, relative: string): string {
        if (!base || /^https?:\/\//.test(relative)) return relative;
        const cleanBase = base.endsWith('/') ? base : `${base}/`;
        const cleanRelative = relative.startsWith('/') ? relative.slice(1) : relative;
        return `${cleanBase}${cleanRelative}`;
    }

    private createContext(result: RequestResult, options: RequestOptions): HttpResponseContext {
        // 处理传输失败的情况
        if (result.isTransportFailure) {
            return {
                status: -1,
                headers: {},
                data: null,
                metadata: {
                    isTransportFailure: true,
                    isHttpSuccess: false,
                    error: result,
                    contentType: '',
                    isJson: false,
                },
            } as HttpResponseContext;
        }

        // 处理正常响应的情况
        return {
            status: result.status,
            headers: result.headers,
            // 将 transport 的 rawBody 映射为流水线的初始 data
            data: result.rawBody,
            metadata: {
                isTransportFailure: false,
                isHttpSuccess: false,
                contentType: '',
                isJson: false,
            },
        } as HttpResponseContext;
    }
}
