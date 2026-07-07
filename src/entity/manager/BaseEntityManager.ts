import type { ENTITY_ACTION, IBaseEntityManager, IEntity, SearchParams } from '@/entity/types';
import type { FieldDefinition } from '@/schema/types/schema';
import type { HttpRequestOptions } from '@/http/types/http-context';
import type { RequestContext } from '@/context';
import { CoreEntityManager } from './CoreEntityManager';
import { buildRequestEvent, ENTITY_REQUEST_STATUS } from '@/events';

/**
 * BaseEntityManager 能力接口
 *
 * BaseEntityManager 自身无额外 Ability 注入（abilities = []），
 * 仅继承 CoreEntityManager 的能力接口。
 */
export interface BaseEntityManager<
    TSearch extends SearchParams = SearchParams,
> extends CoreEntityManager {}

export abstract class BaseEntityManager<TSearch extends SearchParams = SearchParams>
    extends CoreEntityManager
    implements IBaseEntityManager<TSearch>
{
    static readonly abilities: readonly any[] = [];

    // 数据字段（由子类或 Ability 初始化）
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    search: TSearch = {} as TSearch;
    sourceData: Map<string | number, IEntity> = new Map();

    /**
     * 执行实体请求
     */
    public async fetch(
        action: ENTITY_ACTION,
        options: HttpRequestOptions
    ): Promise<RequestContext> {
        this.loading = true;
        this.emit(buildRequestEvent(action, ENTITY_REQUEST_STATUS.LOADING), true);

        try {
            const task = this.request(action as any, options);
            const ctx = (await task.context) as any as RequestContext;

            if (ctx.metadata.hasError) {
                const error = ctx.error || ctx.metadata.error;
                this.emit(buildRequestEvent(action, ENTITY_REQUEST_STATUS.ERROR), ctx);
                this.logger.error('Fetch failed: ', error);
                throw error;
            }

            this.populateResponseData(ctx);
            await this.onAfterFetch(action as any, ctx);
            this.emit(buildRequestEvent(action, ENTITY_REQUEST_STATUS.SUCCESS), ctx);
            this.logger.debug('Fetch success');
            return ctx;
        } finally {
            this.loading = false;
            this.emit(buildRequestEvent(action, ENTITY_REQUEST_STATUS.LOADING), false);
        }
    }

    /**
     * 构建请求选项
     */
    public async buildOptions(
        action: ENTITY_ACTION,
        params: any = {},
        body: any = null,
        extra: Partial<HttpRequestOptions> = {}
    ): Promise<HttpRequestOptions> {
        const schema = this.getSchema();
        const fields = schema.fields || [];

        const options: Partial<HttpRequestOptions> = {
            method: extra.method || 'GET',
            queryParams: { ...params },
            body: body,
            headers: extra.headers,
            pathParams: extra.pathParams,
            timeout: extra.timeout,
            responseType: extra.responseType,
            withCredentials: extra.withCredentials,
            signal: extra.signal,
            onProgress: extra.onProgress,
        };

        if (options.body) {
            options.body = Array.isArray(options.body)
                ? options.body.map(item =>
                      this.processItem(action, options as HttpRequestOptions, item, fields)
                  )
                : this.processItem(action, options as HttpRequestOptions, options.body, fields);
        }

        return await this.onBeforeFetch(action, options as HttpRequestOptions);
    }

    /**
     * 处理单个数据项
     */
    protected processItem(
        action: ENTITY_ACTION,
        options: HttpRequestOptions,
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

        return { ...data, ...result };
    }

    /**
     * 准备字段值（钩子）
     */
    protected onPrepareField(
        field: FieldDefinition,
        value: any,
        rawData: any,
        action: ENTITY_ACTION,
        options: HttpRequestOptions
    ) {
        return value;
    }

    /**
     * 请求前钩子
     */
    protected async onBeforeFetch(
        action: ENTITY_ACTION,
        options: HttpRequestOptions
    ): Promise<HttpRequestOptions> {
        this.logger.debug('onBeforeFetch', action, options);
        return options;
    }

    /**
     * 填充响应数据
     */
    protected populateResponseData(context: RequestContext) {
        if (context.data?.list && context.data.list.length > 0) {
            context.data.list = context.data.list.map((item: any) =>
                this.processEntity(context, item)
            );
        }
        if (context.data?.item) {
            context.data.item = this.processEntity(context, context.data.item);
        }
    }

    /**
     * 处理实体数据（钩子）
     */
    protected processEntity(context: RequestContext, entity: IEntity): any {
        if (!entity) return entity;
        return this.onPopulateEntity(context, entity);
    }

    /**
     * 填充实体钩子
     */
    protected onPopulateEntity(context: RequestContext, entity: IEntity): any {
        return entity;
    }

    /**
     * 请求后钩子
     */
    protected async onAfterFetch(action: string, context: RequestContext): Promise<void> {
        this.logger.debug('onAfterFetch', action, context);
    }

    public dispose(): void {
        // 清理数据字段
        this.sourceData?.clear();
        this.items = [];
        this.item = null;
        this.search = null as any;
        this.loading = false;
        this.disposeAbilities?.();
        super.dispose();
    }
}
