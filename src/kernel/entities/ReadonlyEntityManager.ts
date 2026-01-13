import { CoreEntityManager } from './CoreEntityManager';
import { CollectionState } from './CollectionState';
import { ENTITY_ACTION, FlowContext, RequestOptions } from '../types';
import { DomainRegistrar } from '@orbitjs/registry';
import { QueryHelper } from './QueryHelper';

export abstract class ReadonlyEntityManager<T, TCriteria = any> extends CoreEntityManager {
    // 实例化工具类
    public readonly state: CollectionState<T, TCriteria>;
    protected pageSize: number | null = null;
    protected pageSizeOptions: number[] | null = null;
    protected useLocalSearch: boolean = false;
    private localFullData: T[] = [];

    constructor() {
        super();
        this.state = new CollectionState<T, TCriteria>();
        const domainConfig = DomainRegistrar.getInstance().get(this.domain);

        // 1. 提取值
        const finalOptions = this.pageSizeOptions ?? domainConfig?.pageSizeOptions ?? [10, 20, 50];
        const finalSize = this.pageSize ?? domainConfig?.pageSize ?? finalOptions[0];

        // 2. 核心调试逻辑：如果出错了，直接在控制台报错或抛出异常
        if (!finalOptions.includes(finalSize)) {
            const errorMsg =
                `[Entity Error]: Domain "${this.domain}" configuration mismatch. ` +
                `Current pageSize (${finalSize}) is not present in options [${finalOptions.join(', ')}].`;

            // 开发环境直接抛错，生产环境可以降级处理
            if (this.env === 'development') {
                throw new Error(errorMsg);
            } else {
                this.logger.error(errorMsg);
            }
        }

        // 3. 赋值
        this.state.pageSizeOptions = finalOptions;
        this.state.pageSize = finalSize;
    }

    /**
     * 执行查询
     */
    /**
     * 通用执行引擎
     * @param action 动作标识
     * @param options 请求配置
     * @param updater 可选的状态更新函数
     */
    /**
     * 统一执行引擎
     */
    public async fetch(
        action: ENTITY_ACTION | string,
        options: RequestOptions = {},
        updater?: (data: any) => void
    ): Promise<FlowContext> {
        // 1. 参数自动对齐
        const alignedOptions = this.alignRequestOptions(action, options);

        // 2. 生命周期开始
        this.state.loading = true;
        this.emit('loading', true);
        this.emit(`${action}:loading`, true);

        try {
            const task = this.request(action as any, alignedOptions);
            const ctx = await task.context;

            if (!ctx.metadata.hasError) {
                if (updater) updater(ctx.data);
                this.emit(`${action}:success`, ctx.data);
            } else {
                this.emit(`${action}:error`, ctx.metadata.error);
            }
            return ctx;
        } finally {
            this.state.loading = false;
            this.emit('loading', false);
            this.emit(`${action}:loading`, false);
        }
    }

    /**
     * 获取详情：独立逻辑，不干扰列表状态
     */
    public async get(id: string | number): Promise<void> {
        await this.fetch('get', { params: { id } }, data => {
            this.emit('detail-loaded', data);
        });
    }

    /**
     * 获取全量：通常用于下拉菜单，不分页
     */
    public async getAll(params?: any): Promise<FlowContext> {
        const task = this.request('getall', {
            params: { ...params, __pagination: false },
        });
        return await task.context;
    }
    /**
     * 列表查询的语义化别名
     */
    public async list(forceRefresh: boolean = false): Promise<void> {
        // --- 1. 本地查询模式 (Local Search Mode) ---
        if (this.useLocalSearch) {
            // 如果没有全量数据，或者用户强制刷新，则去后端拿一次全量数据
            if (this.localFullData.length === 0 || forceRefresh) {
                // 注意：这里传 getall 动作，确保拿到不分页的全量数据
                await this.fetch('getall', {}, data => {
                    // 将全量原始数据存入 localFullData
                    this.localFullData = data.list || data.items || data || [];
                    this.state.clearCache(); // 清理旧缓存
                });
            }

            // 核心逻辑：无论是否发了请求，最后都执行一次本地处理
            this.applyLocalProcess();
            return;
        }

        // --- 2. 传统服务端模式 (Server Side Mode) ---
        // 检查缓存
        if (!forceRefresh) {
            const cached = this.state.tryGetCache();
            if (cached) {
                this.state.updateList(cached.items, cached.total);
                this.emit('data-updated', { action: 'list', ...cached });
                return;
            }
        }

        // 正常发起 list 分页请求
        await this.fetch('list', {}, data => {
            this.state.updateList(data.items, data.total);
            this.state.setCache(data.items, data.total);
        });
    }

    /**
     * 下一页
     */
    public async next(): Promise<void> {
        if (this.state.pageIndex < this.state.maxPage) {
            await this.jump(this.state.pageIndex + 1);
        } else {
            this.logger.warn('Already on the last page, cannot go next.');
        }
    }

    /**
     * 上一页
     */
    public async prev(): Promise<void> {
        if (this.state.pageIndex > 1) {
            await this.jump(this.state.pageIndex - 1);
        } else {
            this.logger.warn('Already on the first page, cannot go prev.');
        }
    }

    /**
     * 跳转并返回最终生效的页码
     */
    public async jump(page: number): Promise<number> {
        const validPage = this.state.getValidPage(page);

        // 如果页码没变且已经有数据，直接返回
        if (validPage === this.state.pageIndex && this.state.items.length > 0) {
            return validPage;
        }

        this.state.pageIndex = validPage;
        await this.list();

        return this.state.pageIndex; // 返回纠正后的值，供 UI 恢复显示
    }

    /**
     * 执行排序操作
     * @param key 排序字段
     * @param order 排序方向
     */
    public async sort(key: string, order: 'asc' | 'desc' | null, force: boolean = false): Promise<void> {
        this.logger.debug(`Sorting by ${key} ${order}`);

        // 1. 更新状态
        this.state.setSort(key, order);

        await this.list(force); // 正常
    }

    /**
     * 刷新当前页
     * @param force 是否强制跳过缓存，默认为 true
     */
    public async refresh(force: boolean = true): Promise<void> {
        this.logger.debug(`Refreshing entity: ${this.entityName}`);
        await this.list(force);
    }

    /**
     * 将状态恢复到初始默认值
     */
    public reset(): void {
        this.state.reset();
        this.list(); // 重新加载数据
    }

    /**
     * 修改每页显示数量
     */
    public async changeSize(size: number): Promise<void> {
        // 1. 校验 size 是否在 pageSizeOptions 中（之前讨论过的安全校验）
        if (!this.state.pageSizeOptions.includes(size)) {
            this.logger.error(
                `Invalid pageSize: ${size}. Options are: ${this.state.pageSizeOptions}`
            );
            if (this.env === 'development') throw new Error('Invalid pageSize');
            return;
        }

        // 2. 只有当值真的改变时才处理
        if (this.state.pageSize !== size) {
            this.state.pageSize = size;
            this.state.pageIndex = 1; // 关键：重置回第一页

            this.logger.debug(`PageSize changed to ${size}, resetting to page 1`);

            // 3. 改变 size 后通常需要立即重新加载数据
            await this.list(true);
        }
    }

    /**
     * 语义化操作：简单过滤
     */
    public async filter(keyword: string, force: boolean = false): Promise<void> {
        this.state.filter = keyword;
        this.state.pageIndex = 1;
        await this.list(force); // 正常
    }

    /**
     * 语义化操作：多条件搜索
     */
    public async search(filter: string, force: boolean = false): Promise<void> {
        this.state.filter = filter;
        this.state.pageIndex = 1;
        await this.list(force); // 正常
    }

    /**
     * 根据操作类型，自动对齐/组装请求参数
     */
    protected alignRequestOptions(
        action: ENTITY_ACTION | string,
        extraOptions?: RequestOptions
    ): RequestOptions {
        const baseOptions: RequestOptions = { ...extraOptions };
        const params: Record<string, any> = { ...(extraOptions?.params || {}) };

        switch (action) {
            case 'list':
                // 列表操作：强制注入分页、搜索、排序状态
                baseOptions.params = {
                    ...this.state.toParams(),
                    ...params,
                };
                break;

            case 'getall':
                // 全量操作：注入不分页标记
                baseOptions.params = {
                    __pagination: false,
                    ...params,
                };
                break;

            case 'get':
                // 详情操作：通常参数已经在 extraOptions.params 里了，这里做兜底检查
                break;
        }

        return baseOptions;
    }

    /**
     * 核心逻辑：应用本地过滤、排序和分页
     */
    private applyLocalProcess(): void {
        // 1. 调用 QueryHelper 进行一体化处理
        const { items, total } = QueryHelper.process(this.localFullData, this.state);

        // 2. 直接更新状态并触发事件，不走网络请求
        this.state.updateList(items, total);
        this.emit('data-updated', { action: 'local-process', items, total });
    }
}
