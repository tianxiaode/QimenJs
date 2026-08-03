import { ComposableBase, withAbilities } from '@/composable';
import type { InferAbilities } from '@/composable';
import { EventAbility, DebounceAbility } from '@/system-abilities';
import { DomainAbility } from '@/system-abilities';
import { SystemAbility } from '@/system-abilities';
import { SchemaAbility } from '@/entity/abilities/SchemaAbility';
import type { ENTITY_ACTION } from '@/entity/types';
import type { Schema, RegistrSchema } from '@/schema';
import type { HttpRequestOptions, HttpRequestTask } from '@/http';
import type { RequestContext } from '@/context';
import { RequestContextBuilder, EventContextBuilder } from '@/context';
import { DataProcessorRegistrar, DataProcessorRegistrarName } from '@/data-processor';
import { dataProcessorExecutor } from '@/data-processor';
import { RegistryHub } from '@/registry';
import { HttpExecutor } from '@/http';
import { PermissionRegistrar } from '@/permission';
import type { PermissionQuery } from '@/permission';
import { EntityEventBus } from '@/events';

export const CORE_ENTITY_ABILITIES = [
    EventAbility,
    DebounceAbility,
    DomainAbility,
    SystemAbility,
    SchemaAbility,
] as const;

export abstract class CoreEntityManager extends ComposableBase {
    static entityType: string;

    domain: string = 'default';
    entityKey: string;
    abstract url: string;

    cacheTTL: number = 300000;

    abstract schema: RegistrSchema;

    static permissions: Record<string, boolean | string> = {};

    constructor(config?: Record<string, any>) {
        super();
        const ctor = this.constructor as typeof CoreEntityManager;
        if (!ctor.entityType) {
            throw new Error(`${ctor.name} must declare static entityType`);
        }
        this.entityKey = config?.entityKey ?? ctor.entityType;
    }

    static register(): void {
        const { entityDispatchCenter } = require('../dispatch/EntityDispatchCenter') as {
            entityDispatchCenter: import('../dispatch/EntityDispatchCenter').EntityDispatchCenter;
        };
        entityDispatchCenter.registerType(this.entityType, this as any);
    }

    protected entityEmit(event: string, data?: any): void {
        EntityEventBus.getInstance().entityEmit(
            EventContextBuilder.create()
                .withEvent(event)
                .withType(event)
                .withSource(this.entityKey)
                .withData(data)
                .build()
        );
    }

    get compiledSchema(): Schema {
        return this._getCompiledSchema().schema;
    }

    protected getDomainConfig(): any {
        return (RegistryHub.get('domain') as any)?.get(this.domain);
    }

    protected getDataProcessorPreset(): string {
        const domainConfig = this.getDomainConfig();
        return domainConfig?.preset || 'default';
    }

    request(action: ENTITY_ACTION, options: HttpRequestOptions): HttpRequestTask {
        if (!this.requirePermission(action as string)) {
            return this.onPermissionDenied(action as string);
        }

        const context = this.buildRequestContext(action, options);

        const execute = async (): Promise<RequestContext> => {
            try {
                this.logger.debug(`Executing Action [${action}] for Entity [${this.entityKey}]`);
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

    protected buildRequestContext(
        action: ENTITY_ACTION,
        options: HttpRequestOptions
    ): RequestContext {
        const schema = this.getSchema();

        return RequestContextBuilder.create()
            .withIdentity({
                domain: this.domain,
                entityName: this.entityKey,
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

    protected requirePermission(action: string): boolean {
        const permConfig = (this.constructor as any).permissions?.[action];
        if (permConfig === undefined) return true;

        const permAction = permConfig === true ? action : permConfig;

        return PermissionRegistrar.getInstance().hasPermission({
            action: permAction,
            entityKey: this.entityKey,
            domain: this.domain,
        });
    }

    protected onPermissionDenied(action: string): HttpRequestTask {
        throw new Error(
            `Permission denied: [${action}] on entity [${this.entityKey}] in domain [${this.domain}]`
        );
    }

    cancelAll(): void {
        this.logger.warn(`Cancelling all requests for Entity [${this.entityKey}]`);
    }

    override dispose(): void {
        this.logger.debug(`CoreEntityManager [${this.entityKey}] disposed.`);
        super.dispose();
    }
}

withAbilities(CoreEntityManager, CORE_ENTITY_ABILITIES);

export interface CoreEntityManager extends InferAbilities<typeof CORE_ENTITY_ABILITIES> {}
