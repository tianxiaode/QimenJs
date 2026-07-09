import { ComposableBase, type AbilityDefinition } from '@/composable';
import { EventAbility } from '@/system-abilities';
import { DomainAbility } from '@/system-abilities';
import { SystemAbility } from '@/system-abilities';
import { SchemaAbility } from '@/entity/abilities/SchemaAbility';
import type { ENTITY_ACTION, ICoreEntityManager, ISchemaAbility } from '@/entity/types';
import type { IEventScope, EventHandler } from '@/events';
import type { DomainConfig, SystemConfig } from '@/registry';
import type { Schema, RegistrSchema } from '@/schema';
import { SchemaRegistrar } from '@/schema';
import type { HttpRequestOptions, HttpRequestTask } from '@/http/types/http-context';
import type { RequestContext } from '@/context';
import { RequestContextBuilder } from '@/context';
import { DataProcessorRegistrar, DataProcessorRegistrarName } from '@/data-processor';
import { dataProcessorExecutor } from '@/data-processor';
import { RegistryHub } from '@/registry';
import { HttpExecutor } from '@/http';

/**
 * CoreEntityManager 能力声明
 */
export const CORE_ENTITY_ABILITIES: readonly AbilityDefinition[] = [
    EventAbility,
    DomainAbility,
    SystemAbility,
    SchemaAbility,
];

/**
 * 第一步：合并能力到原型上，得到中间类
 */
const ForgedCoreEntityManager = ComposableBase.forge(CORE_ENTITY_ABILITIES);

/**
 * 在中间类上声明能力接口
 *
 * 派生类 CoreEntityManager extends ForgedCoreEntityManager 后，
 * 自动拥有这些类型，无需再 export interface。
 */
export interface ForgedCoreEntityManager extends ISchemaAbility {
    // ===== EventAbility =====
    readonly eventScope: IEventScope;
    on(event: string, handler: EventHandler): () => void;
    once(event: string, handler: EventHandler): void;
    emit(event: string, data?: any): void;

    // ===== DomainAbility =====
    readonly domainConfig: DomainConfig;

    // ===== SystemAbility =====
    systemConfig(): Partial<SystemConfig>;
    systemConfig<K extends keyof SystemConfig>(key: K): any;
}

/**
 * 第二步：从中间类 extends 出 CoreEntityManager
 *
 * 自动继承 ForgedCoreEntityManager 的接口声明，
 * 不需要再 export interface CoreEntityManager。
 */
export abstract class CoreEntityManager extends ForgedCoreEntityManager implements ICoreEntityManager {
    domain: string = 'default';
    abstract entityName: string;
    abstract url: string;

    /** 缓存过期时间（毫秒），默认 5 分钟 */
    cacheTTL: number = 300000;

    /** Schema 定义（原始，未编译） */
    abstract schema: RegistrSchema;

    /** 获取编译后的 Schema */
    get compiledSchema(): Schema {
        const registrar = SchemaRegistrar.getInstance();
        const key = this.schema.name;

        if (!registrar.has(key)) {
            registrar.register(this.schema);
        }

        return registrar.getCompiled(key).schema;
    }

    getSchema(): Schema {
        return (this as any).getSchema();
    }

    getSchemaRules(fieldName?: string): any {
        return (this as any).getSchemaRules(fieldName);
    }

    /** 获取域配置 */
    protected getDomainConfig(): any {
        return (RegistryHub.get('domain') as any)?.get(this.domain);
    }

    /** 获取数据处理预设 */
    protected getDataProcessorPreset(): string {
        const domainConfig = this.getDomainConfig();
        return domainConfig?.preset || 'default';
    }

    /** 创建请求任务 */
    request(action: ENTITY_ACTION, options: HttpRequestOptions): HttpRequestTask {
        const context = this.buildRequestContext(action, options);

        const execute = async (): Promise<RequestContext> => {
            try {
                this.logger.debug(`Executing Action [${action}] for Entity [${this.entityName}]`);
                await this.executeDataProcessor('pre', context);
                const executor = new HttpExecutor();
                await executor.execute(context);
                await this.executeDataProcessor('post', context);
                return context;
            } catch (e) {
                this.logger.error(`Request failed in Action [${action}]!`, e);
                throw e;
            }
        };

        return {
            context: execute(),
            cancel: (reason?: string) =>
                context.request?.controller?.abort(reason || 'manual_cancelled'),
        };
    }

    /** 构建请求上下文 */
    protected buildRequestContext(
        action: ENTITY_ACTION,
        options: HttpRequestOptions
    ): RequestContext {
        const schema = this.getSchema();

        return RequestContextBuilder.create()
            .withIdentity({
                domain: this.domain,
                entityName: this.entityName,
                action: action as string,
            })
            .withRequest({
                url: this.url,
                method: 'GET',
                body: options.body,
                headers: options.headers,
                queryParams: options.queryParams,
                pathParams: options.pathParams || [],
                timeout: options.timeout || 30000,
                responseType: options.responseType || 'json',
            })
            .withParams({ ...options.queryParams })
            .withSchema(schema)
            .build();
    }

    /** 执行数据处理管道 */
    protected async executeDataProcessor(
        stage: 'pre' | 'post',
        context: RequestContext
    ): Promise<void> {
        const preset = this.getDataProcessorPreset();
        const registrar = RegistryHub.get<DataProcessorRegistrar>(DataProcessorRegistrarName);

        if (registrar) {
            const handlers = registrar.getPipeline(preset, stage);
            this.logger.debug(`Executing DataProcessor pipeline [${preset}-${stage}]`);
            await dataProcessorExecutor.execute(context, handlers, stage);
        }
    }

    /** 取消所有请求 */
    cancelAll(): void {
        this.logger.warn(`Cancelling all requests for Entity [${this.entityName}]`);
    }

    override dispose(): void {
        this.logger.debug(`CoreEntityManager [${this.entityName}] disposed.`);
        super.dispose();
    }
}
