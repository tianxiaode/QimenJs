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
import { prepareRequest } from './request-helper';

/**
 * HttpClient
 * ------------------------------------------------------------------
 * 一个高度解耦、流水线驱动的 HTTP 请求协调器。
 *
 * 【核心定位】
 * - 负责 HTTP 请求生命周期的“编排（Orchestration）”，而非“决策（Decision）”。
 * - HttpClient 只负责流程流转，不负责业务语义。
 *
 * 【它做什么】
 * 1. 执行 URL 处理流水线 (IUrlProcessor) - 如：BaseUrl 拼接、版本号注入、参数序列化。
 * 2. 执行 Header 处理流水线 (IHeaderProcessor) - 如：Token 注入、设备信息采集。
 * 3. 引擎调度 - 根据 options 选择 Fetch 或 XHR 传输实现。
 * 4. 执行响应处理流水线 (IResponseProcessor) - 顺序加工响应数据。
 * 5. 上下文标准化 - 确保无论成功或失败，返回/抛出的结构永远一致（HttpResponseContext）。
 * 6. 统一取消能力 - 通过 AbortController 实现对底层传输的实时中断。
 *
 * 【设计禁区 (The "NO" List)】
 * - ❌ 不假设后端规范：不内置对 REST/GraphQL/RPC 等协议的偏见。
 * - ❌ 不做成功判定：不根据 HTTP Status (200/500) 预设逻辑，判定权交由 Processor。
 * - ❌ 不做自动转换：不预设 JSON 解析，解析逻辑应作为流水线的第一道工序。
 * - ❌ 不识别错误结构：不做 code/message 字段提取，保持对数据结构的无感知。
 * - ❌ 不内置业务行为：不做 UI 提示、重试、多语言处理、兜底数据包装。
 * - ❌ 不内置重试机制：重试属于业务决策（涉及幂等性与副作用），应由上层 Task 层显式控制。
 *
 * 【重试决策哲学】
 * - HttpClient 这一层不适合做自动重试。重试应当由“任务层”根据业务场景决定：
 * GET 请求可能可以重试，但涉及资金的 POST 请求自动重试极其危险。
 *
 * 【关于状态控制 (Pause/Resume)】
 * - HttpClient 仅提供“原子级”的中断能力 (Abort)。
 * - ❌ 不内置“暂停”或“恢复”逻辑。
 * - 暂停与继续本质上是【任务流】的控制行为，应由上层调度器通过：
 * 1. 销毁当前请求 (Cancel)
 * 2. 保持业务状态 (State)
 * 3. 重新发起请求 (Re-request)
 * 这三者组合来实现。
 *
 * 【异常处理逻辑】
 * - HttpClient 捕获异常仅用于“上下文标准化 (Normalization)”。
 * - 它确保调用者在 `catch` 块中拿到的永远是标准的 `HttpResponseContext`。
 * - 该对象完整带回了原始的 `options`，方便上层根据请求上下文（如 retry 策略）进行二次调度。
 *
 * 【扩展方式】
 * - 所有复杂性外移到可组合、可替换的 Processor 中。
 * - 如果你想加 `if/else` 处理某种特殊情况，请先考虑是否应新增一个 Processor。
 *
 * @example
 * const client = new HttpClient({
 * responseProcessors: [statusProcessor, jsonParser, businessErrorChecker, dataExtractor]
 * });
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

    /**
     * 统一请求入口
     */
    public request<T>(
        method: HttpMethod,
        url: string,
        options: RequestOptions = {}
    ): RequestTask<T> {
        const controller = options.signal ? null : new AbortController();
        const signal = options.signal || controller!.signal;

        const promise = (async (): Promise<T> => {
            let currentContext: HttpResponseContext | null = null;

            try {
                // 1. 调用公共预处理函数
                const { finalUrl, finalHeaders, signal, controller } = prepareRequest(
                    this.baseUrl,
                    url,
                    method,
                    options,
                    this.urlProcessors,
                    this.headerProcessors
                );

                // 2. 执行物理请求
                const transport = options.useXhr ? this.xhrTransport : this.fetchTransport;
                const rawResult = await transport.send({
                    url: finalUrl,
                    method,
                    headers: finalHeaders,
                    body: options.body,
                    options: { ...options, signal },
                });

                // 3. 构建并加工上下文 (合并后的工厂方法)
                currentContext = this.toContext(rawResult, options);

                for (const fn of this.responseProcessors) {
                    currentContext = await fn(currentContext, options);
                }

                return currentContext as T;
            } catch (err: any) {
                // 4. 异常转换：如果是 Processor reject 出来的，直接抛出；否则包装成 Context
                const errorContext = err && err.metadata ? err : this.toContext(err, options);
                throw errorContext;
            }
        })();

        return {
            promise,
            cancel: () => (controller ? controller.abort() : null),
        };
    }

    // --- 内部辅助方法 ---

    /**
     * 统一上下文工厂：处理成功响应、物理失败、原生异常
     * 将 options 带回 context，实现闭环
     */
    private toContext(
        input: RequestResult | Error | any,
        options: RequestOptions
    ): HttpResponseContext {
        // 判定是否为 Transport 返回的标准结果
        const isRawResult = input && typeof (input as any).status === 'number';

        const context: HttpResponseContext = {
            status: isRawResult ? input.status : -1,
            headers: isRawResult ? input.headers || {} : {},
            data: isRawResult ? input.rawBody : null,
            // 将 options 存入 context，方便后续 Processor 和外部调用者读取
            options: options,
            metadata: {
                isTransportFailure: !isRawResult || !!input.isTransportFailure,
                isHttpSuccess: false,
                isAborted: input?.name === 'AbortError' || input?.metadata?.isAborted,
                error: isRawResult ? input.error : input,
                contentType: '',
                isJson: false,
            },
        };

        return context;
    }

    private normalizeOptions(useXhr: boolean, options: RequestOptions = {}): RequestOptions {
        return {
            ...options,
            useXhr: options.useXhr ?? useXhr,
            headers: { ...options.headers },
        };
    }

    // --- 语义化语法糖 ---

    public get<T>(url: string, options?: RequestOptions) {
        return this.request<T>('GET', url, this.normalizeOptions(false, options));
    }

    public post<T>(url: string, body: any, options?: RequestOptions) {
        return this.request<T>('POST', url, this.normalizeOptions(false, { ...options, body }));
    }

    public put<T>(url: string, body: any, options?: RequestOptions) {
        return this.request<T>('PUT', url, this.normalizeOptions(false, { ...options, body }));
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
}
