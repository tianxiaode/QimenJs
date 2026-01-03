import { HttpResponseContext } from '@orbitjs/http';
import { REPO_ACTION, RepositoryRequestContext } from './request';

/**
 * 仓储响应上下文 (复用或包装 HTTP 层的 Context)
 */
export interface RepositoryResponseContext<T = any> {
    /**
     * 列表数据：分页查询、全量查询的统一出口
     */
    list: T[];
    /**
     * 总条数：分页逻辑的核心依据
     */
    total: number;
    /**
     * 单体详情：detail、update、create 等动作的返回对象
     */
    detail: T | null;

    /**
     * 业务状态信息
     */
    code: number;
    message: string;

    /**
     * 处理器状态快照
     */
    status: {
        isBusinessSuccess: boolean;
        action: string; // 从 reqCtx 同步过来，方便后续处理器快速判断
        [key: string]: any;
    };
}

/**
 * 响应处理器函数定义
 */
export type RepositoryResponseProcessor = (
    repoRes: RepositoryResponseContext,
    httpRes: HttpResponseContext,
    reqCtx: RepositoryRequestContext
) => Promise<RepositoryResponseContext>;

export type RepositoryResponseProcessors = {
    /** 通用处理器链：如果没有特定 action 配置，则走这一套 */
    common?: RepositoryResponseProcessor[];
} & {
    /** 特定动作的处理器链：会覆盖或增强 common 的逻辑 */
    [K in REPO_ACTION]?: RepositoryResponseProcessor[];
};