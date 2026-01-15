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
    protected _pageSize?: number;
    [key: string]: any;

    constructor(pageSize?: number) {
        super();
        this._pageSize = pageSize ?? this.pageSize;
        this.state = new CollectionState(
            this.getDomainConfig(),
            pageSize,
            this.useLocalSearch
        ) as unknown as ICollectionState<T, TC>;
    }

    public async fetch(
        action: ENTITY_ACTION | string,
        options: RequestOptions = {},
        updater?: (data: any) => void
    ): Promise<FlowContext> {
        // 1. 参数自动对齐
        const alignedOptions = await this.alignRequestOptions(action, options);

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
    protected async alignRequestOptions(action: string, payload: any): Promise<RequestOptions> {
        // 1. 初始化标准结构
        const options: RequestOptions = {
            domain: this.domain,
        };

        // 2. 自动化策略：根据 Action 拼装数据
        switch (action) {
            case 'list':
                options.params = { ...this.state.toParams(), ...payload };
                break;

            case 'get':
            case 'delete':
                // 约定：对于 get/delete，payload 通常就是 id 本身
                options.params = typeof payload === 'object' ? { id: payload.id } : payload;
                break;

            case 'create':
            case 'update':
            case 'toggle':
                // 约定：这些 action 的 payload 就是 body
                options.body = payload;
                break;

            case 'batchDelete':
                // 约定：批量删除传 ids 数组
                options.body = { ids: Array.isArray(payload) ? payload : [payload] };
                break;

            case 'getall':
                options.params = { __pagination: false, ...payload };
                break;

            default:
                // 自定义 action，直接透传给 params 或 body
                options.params = payload;
        }

        // 3. 唯一的出口：钩子覆写
        // 所有的特殊逻辑（比如加 Header、改 URL 格式）全部在钩子里处理
        return await this.onBeforeFetch(action, options);
    }

    protected async onBeforeFetch(action: string, options: RequestOptions) {
        return options;
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

