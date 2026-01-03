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

export type REPO_ACTION = CRUD_ACTION | 'common' | string;

export interface RepositoryRequestContext {
    method: HttpMethod;
    url: string;
    // 资源元数据（新增）
    metadata: {
        basePath: string;
        rowKey: string;
        action: REPO_ACTION;
    };
    // 请求具体参数
    options: RequestOptions;
}

/**
 * 标准请求处理器
 * @param context - 包含 method 和 options (pathParams/queryParams/body) 的容器
 * @param payload - UI 层传来的原始生数据
 */
export type RequestProcessor = (context: RepositoryRequestContext, payload: any) => RepositoryRequestContext;

export type RequestProcessors = {
    [K in REPO_ACTION]?: RequestProcessor;
};
