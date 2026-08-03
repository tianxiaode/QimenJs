import { RegistrarBase } from '@/registry';
import { Logger } from '@qimenjs/logger';
import type { CoreEntityManager } from '../manager/CoreEntityManager';
import type { EntityManagerConstructor } from './entity-definitions';
import { DictionaryManager } from '../manager/DictionaryManager';
import type { DictionaryManagerConfig } from '../manager/DictionaryManager';
import {
    ENTITY_DATA_EVENTS,
    ENTITY_CRUD_EVENTS,
    ENTITY_LIST_EVENTS,
    ENTITY_TREE_EVENTS,
    ENTITY_SEARCH_EVENTS,
    ENTITY_UPLOAD_EVENTS,
    ENTITY_VALIDATION_EVENTS,
    DICTIONARY_EVENTS,
} from '@/events';

interface EntityTypeEntry {
    mgrType: EntityManagerConstructor;
}

interface EntityInstance {
    mgr: CoreEntityManager;
    refCount: number;
}

interface DictEntry {
    data: any[];
    config?: DictionaryManagerConfig;
}

export class DataDispatchCenter extends RegistrarBase<Map<string, EntityTypeEntry>> {
    public readonly name = 'DataDispatchCenter';
    protected storage = new Map<string, EntityTypeEntry>();

    private readonly instances = new Map<string, EntityInstance>();
    private readonly dictStore = new Map<string, DictEntry>();

    constructor() {
        super();
        this.logger.debug?.('[DataDispatchCenter] initialized');
    }

    registerType(entityType: string, mgrType: EntityManagerConstructor): void {
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

    registerDict(name: string, data: any[], config?: DictionaryManagerConfig): void {
        this.checkLock();
        this.storage.set(name, {
            mgrType: DictionaryManager as unknown as EntityManagerConstructor,
        });
        this.dictStore.set(name, { data, config });
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

    connect(entityKey: string): CoreEntityManager {
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
            ...(dictEntry ? { dictConfig: dictEntry.config } : {}),
        });

        if (dictEntry) {
            (mgr as DictionaryManager).loadDictionary(dictEntry.data);
        }

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

    getManager(entityKey: string): CoreEntityManager | undefined {
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

const VALID_ENTITY_EVENTS: Set<string> = new Set([
    ...Object.values(ENTITY_DATA_EVENTS),
    ...Object.values(ENTITY_CRUD_EVENTS),
    ...Object.values(ENTITY_LIST_EVENTS),
    ...Object.values(ENTITY_TREE_EVENTS),
    ...Object.values(ENTITY_SEARCH_EVENTS),
    ...Object.values(ENTITY_UPLOAD_EVENTS),
    ...Object.values(ENTITY_VALIDATION_EVENTS),
    ...Object.values(DICTIONARY_EVENTS),
]);

export function validateEntityEvent(event: string): boolean {
    if (!VALID_ENTITY_EVENTS.has(event)) {
        const logger = Logger.for('entity-dispatch');
        logger.warn?.(`[DataDispatchCenter] unknown entity event "${event}", valid events:`, [
            ...VALID_ENTITY_EVENTS,
        ]);
        return false;
    }
    return true;
}
