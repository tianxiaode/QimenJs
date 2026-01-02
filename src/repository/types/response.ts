import { HttpResponse } from '@orbitjs/http';
import { RepositoryConfig } from './config';

/**
 * 仓储响应上下文 (复用或包装 HTTP 层的 Context)
 */
export interface RepoResponseContext<T = any> {
    action: string;
    data: T; // 已经过 HttpClient 处理器解析后的数据
    response: HttpResponse; // 原始响应对象
}

