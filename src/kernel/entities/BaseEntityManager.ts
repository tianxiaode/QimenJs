import {
    ENTITY_ACTION,
    FieldDefinition,
    FlowContext,
    RequestOptions,
    IBaseEntityManager,
    IEntity,
    SearchParams,
    EntityState,
} from '../types';
import { CoreEntityManager } from './CoreEntityManager';

export abstract class BaseEntityManager<
    T extends IEntity,
    TSearch extends SearchParams,
    TState extends EntityState<T, TSearch>,
>
    extends CoreEntityManager
    implements IBaseEntityManager<T, TSearch, TState>
{
    abstract state: TState;

    public async fetch(
        action: ENTITY_ACTION,
        options: RequestOptions
    ): Promise<FlowContext> {
        this.state.loading = true;
        this.emit(`${action}:loading`, true);

        try {
            const task = this.request(action as any, options);
            const ctx = await task.context;

            if (!ctx.metadata.hasError) {
                this.populateResponseData(ctx);
                await this.onAfterFetch(action as any, ctx);
                this.emit(`${action}:success`, ctx.data);
            } else {
                this.emit(`${action}:error`, ctx.metadata.error);
            }
            return ctx;
        } finally {
            this.state.loading = false;
            this.emit(`${action}:loading`, false);
        }
    }

    public async buildOptions(
        action: ENTITY_ACTION,
        params: any = {},
        body: any = null,
        extra: Partial<RequestOptions> = {}
    ): Promise<RequestOptions> {
        const schema = this.getSchema();
        const fields = schema.fields || [];
        // 1. 基础结构
        let options: RequestOptions = {
            domain: this.domain,
            params: { ...params }, // 浅拷贝一份原始参数
            body: body,
            ...extra,
        };

        // 2. 字段映射加工 (仅针对 Body)
        if (options.body) {
            options.body = Array.isArray(options.body)
                ? options.body.map(item => this.processItem(action, options, item, fields))
                : this.processItem(action, options, options.body, fields);
        }

        return await this.onBeforeFetch(action, options);
    }

    protected processItem(
        action: ENTITY_ACTION,
        options: RequestOptions,
        data: any,
        fields: FieldDefinition[]
    ): any {
        const result: any = {};
        fields.forEach(field => {
            if (typeof field.mapping === 'function') return;

            const value = data[field.name];
            const processedValue = this.onPrepareField(field, value, data, action, options);
            const targetKey = typeof field.mapping === 'string' ? field.mapping : field.name;

            if (processedValue !== undefined) {
                result[targetKey] = processedValue;
            }
        });
        // 保留原数据中不在 schema 里的部分（如隐藏 ID），同时覆盖 schema 定义的转换结果
        return { ...data, ...result };
    }

    protected onPrepareField(
        field: FieldDefinition,
        value: any,
        rawData: any,
        action: ENTITY_ACTION,
        options: RequestOptions
    ) {
        return value;
    }

    protected async onBeforeFetch(
        action: ENTITY_ACTION,
        options: RequestOptions
    ): Promise<RequestOptions> {
        return options;
    }

    protected populateResponseData(context: FlowContext) {
        const fields = this.getSchema().fields || [];
        if (context.data.list) {
            context.data.list = context.data.list.map(item =>
                this.processEntity(context, item, fields)
            );
        }
        if (context.data.item) {
            context.data.item = this.processEntity(context, context.data.item, fields);
        }
    }

    protected processEntity(
        context: FlowContext,
        entity: any,
        fields: FieldDefinition[] = []
    ): any {
        if (!entity) return entity;

        fields.forEach(field => {
            if (!field.mapping) return;

            // 情况 A：字符串映射 -> 别名对齐
            if (typeof field.mapping === 'string') {
                if (field.mapping in entity && field.mapping !== field.name) {
                    entity[field.name] = entity[field.mapping];
                }
            }
            // 情况 B：函数映射 -> 计算属性注入
            else if (typeof field.mapping === 'function') {
                // 传入整个实体，由函数计算出该字段的值
                entity[field.name] = field.mapping(entity);
            }
        });

        // 依然保留手动增强钩子
        return this.onPopulateEntity(context, entity);
    }

    protected onPopulateEntity(context: FlowContext, entity: T): any {
        return entity;
    }

    protected async onAfterFetch(action: string, context: FlowContext): Promise<void> {}

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
