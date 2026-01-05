/**
 * HTTP 方法类型定义
 * 包含常见的 HTTP 请求方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';

/**
 * HTTP 响应类型定义
 * 定义了响应数据的解析方式
 */
export type HttpResponseType = 'json' | 'blob' | 'text' | 'arraybuffer';

/**
 * HTTP 请求选项接口
 * 定义了 HTTP 请求的基本配置选项
 */
export interface HttpOptions {
    /**
     * 请求超时时间（毫秒）
     */
    timeout: number;
    /**
     * 响应类型，指定响应数据的解析方式
     */
    responseType: HttpResponseType;
    /**
     * 是否携带凭据（如 cookies）
     */
    withCredentials?: boolean;
}

/**
 * 分块信息接口
 * 定义了分块上传/下载的相关信息
 */
export interface ChunkInfo {
    /**
     * 当前块的索引
     */
    index: number;
    /**
     * 总块数
     */
    total: number;
    /**
     * 块大小
     */
    chunkSize: number;
    /**
     * 分块标识符
     */
    identifier: string;
}

/**
 * 请求选项接口
 * 扩展了 HttpOptions，增加了更详细的请求配置选项
 */
export interface RequestOptions extends Partial<HttpOptions> {
    /**
     * 请求体数据
     */
    body?: any;
    /**
     * 请求头
     */
    headers?: Record<string, string>;
    /**
     * 路径参数数组
     */
    pathParams?: (string | number)[];
    /**
     * 查询参数对象
     */
    queryParams?: Record<string, any>;
    /**
     * 是否为流请求
     */
    stream?: boolean;
    /**
     * 分块信息
     */
    chunk?: ChunkInfo;
    /**
     * 中止信号，用于取消请求
     */
    signal?: AbortSignal;
    /**
     * 进度回调函数
     */
    onProgress?: (ev: ProgressEvent) => void;
    /**
     * 是否使用 XMLHttpRequest
     */
    useXhr?: boolean;
}

/**
 * HTTP 请求接口
 * 定义了 HTTP 请求的基本结构
 */
export interface IHttpRequest {
    /**
     * 请求 URL（只读）
     */
    readonly url: string;
    /**
     * 请求方法（只读）
     */
    readonly method: string;
    /**
     * 请求头（只读）
     */
    readonly headers: Record<string, string>;
    /**
     * 请求体（只读）
     */
    readonly body?: any;
    /**
     * 请求选项（只读）
     */
    readonly options: RequestOptions;
}

/**
 * 请求任务接口
 * HttpClient.request 返回的高层对象，包含 Promise 和取消方法
 */
export interface RequestTask<T> {
    /**
     * 请求的 Promise 对象
     */
    promise: Promise<T>;
    /**
     * 取消请求的方法
     */
    cancel: () => void;
}