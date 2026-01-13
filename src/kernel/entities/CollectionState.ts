export class CollectionState<T, TCriteria = Record<string, any>> {
    // 1. 数据状态
    public items: T[] = [];
    public total: number = 0;

    // 2. 分页状态
    public pageIndex: number = 1;
    public pageSize: number = 20;
    public pageSizeOptions: number[] = [10, 20, 50, 100];

    // 3. 搜索状态
    public filter: string = ''; // 简单搜索：通常是全局模糊匹配
    public criteria: Partial<TCriteria> = {}; // 多字段搜索：结构化条件

    // 4. 辅助状态
    public loading: boolean = false;
    private cache = new Map<string, { items: T[]; total: number; timestamp: number }>();
    public cacheTTL: number = 5 * 60 * 1000;

    // 5. 排序状态
    public sortBy: string | null = null; // 排序字段，如 'createdAt'
    public sortOrder: 'asc' | 'desc' | null = null; // 排序方向

    /**
     * 统一更新列表数据
     * @param items 新的数据项
     * @param total 后端返回的总条数
     */
    public updateList(items: T[], total: number): void {
        // 1. 基础赋值
        this.items = items || [];
        this.total = total || 0;

        // 2. 自动校准逻辑：如果当前页码超过了最大页码（例如在最后一页删除了数据）
        const maxPage = Math.ceil(this.total / this.pageSize);
        if (this.pageIndex > maxPage && maxPage > 0) {
            this.pageIndex = maxPage;
        }
    }

    /**
     * 重置搜索状态
     */
    public reset(): void {
        this.pageIndex = 1;
        this.filter = '';
        this.criteria = {} as Partial<TCriteria>;
        this.items = [];
        this.total = 0;
        this.sortBy = null;
        this.sortOrder = null;
        this.clearCache(); // 重置时通常也要清理缓存
    }

    /**
     * 转换为 API 习惯的 Params 对象
     */
    public toParams(): Record<string, any> {
        return {
            page: this.pageIndex,
            limit: this.pageSize,
            search: this.filter,
            sortBy: this.sortBy,
            sortOrder: this.sortOrder,
            ...this.criteria,
        };
    }

    /**
     * 生成当前状态的唯一 Key
     */
    public getSnapshotKey(): string {
        return JSON.stringify({
            p: this.pageIndex,
            s: this.pageSize,
            f: this.filter,
            c: this.criteria,
        });
    }

    /**
     * 切换每页条数
     * 这是一个核心逻辑：通常切换每页条数后，需要回到第一页
     */
    public changePageSize(size: number): void {
        if (this.pageSizeOptions.includes(size)) {
            this.pageSize = size;
            this.pageIndex = 1;
        }
    }

    /**
     * 计算当前最大页数
     */
    public get maxPage(): number {
        if (this.total <= 0) return 1;
        return Math.ceil(this.total / this.pageSize);
    }

    /**
     * 核心方法：确保传入的页码在合法范围内 [1, maxPage]
     */
    public getValidPage(page: number): number {
        const max = this.maxPage;
        if (page < 1) return 1;
        if (page > max) return max;
        return page;
    }

    /**
     * 尝试从缓存中获取数据
     */
    public tryGetCache(): { items: T[]; total: number } | null {
        const key = this.getSnapshotKey();
        const entry = this.cache.get(key);

        if (entry) {
            // 检查是否过期
            if (Date.now() - entry.timestamp < this.cacheTTL) {
                return { items: entry.items, total: entry.total };
            }
            this.cache.delete(key); // 过期删除
        }
        return null;
    }

    /**
     * 存入缓存
     */
    public setCache(items: T[], total: number): void {
        const key = this.getSnapshotKey();
        this.cache.set(key, {
            items,
            total,
            timestamp: Date.now(),
        });
    }

    /**
     * 更新排序状态
     */
    public setSort(key: string, order: 'asc' | 'desc' | null): void {
        this.sortBy = key;
        this.sortOrder = order;
        this.pageIndex = 1; // 切换排序通常需要回到第一页
    }


    /**
     * 清空缓存（当用户点击刷新或强制同步时使用）
     */
    public clearCache(): void {
        this.cache.clear();
    }
}
