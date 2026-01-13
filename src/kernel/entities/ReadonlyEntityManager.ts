import { CoreEntityManager } from './CoreEntityManager';
import { CollectionState } from './abilities/state';
import { ENTITY_ACTION, FlowContext, RequestOptions } from '../types';
import { DomainRegistrar } from '@orbitjs/registry';
import { IReadonlyEntityManager } from '../types/manager';

export abstract class ReadonlyEntityManager<T, TCriteria = any> extends CoreEntityManager implements IReadonlyEntityManager<T, TCriteria> {
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
            return [];
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
        const result =  await this.fetch('list', {});
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
        return await this.list(force);
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
