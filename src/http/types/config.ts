import { IHeaderProcessor, IResponseProcessor, IUrlProcessor } from './processors';

export interface AppHttpConfig {
    baseUrl?: string;

    urlProcessors?: IUrlProcessor[];
    headerProcessors?: IHeaderProcessor[];

    responseProcessors?: Partial<{
        status: IResponseProcessor[]; // HTTP status / 协议级判断
        parse: IResponseProcessor[]; // body 解析（json / text / blob / stream）
        error: IResponseProcessor[]; // 业务错误识别
        extract: IResponseProcessor[]; // 成功数据提取
        extra: IResponseProcessor[]; // 额外处理（日志、metrics 等）
    }>;
}
