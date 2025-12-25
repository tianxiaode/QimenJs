export interface ErrorHandlingConfig {
    // 错误消息处理器
    getMessage: (error: any) => string;
    getFormattedMessage?: (errors: any[], customMessage?: string) => string;

    // HTTP 错误处理器
    httpErrorHandler: (error: any) => void;

    getValidationMessage: (error: any, customMessage?:string) => string;
    getValidationFormattedMessage: (errors: any[], customMessage?: string) => string;

    // 业务错误处理器
    businessErrorHandler?: (error: any) => void;
}

/**
 * HTTP 配置
 */
export interface HttpConfig {
    baseURL?: string;
    timeout?: number;
    headers?: Record<string, string>;

    // 拦截器
    interceptors?: {
        request?: (config: any) => any;
        response?: (response: any) => any;
        error?: (error: any) => any;
    };

    // 请求特定配置
    methods?: {
        post?: {
            contentType?: string;
            dataTransformer?: (data: any) => any;
        };
        get?: {
            paramsSerializer?: (params: any) => string;
        };
    };
}

/**
 * 完整配置接口
 */
export interface GlobalConfig {
    errorHandling: ErrorHandlingConfig;
    http: HttpConfig;

    // 用于未来扩展
    [key: string]: any;
}
