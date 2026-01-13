import { ICollectionState } from "../../types";
import { ILogger } from "@orbitjs/logger";
import { DomainRegistrar, EnvType } from '@orbitjs/registry';

export class CollectionState<T, TCriteria = Record<string, any>> implements ICollectionState<T, TCriteria> {
    // 1. 数据状态
    private _sourceItems: T[] | null = null;
    public items: T[] = [];
    public total: number = 0;

    // 2. 分页状态
    public pageIndex: number = 1;
    public pageSize: number = 20;
    public pageSizes: number[] = [10, 20, 50, 100];
    public pageCount: number = 1;

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

    constructor(
        private domain: string,
        private logger: ILogger,
        private env: EnvType,
        pageSize?: number,
        pageSizes?: number[],
        private useLocalSearch: boolean = false
    ) {
        if (this.useLocalSearch) {
            this._sourceItems = []; // 初始化本地仓库
        }

        const domainConfig = DomainRegistrar.getInstance().get(this.domain);
        const finalSizes = pageSizes ?? domainConfig?.pagesizes ?? [10, 20, 50];
        const finalSize = pageSize ?? domainConfig.pageSize ?? finalSizes[0];

        // 2. 核心调试逻辑：如果出错了，直接在控制台报错或抛出异常
        if (!finalSizes.includes(finalSize)) {
            const errorMsg =
                `[Entity Error]: Domain "${this.domain}" configuration mismatch. ` +
                `Current pageSize (${finalSize}) is not present in options [${finalSizes.join(', ')}].`;

            // 开发环境直接抛错，生产环境可以降级处理
            if (this.env === 'development') {
                throw new Error(errorMsg);
            } else {
                this.logger.error(errorMsg);
            }
        }

        // 3. 赋值
        this.pageSizes = finalSizes;
        this.pageSize = finalSize;
    }
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
        this.pageCount = maxPage;
        if (this.pageIndex > maxPage && maxPage > 0) {
            this.pageIndex = maxPage;
        }
    }

    /**
     * 重置搜索状态
     */
    /**
     * @param includePageSettings 是否连同 pageSize 和 pageSizeOptions 一起重置
     */
    public reset(includePageSettings: boolean = false) {
        // 1. 业务状态必须重置
        this.pageIndex = 1;
        this.filter = '';
        this.sortBy = null;
        this.sortOrder = null;
        this.criteria = {};

        // 2. 环境/配置状态按需重置
        if (includePageSettings) {
            // 这里回归到系统最原始的默认值，或者从 DomainConfig 重新拿
            this.pageSize = this.pageSizes[0];
            this.total = 0;
            // if (this.useLocalSearch) this._sourceItems = [];
        }
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
        if (this.pageSizes.includes(size)) {
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

    public setSource(data: T[]) {
        if (this.useLocalSearch) {
            this._sourceItems = data;
        }
        // 远程模式下不需要存储，直接由 EM 通过 updateView 更新 items
    }

    /**
     * 获取原始数据（用于 Ability 进行计算）
     */
    public getSource(): T[] {
        return this._sourceItems || [];
    }

    /**
     * 统一更新视图列表
     * 这个方法现在只负责“呈现层”的同步
     */
    public updateView(items: T[], total?: number): void {
        this.items = items || [];
        // 如果传了 total 则更新（远程模式），否则保持当前 total（本地模式计算出的）
        if (total !== undefined) {
            this.total = total;
        }

        // 自动校准 pageCount 和 pageIndex
        this.pageCount = this.maxPage;
        if (this.pageIndex > this.pageCount && this.pageCount > 0) {
            this.pageIndex = this.pageCount;
        }
    }

    public dispose(): void {
        this.items = [];
        this._sourceItems = null; // 释放本地模式的全量数据
        this.cache.clear(); // 释放缓存
        this.criteria = {};
        // 停止所有待处理的逻辑
    }
}
