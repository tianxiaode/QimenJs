import { RepositoryConfig } from './config';
import { RepoRequestContext } from './request';
import { RepoResponseContext } from './response';

/**
 * 仓储级处理器定义 (和 HttpClient 风格统一)
 */
export type RepoRequestProcessor = (
    ctx: RepoRequestContext,
    config: RepositoryConfig
) => RepoRequestContext | Promise<RepoRequestContext>;

export type RepoResponseProcessor = (
    ctx: RepoResponseContext,
    config: RepositoryConfig
) => Promise<void> | void;
