import { RegistrarBase } from '@/registry';
import type { DictionaryManagerConfig, EntityInstance, EntityTypeEntry } from '../types';
import { DICTIONARY_MANAGER_ENTITY_TYPE } from '../types';
import { EntityEventBus, ENTITY_LIFECYCLE_EVENTS } from '@/events';

export class DataDispatchCenter extends RegistrarBase<Map<string, EntityTypeEntry>> {
    public readonly name = 'DataDispatchCenter';
    protected storage = new Map<string, EntityTypeEntry>();

    private readonly instances = new Map<string, EntityInstance>();
    private readonly dictStore = new Map<string, DictionaryManagerConfig>();

    constructor() {
        super();
        this.logger.debug?.('[DataDispatchCenter] initialized');
        this._listenLifecycleEvents();
    }

    private _listenLifecycleEvents(): void {
        const bus = EntityEventBus.getInstance();
        bus.entityOn('*', ENTITY_LIFECYCLE_EVENTS.CONNECT, (data: any) => {
            const entityKey = data?.entityKey;
            if (entityKey) this.connect(entityKey);
        });
        bus.entityOn('*', ENTITY_LIFECYCLE_EVENTS.DISCONNECT, (data: any) => {
            const entityKey = data?.entityKey;
            if (entityKey) this.disconnect(entityKey);
        });
    }

    registerType(entityType: string, mgrType: any): void {
        this.checkLock();
        this.storage.set(entityType, { mgrType });
        this.logger.debug?.(`[DataDispatchCenter] registered entityType="${entityType}"`);
    }

    unregisterType(entityType: string): void {
        this.checkLock();
        this.storage.delete(entityType);
        this.logger.debug?.(`[DataDispatchCenter] unregistered entityType="${entityType}"`);
    }

    register(key: string, value: EntityTypeEntry): void {
        this.registerType(key, value.mgrType);
    }

    unregister(key: string): void {
        this.unregisterType(key);
    }

    get(entityType: string): EntityTypeEntry | undefined {
        return this.storage.get(entityType);
    }

    registerDict(name: string, config: DictionaryManagerConfig): void {
        this.checkLock();
        const entry = this.storage.get(DICTIONARY_MANAGER_ENTITY_TYPE)!;
        this.storage.set(name, { ...entry });
        this.dictStore.set(name, { ...config });
        this.logger.debug?.(`[DataDispatchCenter] registered dict="${name}"`);
    }

    unregisterDict(name: string): void {
        this.checkLock();
        this.storage.delete(name);
        this.dictStore.delete(name);
        this.logger.debug?.(`[DataDispatchCenter] unregistered dict="${name}"`);
    }

    private resolveEntityType(entityKey: string): string {
        const colonIdx = entityKey.indexOf(':');
        return colonIdx === -1 ? entityKey : entityKey.substring(0, colonIdx);
    }

    connect(entityKey: string): any {
        const existing = this.instances.get(entityKey);
        if (existing) {
            existing.refCount++;
            this.logger.debug?.(
                `[DataDispatchCenter] connect existing entityKey="${entityKey}", refCount=${existing.refCount}`
            );
            return existing.mgr;
        }

        const entityType = this.resolveEntityType(entityKey);
        const entry = this.storage.get(entityType);
        if (!entry) {
            this.logger.error?.(`[DataDispatchCenter] entityType="${entityType}" not registered`);
            throw new Error(`DataDispatchCenter: entityType "${entityType}" not registered`);
        }

        const dictEntry = this.dictStore.get(entityType);
        const mgr = new entry.mgrType({
            entityKey,
            ...(dictEntry ? { ...dictEntry } : {}),
        });

        this.instances.set(entityKey, { mgr, refCount: 1 });
        this.logger.debug?.(`[DataDispatchCenter] connect new entityKey="${entityKey}"`);

        return mgr;
    }

    disconnect(entityKey: string): void {
        const entry = this.instances.get(entityKey);
        if (!entry) return;

        entry.refCount--;
        this.logger.debug?.(
            `[DataDispatchCenter] disconnect entityKey="${entityKey}", refCount=${entry.refCount}`
        );

        if (entry.refCount <= 0) {
            entry.mgr.dispose();
            this.instances.delete(entityKey);
            this.logger.debug?.(`[DataDispatchCenter] disposed entityKey="${entityKey}"`);
        }
    }

    getManager(entityKey: string): any {
        return this.instances.get(entityKey)?.mgr;
    }

    has(entityType: string): boolean {
        return this.storage.has(entityType);
    }

    protected doInspect(): void {
        const types = [...this.storage.keys()];
        const instances = [...this.instances.entries()].map(([key, inst]) => ({
            entityKey: key,
            refCount: inst.refCount,
            mgrType: inst.mgr.constructor.name,
        }));

        console.log('EntityTypes:', types);
        console.log('Instances:', instances);
    }

    dispose(): void {
        for (const [, entry] of this.instances) {
            entry.mgr.dispose();
        }
        this.instances.clear();
        this.logger.debug?.('[DataDispatchCenter] all disposed');
    }
}

export const dataDispatchCenter = DataDispatchCenter.getInstance();
