import { REPO_ACTION, DataProcessContext } from '@/repository/types';
import { RepositoryContextFactory } from '../RepositoryContextFactory';
import { RepositoryAccessDeniedError } from '@/repository/errors';

export interface AccessController {
    (basePath: string, action: REPO_ACTION, payload: any): Promise<boolean | string>;
}

export class AccessExecutor {
    /**
     * 执行权限校验
     * @returns 返回 null 表示通过，返回 DataProcessContext 表示拦截并提供原因
     */
    static async run(
        config: { basePath: string; accessController?: AccessController },
        action: REPO_ACTION,
        payload: any
    ): Promise<void> {
        if (!config.accessController) return;

        const result = await config.accessController(config.basePath, action, payload);

        // 如果校验不通过
        if (result === false || typeof result === 'string') {
            const reason = typeof result === 'string' ? result : 'Access Denied';

            // 抛出你自定义的错误类
            // 这样 FlowRunner 的 catch 就能接到这个具有明确语义的错误
            throw new RepositoryAccessDeniedError(config.basePath, action, {
                reason,
            });
        }
    }
}
