import { DataProcessContext, ICacheManager, REPO_ACTION } from '@/repository/types';
import { RepositoryCacheManager } from '../CacheManager';
import { RepositoryContextFactory } from '../RepositoryContextFactory';

// CacheExecutor.ts
export class CacheExecutor {
    /**
     * 尝试读取缓存
     */
    static async read(
        repoName: string,
        manager: ICacheManager,
        action: REPO_ACTION,
        payload: any
    ): Promise<DataProcessContext | null> {
        // 只针对读操作进行拦截
        if (!['list', 'detail'].includes(action)) return null;

        const cachedData = await manager.get(repoName, action, payload);
        if (cachedData) {
            // 如果命中缓存，直接返回一个“成功”的成绩单
            return RepositoryContextFactory.createDataProcess({} as any, {
                metadata: { isFromCache: true, isBusinessSuccess: true } as any,
                list: cachedData.list || [],
                detail: cachedData.detail || null,
                message: 'Data loaded from cache',
                // 标记为来自缓存，方便 UI 展示“刚刚更新”或“来自本地”
                status: { isFromCache: true } as any,
            });
        }
        return null;
    }

    /**
     * 更新缓存
     */
    static async save(
        repoName: string,
        manager: ICacheManager,
        action: REPO_ACTION,
        payload: any,
        result: DataProcessContext,
        ttl: number | null = null
    ): Promise<void> {
        // 1. 定义缓存判定准则
        const isCacheableAction = ['list', 'detail', 'all'].includes(action);
        const hasContent = action === 'list' ? result.list.length > 0 : !!result.detail;
        const isSuccess = result.status.isBusinessSuccess;

        // 2. 只有满足条件的“高质量”数据才存入缓存
        if (isSuccess && isCacheableAction && hasContent) {
            await manager.set(
                repoName,
                action,
                payload,
                {
                    list: result.list,
                    detail: result.detail,
                    total: result.total, // 建议带上 total，保证分页器正常
                },
                ttl ?? undefined
            );
        }
    }
}
