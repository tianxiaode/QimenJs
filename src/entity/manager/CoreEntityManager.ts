import { ComposableBase } from '@/composable';
import { EventAbility } from '@/system-abilities';
import { DomainAbility } from '@/system-abilities';
import { SystemAbility } from '@/system-abilities';
import { SchemaAbility } from '@/entity/abilities/SchemaAbility';
import type {
    ENTITY_ACTION,
    ICoreEntityManager,
    ISchemaAbility,
} from '@/entity/types';
import type { IEventScope, EventHandler } from '@/events';
import type { DomainConfig, SystemConfig } from '@/registry';
import type { Schema, SchemaCache, RegistrSchema } from '@/schema';
import { SchemaRegistrar } from '@/schema';
import type { HttpRequestOptions, HttpRequestTask } from '@/http/types/http-context';
import type { RequestContext } from '@/context';
import { RequestContextBuilder } from '@/context';
import { DataProcessorRegistrar, DataProcessorRegistrarName } from '@/data-processor';
import { dataProcessorExecutor } from '@/data-processor';
import { RegistryHub } from '@/registry';
import { HttpExecutor } from '@/http';

/**
 * CoreEntityManager 能力接口
 *
 * 通过声明合并为 CoreEntityManager 类添加 Ability 注入方法的类型信息。
 * 组合能力：EventAbility + DomainAbility + SystemAbility + SchemaAbility
 *
 * 注意：不 extends ICoreEntityManager，因为 ICoreEntityManager extends IComposableBase，
 * 而 IComposableBase 的 host 属性类型与 ComposableBase 类的 host getter 类型冲突。
 * Ability 注入的方法在此直接声明即可。
 */
export interface CoreEntityManager extends ISchemaAbility {
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

export abstract class CoreEntityManager extends ComposableBase implements ICoreEntityManager {
    static readonly abilities: readonly any[] = [EventAbility, DomainAbility, SystemAbility, SchemaAbility];

    domain: string = 'default';
    abstract entityName: string;
    abstract url: string;

    /**
     * 缓存过期时间（毫秒），默认 5 分钟
     * 
     * 子类可覆盖此值，如：
     * ```typescript
     * class UserManager extends RemoteCrudEntityManager {
     *     cacheTTL = 60000; // 1 分钟
     * }
     * ```
     */
    cacheTTL: number = 300000;

    /**
     * Schema 定义（原始，未编译）
     * 
     * 子类直接引用 Schema 对象，如：
     * ```typescript
     * class UserManager extends RemoteCrudEntityManager {
     *     schema = UserSchema;
     * }
     * ```
     * 
     * 构造时自动注册到 SchemaRegistrar，用 schema.name 作为 key。
     * 运行时通过 getter 获取编译后的 Schema。
     */
    abstract schema: RegistrSchema;

    /**
     * 获取编译后的 Schema
     * 
     * 通过 SchemaRegistrar 延迟编译并缓存。
     * 如果 Schema 尚未注册，自动注册后再编译。
     * 返回的是编译后的 Schema（处理了 extends/mixins/override）。
     */
    get compiledSchema(): Schema {
        const registrar = SchemaRegistrar.getInstance();
        const key = this.schema.name;
        
        // 自动注册：如果尚未注册，先注册
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

    /**
     * 获取域配置
     */
    protected getDomainConfig(): any {
        return (RegistryHub.get('domain') as any)?.get(this.domain);
    }

    /**
     * 获取数据处理预设
     */
    protected getDataProcessorPreset(): string {
        const domainConfig = this.getDomainConfig();
        return domainConfig?.preset || 'default';
    }

    /**
     * 创建请求任务
     */
    request(action: ENTITY_ACTION, options: HttpRequestOptions): HttpRequestTask {
        // 1. 构建请求上下文
        const context = this.buildRequestContext(action, options);

        // 2. 定义异步执行体
        const execute = async (): Promise<RequestContext> => {
            try {
                this.logger.debug(`Executing Action [${action}] for Entity [${this.entityName}]`);

                // 3. 前导数据处理
                await this.executeDataProcessor('pre', context);

                // 4. 执行 HTTP 请求
                const executor = new HttpExecutor();
                await executor.execute(context);

                // 5. 后导数据处理
                await this.executeDataProcessor('post', context);

                return context;
            } catch (e) {
                this.logger.error(`Request failed in Action [${action}]!`, e);
                throw e;
            }
        };

        // 6. 返回任务对象
        return {
            context: execute(),
            cancel: (reason?: string) => context.request?.controller?.abort(reason || 'manual_cancelled'),
        };
    }

    /**
     * 构建请求上下文
     */
    protected buildRequestContext(action: ENTITY_ACTION, options: HttpRequestOptions): RequestContext {
        const schema = this.getSchema();

        return RequestContextBuilder
            .create()
            .withIdentity({
                domain: this.domain,
                entityName: this.entityName,
                action: action as string,
            })
            .withRequest({
                url: this.url, // 实体管理器的基础 URL，如 /api/users
                method: 'GET',
                body: options.body,
                headers: options.headers,
                queryParams: options.queryParams,
                pathParams: options.pathParams || [], // 路径参数数组，如 ['a', 'b', 1] 生成 /api/users/a/b/1
                timeout: options.timeout || 30000,
                responseType: options.responseType || 'json',
            })
            .withParams({ ...options.queryParams })
            .withSchema(schema)
            .build();
    }

    /**
     * 执行数据处理管道
     */
    protected async executeDataProcessor(stage: 'pre' | 'post', context: RequestContext): Promise<void> {
        const preset = this.getDataProcessorPreset();
        const registrar = RegistryHub.get<DataProcessorRegistrar>(DataProcessorRegistrarName);

        if (registrar) {
            const handlers = registrar.getPipeline(preset, stage);
            this.logger.debug(`Executing DataProcessor pipeline [${preset}-${stage}]`);
            await dataProcessorExecutor.execute(context, handlers, stage);
        }
    }

    /**
     * 取消所有请求
     */
    cancelAll(): void {
        this.logger.warn(`Cancelling all requests for Entity [${this.entityName}]`);
    }

    public dispose(): void {
        this.logger.debug(`CoreEntityManager [${this.entityName}] disposed.`);
    }
}
