import { IHeaderProcessor, IResponseProcessor, IUrlProcessor } from './processors';

export interface HttpClientConfig {
    baseUrl?: string;

    urlProcessors?: IUrlProcessor[];
    headerProcessors?: IHeaderProcessor[];

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

export interface StreamClientConfig {
    baseUrl?: string;

    urlProcessors?: IUrlProcessor[];
    headerProcessors?: IHeaderProcessor[];
}

export interface BaseConfig {
    httpConfig?: HttpClientConfig;
    streamConfig?: StreamClientConfig;
}
