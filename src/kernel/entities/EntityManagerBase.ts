import {
    ENTITY_ACTION,
    FlowContext,
    ICollectionState,
    IEntityManagerBase,
    RequestOptions,
} from '../types';
import { CollectionState } from './abilities';
import { CoreEntityManager } from './CoreEntityManager';

export abstract class EntityManagerBase<T = any, TC = Record<string, any>>
    extends CoreEntityManager
    implements IEntityManagerBase<T, TC>
{
    state: ICollectionState<T, TC>;
    useLocalSearch: boolean = false;
    protected localFilter?: (text: string, record: T) => T[];
    protected localSearch?: (criteria: Partial<TC>, records: T[]) => T[];
    protected localSort?: (
        criteria: Partial<TC>,
        sort: string | null,
        order: 'asc' | 'desc' | null,
        records: T[]
    ) => T[];
    protected primaryAction: string = 'list';
    [key: string]: any;

    constructor(pageSize?: number, pageSizes?: number[]) {
        super();
        this.state = new CollectionState(
            this.domain,
            this.logger,
            this.env,
            pageSize,
            pageSizes,
            this.useLocalSearch
        ) as unknown as ICollectionState<T, TC>;
    }

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

    public dispose(): void {
        // 1. 先处理当前类的资源
        // 释放状态机，清理 state 内部的缓存或监听
        this.state.dispose();
        this.state = null as any;

        // 2. 如果你有 Ability 系统，应该在这里释放它们
        // 因为 Abilities 是挂载在当前 host 上的
        this.disposeAbilities?.();

        // 3. 最后调用父类的销毁
        // CoreEntityManager 可能负责切断网络连接、销毁全局事件监听等
        super.dispose();
    }
}

export interface EntityManagerBase<T = any, TC = Record<string, any>> {
    emit: (event: string, data: any) => void;
}
