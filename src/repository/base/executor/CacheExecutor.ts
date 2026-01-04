import { DataProcessContext, REPO_ACTION } from "@/repository/types";
import { RepositoryCacheManager } from "../CacheManager";
import { RepositoryContextFactory } from "../RepositoryContextFactory";

// CacheExecutor.ts
export class CacheExecutor {
    /**
     * 尝试读取缓存
     */
    static async read(
        repoName: string,
        manager: RepositoryCacheManager,
        action: REPO_ACTION,
        payload: any
    ): Promise<DataProcessContext | null> {
        // 只针对读操作进行拦截
        if (!['list', 'detail'].includes(action)) return null;

        const cachedData = await manager.get(repoName, action, payload);
        if (cachedData) {
            // 如果命中缓存，直接返回一个“成功”的成绩单
            return RepositoryContextFactory.createDataProcess({} as any,{
                metadata: { isFromCache: true, isBusinessSuccess: true } as any,
                list: cachedData.list || [],
                detail: cachedData.detail || null,
                message: 'Data loaded from cache',
                // 标记为来自缓存，方便 UI 展示“刚刚更新”或“来自本地”
                status: { isFromCache: true } as any 
            });
        }
        return null;
    }

    /**
     * 更新缓存
     */
    static async save(
        repoName: string,
        manager: RepositoryCacheManager,
        action: REPO_ACTION,
        payload: any,
        result: DataProcessContext
    ): Promise<void> {
        // 只有业务真正成功时才存缓存
        if (result.status.isBusinessSuccess && ['list', 'detail'].includes(action)) {
            await manager.set(repoName, action, payload, {
                list: result.list,
                detail: result.detail
            });
        }
    }
}