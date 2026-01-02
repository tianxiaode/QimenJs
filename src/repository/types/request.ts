import { RequestOptions } from "@orbitjs/http";
import { RepositoryConfig } from "./config";

/**
 * 仓储处理器上下文
 */
export interface RepoRequestContext {
    action: string;      // 业务动作名：如 'findUsers'
    url: string;         // 原始相对路径
    // 核心：直接把 HttpClient 的 Options 放进来
    options: RequestOptions; 
}

// 处理器定义
export type RepoRequestProcessor = (
    ctx: RepoRequestContext, 
    config: RepositoryConfig
) => Promise<RepoRequestContext> | RepoRequestContext;