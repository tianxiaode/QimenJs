import { CoreEntityManager } from './CoreEntityManager';
import { CollectionState, AbilityFactory } from './abilities';
import { ENTITY_ACTION, FlowContext, RequestOptions } from '../types';

export abstract class ReadonlyEntityManager<T, TCriteria = any> extends CoreEntityManager {
    // 实例化工具类
    public state!: CollectionState<T, TCriteria>;
    protected useLocalSearch: boolean = false;
    protected localFilter?: (text: string, record: T) => T[];
    protected localSearch?: (criteria: Partial<TCriteria>, records: T[]) => T[];
    protected localSort?: (
        criteria: Partial<TCriteria>,
        sort: string | null,
        order: 'asc' | 'desc' | null,
        records: T[]
    ) => T[];
    protected _pageSize?: number;
    protected _pageSizes?: number[];

    constructor(pageSize?: number, pageSizes?: number[]) {
        super();
        this._pageSize = pageSize;
        this._pageSizes = pageSizes;
        AbilityFactory.attach(this as any);
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
    public async get(id: string | number): Promise<T | undefined> {
        const task = this.request('get', { params: { id } });
        const result = await task.context;
        return result.data.item;
    }

    /**
     * 获取全量：通常用于下拉菜单，不分页
     */
    public async getAll(params?: any): Promise<T[]> {
        const task = this.request('getall', {
            params: { ...params, __pagination: false },
        });
        const result = await task.context;
        return result.data.list || [];
    }
    /**
     * 列表查询的语义化别名
     */
    public async list(forceRefresh: boolean = false): Promise<T[]> {
        // 1. 本地模式：确保有源数据
        if (this.useLocalSearch) {
            if (this.state.getSource().length === 0 || forceRefresh) {
                await this.fetch('getall', {}, data => {
                    this.state.setSource(data.list || data);
                });
            }
            // 直接调用由 Ability 注入的方法，它不改状态，只重新计算一次结果
            return await (this as any).applyLocalProcess();
        }

        // --- 2. 传统服务端模式 (Server Side Mode) ---
        // 检查缓存
        if (!forceRefresh) {
            const cached = this.state.tryGetCache();
            if (cached) {
                this.state.updateList(cached.items, cached.total);
                this.emit('data-updated', { action: 'list', ...cached });
                return [];
            }
        }

        // 正常发起 list 分页请求
        const result = await this.fetch('list', {});
        const data = result.data.list || [];
        this.state.updateList(data, result.data.total);
        this.state.setCache(data, result.data.total);
        return data;
    }

    /**
     * 刷新当前页
     * @param force 是否强制跳过缓存，默认为 true
     */
    public async refresh(force: boolean = true): Promise<T[]> {
        this.logger.debug(`Refreshing entity: ${this.entityName}`);

        // 1. 发出“开始刷新”信号
        this.emit('refreshing', { force });

        try {
            const data = await this.list(force);

            // 2. 发出“刷新成功”信号
            this.emit('refreshed', data);
            return data;
        } catch (error) {
            // 3. 发出“刷新失败”信号
            this.emit('refresh-error', error);
            throw error;
        }
    }

    /**
     * 将状态恢复到初始默认值
     */
    public async reset(): Promise<T[]> {
        this.state.reset();
        return await this.list(); // 重新加载数据
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
}
