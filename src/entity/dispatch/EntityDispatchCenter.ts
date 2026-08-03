import { RegistrarBase } from '@/registry';
import { Logger } from '@qimenjs/logger';
import type { CoreEntityManager } from '../manager/CoreEntityManager';
import type { EntityManagerConstructor } from './entity-definitions';
import {
    ENTITY_DATA_EVENTS,
    ENTITY_CRUD_EVENTS,
    ENTITY_LIST_EVENTS,
    ENTITY_TREE_EVENTS,
    ENTITY_SEARCH_EVENTS,
    ENTITY_UPLOAD_EVENTS,
    ENTITY_VALIDATION_EVENTS,
} from '@/events/entity-events';

interface EntityTypeEntry {
    mgrType: EntityManagerConstructor;
}

interface EntityInstance {
    mgr: CoreEntityManager;
    refCount: number;
}

export class EntityDispatchCenter extends RegistrarBase<Map<string, EntityTypeEntry>> {
    public readonly name = 'EntityDispatchCenter';
    protected storage = new Map<string, EntityTypeEntry>();

    private readonly instances = new Map<string, EntityInstance>();

    constructor() {
        super();
        this.logger.debug?.('[EntityDispatchCenter] initialized');
    }

    registerType(entityType: string, mgrType: EntityManagerConstructor): void {
        this.checkLock();
        this.storage.set(entityType, { mgrType });
        this.logger.debug?.(`[EntityDispatchCenter] registered entityType="${entityType}"`);
    }

    unregisterType(entityType: string): void {
        this.checkLock();
        this.storage.delete(entityType);
        this.logger.debug?.(`[EntityDispatchCenter] unregistered entityType="${entityType}"`);
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

    private resolveEntityType(entityKey: string): string {
        const colonIdx = entityKey.indexOf(':');
        return colonIdx === -1 ? entityKey : entityKey.substring(0, colonIdx);
    }

    connect(entityKey: string): CoreEntityManager {
        const existing = this.instances.get(entityKey);
        if (existing) {
            existing.refCount++;
            this.logger.debug?.(
                `[EntityDispatchCenter] connect existing entityKey="${entityKey}", refCount=${existing.refCount}`
            );
            return existing.mgr;
        }

        const entityType = this.resolveEntityType(entityKey);
        const entry = this.storage.get(entityType);
        if (!entry) {
            this.logger.error?.(`[EntityDispatchCenter] entityType="${entityType}" not registered`);
            throw new Error(`EntityDispatchCenter: entityType "${entityType}" not registered`);
        }

        const mgr = new entry.mgrType({ entityKey });

        this.instances.set(entityKey, { mgr, refCount: 1 });
        this.logger.debug?.(`[EntityDispatchCenter] connect new entityKey="${entityKey}"`);

        return mgr;
    }

    disconnect(entityKey: string): void {
        const entry = this.instances.get(entityKey);
        if (!entry) return;

        entry.refCount--;
        this.logger.debug?.(
            `[EntityDispatchCenter] disconnect entityKey="${entityKey}", refCount=${entry.refCount}`
        );

        if (entry.refCount <= 0) {
            entry.mgr.dispose();
            this.instances.delete(entityKey);
            this.logger.debug?.(`[EntityDispatchCenter] disposed entityKey="${entityKey}"`);
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
        this.logger.debug?.('[EntityDispatchCenter] all disposed');
    }
}

export const entityDispatchCenter = EntityDispatchCenter.getInstance();

const VALID_ENTITY_EVENTS: Set<string> = new Set([
    ...Object.values(ENTITY_DATA_EVENTS),
    ...Object.values(ENTITY_CRUD_EVENTS),
    ...Object.values(ENTITY_LIST_EVENTS),
    ...Object.values(ENTITY_TREE_EVENTS),
    ...Object.values(ENTITY_SEARCH_EVENTS),
    ...Object.values(ENTITY_UPLOAD_EVENTS),
    ...Object.values(ENTITY_VALIDATION_EVENTS),
]);

export function validateEntityEvent(event: string): boolean {
    if (!VALID_ENTITY_EVENTS.has(event)) {
        const logger = Logger.for('entity-dispatch');
        logger.warn?.(`[EntityDispatchCenter] unknown entity event "${event}", valid events:`, [
            ...VALID_ENTITY_EVENTS,
        ]);
        return false;
    }
    return true;
}
