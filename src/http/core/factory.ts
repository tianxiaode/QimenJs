import {
    AuthHeaderProcessor,
    ContentTypeProcessor,
    DataExtractorProcessor,
    HeaderContentTypeProcessor,
    HttpStatusProcessor,
    JsonParseProcessor,
    PathParamsProcessor,
    QueryParamsProcessor,
    RestErrorProcessor,
    TransportFailureProcessor,
} from '../processors';
import {
    BaseConfig,
    HttpClientConfig,
    IHeaderProcessor,
    IResponseProcessor,
    IUrlProcessor,
    StreamClientConfig,
} from '../types';

import { HttpClient } from './HttpClient';
import { StreamClient } from './StreamClient';

export function normalizeBaseConfig(config: {
    baseUrl?: string;
    urlProcessors?: IUrlProcessor[];
    headerProcessors?: IHeaderProcessor[];
}) {
    return {
        // 1. BaseUrl 格式化
        baseUrl: config.baseUrl?.trim().replace(/\/+$/, '') || '',

        // 2. 注入 URL 默认处理器
        urlProcessors: config.urlProcessors || [QueryParamsProcessor, PathParamsProcessor],

        // 3. 注入 Header 默认处理器
        headerProcessors: config.headerProcessors || [
            HeaderContentTypeProcessor,
            AuthHeaderProcessor,
        ],
    };
}

/**
 * HttpFactory.ts
 * * 核心逻辑：
 * 1. 提取 prepareRequest 相关的基础配置（BaseUrl, URL/Header Processors）
 * 2. HttpClient：注入严格的响应流水线
 * 3. StreamClient：注入极简的流处理配置
 */
export class HttpFactory {
    /**
     * 创建标准 HttpClient
     */
    static createHttpClient(config: HttpClientConfig = {}): HttpClient {
        // 提取并归一化公共配置
        const base = normalizeBaseConfig(config);
        const userP = config.responseProcessors || {};

        // 按照业务逻辑顺序编排响应流水线
        const flattenedResponseProcessors: IResponseProcessor[] = [
            TransportFailureProcessor,
            ...(userP.status || [HttpStatusProcessor]),
            ContentTypeProcessor,
            ...(userP.parse || [JsonParseProcessor]),
            ...(userP.error || [RestErrorProcessor]),
            ...(userP.extract || [DataExtractorProcessor]),
            ...(userP.extra || []),
        ];

        return new HttpClient({
            ...base,
            responseProcessors: flattenedResponseProcessors,
        });
    }

    /**
     * 创建 StreamClient (AI 专用)
     */
    static createStreamClient(config: StreamClientConfig = {}): StreamClient {
        // 提取并归一化公共配置
        const base = normalizeBaseConfig(config);

        return new StreamClient({
            ...base,
        });
    }

    /**
     * 创建全套请求套件
     */
    static createSuite(baseConfig: BaseConfig) {
        // 这里的逻辑也变简单了：如果 streamConfig 没传，直接拿 httpConfig 去归一化
        return {
            http: this.createHttpClient(baseConfig.httpConfig),
            stream: this.createStreamClient(baseConfig.streamConfig || baseConfig.httpConfig),
        };
    }
}
