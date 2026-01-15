import { DomainConfig } from '@orbitjs/registry';
import { ENTITY_ACTION, FlowContext, HttpMethod, RequestOptions, Schema } from '../types';

export const createFlowContext = (
    method: HttpMethod,
    url: string,
    domain: string,
    domainConfig: DomainConfig,
    requestOptions: RequestOptions,
    entityName?: string,
    action?: ENTITY_ACTION,
    schema?: Schema
): FlowContext => {
    return {
        domain,
        entityName,
        action: action,
        config: domainConfig,
        isAborted: false,
        error: null,
        params: requestOptions.params,
        schema,
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

        alignToFrontend: (target: any) => {
            if (!schema || !target) return target;
            return applySchemaMapping(target, schema);
        },
    };
};

function applySchemaMapping(data: any, schema: Schema): any {
    if (Array.isArray(data)) {
        return data.map(item => applySchemaMapping(item, schema));
    }

    const fields = schema.fields || [];
    const result = { ...data };

    fields.forEach(field => {
        const frontKey = field.name;
        const backKey = field.mapping || field.name;

        if (backKey in data && backKey !== frontKey) {
            result[frontKey] = data[backKey];
            delete result[backKey];
        }
    });

    return result;
}
