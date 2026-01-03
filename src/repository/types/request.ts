import { HttpMethod, RequestOptions } from '@orbitjs/http';

export type CRUD_ACTION =
    | 'list' // GET_LIST
    | 'all' // GET_ALL
    | 'detail' // GET_DETAIL
    | 'create' // CREATE
    | 'update' // UPDATE
    | 'delete' // DELETE
    | 'batchDelete' // BATCH_DELETE
    | 'toggle'; // TOGGLE

export interface RequestContext {
    method: HttpMethod;
    url: string;
    // 资源元数据（新增）
    meta: {
        basePath: string;
        rowKey: string;
        action: CRUD_ACTION;
    };
    // 请求具体参数
    options: RequestOptions;
}

/**
 * 标准请求处理器
 * @param context - 包含 method 和 options (pathParams/queryParams/body) 的容器
 * @param payload - UI 层传来的原始生数据
 */
export type RequestProcessor = (context: RequestContext, payload: any) => RequestContext;

export type RequestProcessors = {
    [K in CRUD_ACTION]?: RequestProcessor;
};
