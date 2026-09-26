import { ComposableBase } from '@/composable';
import type { InferAbilities, Definitions } from '@/composable';
import { EventsAbility, DebounceAbility } from '@/system-abilities';
import { DomainAbility } from '@/system-abilities';
import { SystemAbility } from '@/system-abilities';
import { SchemaAbility } from '../abilities/SchemaAbility';
import type { ENTITY_ACTION } from '../types';
import type { Schema } from '@/schema';
import type { HttpRequestOptions, HttpRequestTask } from '@/http';
import type { RequestContext } from '@/context';
import { RequestContextBuilder } from '@/context';
import { DataProcessorRegistrar, DataProcessorRegistrarName } from '@/data-processor';
import { dataProcessorExecutor } from '@/data-processor';
import { RegistryHub } from '@/registry';
import { HttpExecutor } from '@/http';
import { PermissionRegistrar } from '@/permission';
import { buildRequestEvent, ENTITY_REQUEST_STATUS } from '@/events/entity-events';
import { KernelError, KernelErrorCode } from '@/error';
import { string } from '@/utils';
import { dataDispatchCenter } from '../dispatch/DataDispatchCenter';

export const CORE_ENTITY_ABILITIES = [
    EventsAbility,
    DebounceAbility,
    DomainAbility,
    SystemAbility,
    SchemaAbility,
] as const;

const CoreEntityManagerDefs: Definitions = {
    options: {
        id: '',
        entityKey: '',
        domain: 'default',
        url: '',
        cacheTTL: 300000,
        schema: null,
        permissions: {},
    },
} as const;

export abstract class CoreEntityManager extends ComposableBase {
    static entityType: string;

    eventMap: Record<string, string> = {};

    constructor(config?: Record<string, any>) {
        super(config);
        const slef = this as any;
        const ctor = this.constructor as typeof CoreEntityManager;
        if (!ctor.entityType) {
            throw new KernelError(
                `${ctor.name} must declare static entityType`,
                KernelErrorCode.ENTITY_TYPE_NOT_DECLARED,
                { className: ctor.name }
            );
        }
        if (!slef.entityKey) {
            throw new KernelError(
                `EntityKey is required for ${ctor.name}`,
                KernelErrorCode.ENTITY_KEY_REQUIRED,
                { className: ctor.name, entityType: ctor.entityType }
            );
        }
        if (!slef.id) {
            slef.id = string.getId(`mgr-${ctor.entityType}`);
        }
        slef._bindEventMap();
    }

    private _bindEventMap(): void {
        const self = this as any;
        const map = self.eventMap;
        if (!map) return;

        for (const [eventName, methodName] of Object.entries(map)) {
            this.entityOn(self.entityKey!, eventName, (data: any) => {
                const method = self[methodName as string];
                if (typeof method === 'function') {
                    method.call(self, data);
                }
            });
        }
    }

    static register(): void {
        dataDispatchCenter.registerType(this.entityType, this as any);
    }

    protected emitEvent(event: string, data?: any): void {
        this.entityEmit(event, data, { source: (this as any).entityKey });
    }

    get compiledSchema(): Schema {
        return this._getCompiledSchema().schema;
    }

    protected getDomainConfig(): any {
        return (RegistryHub.get('domain') as any)?.get((this as any).domain);
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
            const self = this as any; // Cast to CoreEntityManager
            try {
                this.logger.debug(`Executing Action [${action}] for Entity [${self.entityKey}]`);
                await self.executeDataProcessor('pre', context);
                const executor = new HttpExecutor();
                await executor.execute(context);
                await self.executeDataProcessor('post', context);
                return context;
            } catch (e) {
                self.logger.error(`Request failed in Action [${action}]!`, e);
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
        const self = this as any; // Cast to CoreEntityManager
        const schema = self.getSchema();

        return RequestContextBuilder.create()
            .withIdentity({
                domain: self.domain,
                entityName: self.entityKey,
                action: action as string,
            })
            .withRequest({
                url: self.url,
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
        const self = this as any; // Cast to CoreEntityManager
        const permConfig = self.permissions?.[action];
        if (permConfig === undefined) return true;
        if (permConfig === false) return false;

        const permAction = permConfig === true ? action : permConfig;

        return PermissionRegistrar.getInstance().hasPermission({
            action: permAction,
            entityKey: self.entityKey,
            domain: self.domain,
        });
    }

    protected onPermissionDenied(action: string) {
        const self = this as any; // Cast to CoreEntityManager
        const error = {
            code: KernelErrorCode.ENTITY_PERMISSION_DENIED,
            action,
            entityKey: self.entityKey,
            domain: self.domain,
            message: `Permission denied: [${action}] on entity [${self.entityKey}] in domain [${self.domain}]`,
        };
        self.emitEvent(buildRequestEvent(action, ENTITY_REQUEST_STATUS.ERROR), { error });
        return { context: {}, cancel: () => {} } as HttpRequestTask;
    }

    cancelAll(): void {
        this.logger.warn(`Cancelling all requests for Entity [${(this as any).entityKey}]`);
    }

    override dispose(): void {
        this.logger.debug(`CoreEntityManager [${(this as any).entityKey}] disposed.`);
        super.dispose();
    }
}

CoreEntityManager.use(CORE_ENTITY_ABILITIES);
CoreEntityManager.define(CoreEntityManagerDefs);

export interface CoreEntityManager extends InferAbilities<typeof CORE_ENTITY_ABILITIES> {}
