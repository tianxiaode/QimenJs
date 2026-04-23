import { DomainConfig } from '@orbitjs/registry';
import { ENTITY_ACTION, FlowContext, HttpMethod, RequestOptions, Schema } from '../types';

/**
 * 创建流上下文对象
 * 
 * 此函数用于创建一个完整的流上下文对象，包含了执行请求所需的所有信息，
 * 如域配置、HTTP 请求参数、数据容器、元数据以及处理步骤等。
 * 
 * @param method - HTTP 方法 (GET, POST, PUT, DELETE 等)
 * @param url - 请求的目标 URL
 * @param domain - 操作的域名称
 * @param domainConfig - 域的配置信息
 * @param requestOptions - 请求选项，包括参数、头信息、请求体等
 * @param entityName - 实体名称 (可选)
 * @param action - 实体动作类型 (可选)
 * @param schema - 数据模式定义 (可选)
 * @returns FlowContext - 包含所有请求相关信息的上下文对象
 */
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

        /**
         * 将后端数据映射到前端模型
         * 
         * 使用提供的 schema 将后端字段名转换为前端约定的字段名
         * 
         * @param target - 待转换的数据对象
         * @returns 转换后的数据对象，如果不存在 schema 或 target，则返回原对象
         */
        alignToFrontend: (target: any) => {
            if (!schema || !target) return target;
            return applySchemaMapping(target, schema);
        },
    };
};

/**
 * 应用 schema 映射规则转换数据
 * 
 * 根据 schema 定义的字段映射关系，将数据对象中的后端字段名转换为前端字段名
 * 
 * @param data - 待转换的数据
 * @param schema - 字段映射规则定义
 * @returns 转换后的数据对象
 */
function applySchemaMapping(data: any, schema: Schema): any {
    // 如果是数组，则递归处理数组中的每一项
    if (Array.isArray(data)) {
        return data.map(item => applySchemaMapping(item, schema));
    }

    const fields = schema.fields || [];
    const result = { ...data };

    fields.forEach(field => {
        const frontKey = field.name;
        const backKey = field.mapping || field.name;

        // 如果后端字段存在于数据中，且前后端字段名不同，则进行映射
        if (backKey in data && backKey !== frontKey) {
            result[frontKey] = data[backKey];
            delete result[backKey];
        }
    });

    return result;
}