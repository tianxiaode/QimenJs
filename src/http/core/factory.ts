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
import { IResponseProcessor } from '../types';

import { AppHttpConfig } from '../types/config';
import { HttpClient } from './HttpClient';

export function createHttpClient(config: AppHttpConfig = {}) {
    // 1. 基础参数治理
    const normalizedBaseUrl = config.baseUrl?.trim().replace(/\/+$/, '') || '';

    // 2. 准备默认插槽内容 (StandardRestful)
    const { responseProcessors: userP = {} } = config;

    // 3. 按照“生命周期顺序”进行扁平化组装
    // 这种排列方式就是你的“隐形规则”，确保了逻辑的先后依赖关系
    const flattenedResponseProcessors: IResponseProcessor[] = [
        TransportFailureProcessor, // [强制] 物理层检查，必须第一
        ...(userP.status || [HttpStatusProcessor]), // 协议状态
        ContentTypeProcessor, // [强制] 类型识别，为解析做准备
        ...(userP.parse || [JsonParseProcessor]), // 内容解析
        ...(userP.error || [RestErrorProcessor]), // 业务错误识别
        ...(userP.extract || [DataExtractorProcessor]), // 数据提取
        ...(userP.extra || []), // 扩展插件
    ];

    const urlProcessors = config.urlProcessors || [QueryParamsProcessor, PathParamsProcessor];
    const headerProcessors = config.headerProcessors || [
        HeaderContentTypeProcessor,
        AuthHeaderProcessor,
    ];

    // 4. 将扁平化的数组交给 HttpClient
    return new HttpClient({
        baseUrl: normalizedBaseUrl,
        urlProcessors: urlProcessors,
        headerProcessors: headerProcessors,
        responseProcessors: flattenedResponseProcessors, // 此时已是标准数组
    });
}
