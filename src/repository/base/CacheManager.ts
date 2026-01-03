import { CacheItem } from '../types';

export class RepositoryCacheManager {
    private pool = new Map<string, CacheItem>();
    // 增加最大容量控制，防止内存溢出
    private readonly MAX_ITEMS = 500;
    private defaultTTL: number = 300000;

    constructor(options?: { defaultTTL?: number }) {
        this.defaultTTL = options?.defaultTTL || 300000;
    }

    private generateKey(namespace: string, action: string, payload: any): string {
        return `${namespace}:${action}:${JSON.stringify(payload)}`;
    }

    async get(namespace: string, action: string, payload: any): Promise<any | null> {
        const key = this.generateKey(namespace, action, payload);
        const item = this.pool.get(key);

        if (item) {
            // 检查是否过期
            if (item.expire > Date.now()) {
                return item.data;
            }
            // 发现过期，主动删除
            this.pool.delete(key);
        }
        return null;
    }

    async set(
        namespace: string,
        action: string,
        payload: any,
        data: any,
        customTTL?: number // 允许覆盖默认时间
    ): Promise<void> {
        const key = this.generateKey(namespace, action, payload);
        const ttl = customTTL ?? this.defaultTTL; // 优先使用传入的时间，否则用默认值

        this.pool.set(key, {
            data,
            expire: Date.now() + ttl,
        });
    }

    /**
     * 增加一个自动清理过期的定时任务（可选）
     * 避免那些永远不被 get 的数据长期占用内存
     */
    public startCleanupInterval(ms: number = 300000): void {
        // 默认 5 分钟扫一次
        setInterval(() => {
            const now = Date.now();
            for (const [key, item] of this.pool.entries()) {
                if (item.expire < now) {
                    this.pool.delete(key);
                }
            }
        }, ms);
    }

    async clear(namespace: string): Promise<void> {
        const prefix = `${namespace}:`;
        for (const key of this.pool.keys()) {
            if (key.startsWith(prefix)) this.pool.delete(key);
        }
    }
}
// 【关键】内置一个全局共享的单例实例
export const defaultCacheManager = new RepositoryCacheManager();
