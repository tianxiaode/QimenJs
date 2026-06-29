import { TaskPriority } from "@orbitjs/task";

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
     * 请求域，需要在域注册器注册
     */
    domain?: 'default' | string;
   
    /**
     * 请求体数据
     */
    body?: any;
    /**
     * 请求头
     */
    headers?: Record<string, string>;
    params?: Record<string, any>;
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
    isUpload?: boolean;
    isDownload?: boolean;
    silent?: boolean;
}

export type NoProgressOptions = Omit<
    RequestOptions,
    'body' | 'method' | 'url' | 'onProgress' | 'isUpload' | 'isDownload' | 'domain'
>;
export type UploadOptions = Omit<
    RequestOptions,
    'body' | 'method' | 'url' | 'onProgress' | 'isDownload' | 'domain'
>;
export type DownloadOptions = Omit<
    RequestOptions,
    'body' | 'method' | 'url' | 'onProgress' | 'isUpload' | 'domain'
>;

export interface PollingOptions extends RequestOptions {
    /**
     * 轮询间隔时间，单位毫秒
     */
    interval?: number;       
    /**
     * 任务优先级，用于控制轮询任务的执行优先级
     */
    priority?: TaskPriority; 
    /**
     * 单次请求失败后的最大重试次数
     */
    maxRetries?: number;     
    /**
     * 重试延迟时间，单位毫秒
     */
    retryDelay?: number;     
}