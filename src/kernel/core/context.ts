import { Registry } from '@orbitjs/registry';
import { ENTITY_ACTION, FlowContext, HttpMethod, RequestOptions } from '../types';

export const createFlowContext = (
    method: HttpMethod,
    url: string,
    domain: string,
    entityName: string,
    action: ENTITY_ACTION,
    requestOptions: RequestOptions,
): FlowContext => {
    const config = Registry.domain.get(domain);

    return {
        domain,
        entityName,
        action: action,
        config,
        isAborted: false,
        error: null,
        params: requestOptions.params,
        // 信号灯与元数据
        metadata: {
            isTransportFailure: false,
            hasError: false,
            isUpload: !!requestOptions.isUpload, // 自动判定是否为上传
            isDownload: !!requestOptions.isDownload,
            onProgress: requestOptions.onProgress,
            silent: !!requestOptions.silent,
            contentType: '',
            isJson: false,
            isText: false,
            isBlob: false,
            action: '',
            isProcessed: false,
            fileName: '',
            isDownloadHandled: false,
            isErrorHandled: false,
        },

        // 执行参数 (01 阶段会进一步填充)
        http: {
            url: url,
            status: 0,
            isSuccess: false,
            rawResponse: null,
            timeout: 0,
            responseType: 'json',
            withCredentials: false,
            controller: new AbortController(),
            responseHeaders: {},
            method: method,
            pathParams: requestOptions.pathParams || [],
            queryParams: requestOptions.queryParams || {},
            body: requestOptions.body || null,
            headers: requestOptions.headers || {},
        },

        // 数据容器
        data: {
            parsed: null,
            source: null,
            raw: null,
            list: [],
            item: null,
            total: 0,
        },

        // 埋点记录
        steps: [],
    };
};
