import { IHeaderProcessor, IResponseProcessor, IUrlProcessor } from './processors';

/**
 * HTTP 客户端配置接口
 * 定义了 HTTP 客户端的主要配置项，包括基础 URL、URL 处理器、请求头处理器和响应处理器
 */
export interface HttpClientConfig {
    /**
     * 基础 URL，所有请求的 URL 都会基于此路径
     */
    baseUrl?: string;

    /**
     * URL 处理器数组，用于处理 URL 的转换和修改
     */
    urlProcessors?: IUrlProcessor[];

    /**
     * 请求头处理器数组，用于处理请求头的转换和修改
     */
    headerProcessors?: IHeaderProcessor[];

    /**
     * 响应处理器配置，包含多个处理阶段：
     * - status: HTTP 状态、协议成功判定
     * - parse: JSON / text / blob 解析
     * - error: 业务错误识别
     * - extract: 数据解包
     * - extra: 日志、埋点等扩展功能
     */
    responseProcessors?: {
        /** 状态层：HTTP status、协议成功判定 */
        status?: IResponseProcessor[];
        /** 解析层：JSON / text / blob */
        parse?: IResponseProcessor[];
        /** 错误层：业务错误识别 */
        error?: IResponseProcessor[];
        /** 提取层：data unwrap */
        extract?: IResponseProcessor[];
        /** 扩展层：日志、埋点等 */
        extra?: IResponseProcessor[];
    };
}

/**
 * 流客户端配置接口
 * 定义了流客户端的配置项，包括基础 URL、URL 处理器和请求头处理器
 */
export interface StreamClientConfig {
    /**
     * 基础 URL，所有请求的 URL 都会基于此路径
     */
    baseUrl?: string;

    /**
     * URL 处理器数组，用于处理 URL 的转换和修改
     */
    urlProcessors?: IUrlProcessor[];

    /**
     * 请求头处理器数组，用于处理请求头的转换和修改
     */
    headerProcessors?: IHeaderProcessor[];
}

/**
 * 基础配置接口
 * 包含 HTTP 客户端和流客户端的配置
 */
export interface BaseConfig {
    /**
     * HTTP 客户端配置
     */
    httpConfig?: HttpClientConfig;
    
    /**
     * 流客户端配置
     */
    streamConfig?: StreamClientConfig;
}