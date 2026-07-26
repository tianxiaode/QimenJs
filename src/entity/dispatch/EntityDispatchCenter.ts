import { RegistrarBase } from '@/registry/registrars/RegistrarBase';
import { EntityEventBus } from '@/events/EntityEventBus';
import { Logger } from '@qimenjs/logger';
import type { CoreEntityManager } from '../manager/CoreEntityManager';
import type { EntityDefinitions, EntityManagerConstructor } from './entity-definitions';
import {
    ENTITY_DATA_EVENTS,
    ENTITY_CRUD_EVENTS,
    ENTITY_LIST_EVENTS,
    ENTITY_TREE_EVENTS,
    ENTITY_SEARCH_EVENTS,
    ENTITY_UPLOAD_EVENTS,
    ENTITY_REQUEST_STATUS,
    buildRequestEvent,
} from '@/events/entity-events';
import { ENTITY_EVENTS } from '@/events/component-events';
import { EventContextBuilder } from '@/context';

interface EntityEntry {
    mgrType: EntityManagerConstructor;
    config?: Record<string, any>;
}

interface EntityInstance {
    mgr: CoreEntityManager;
    refCount: number;
    offFns: (() => void)[];
}

const BRIDGED_EVENTS: string[] = [
    ENTITY_DATA_EVENTS.DATA_CHANGE,
    ENTITY_CRUD_EVENTS.CREATED,
    ENTITY_CRUD_EVENTS.UPDATED,
    ENTITY_CRUD_EVENTS.DELETED,
    ENTITY_CRUD_EVENTS.SAVED,
    ENTITY_CRUD_EVENTS.TOGGLED,
    ENTITY_LIST_EVENTS.LISTED,
    ENTITY_LIST_EVENTS.GOT,
    ENTITY_TREE_EVENTS.EXPANDED,
    ENTITY_TREE_EVENTS.COLLAPSED,
    ENTITY_TREE_EVENTS.MOVED,
    ENTITY_TREE_EVENTS.CHILDREN_REFRESHED,
    ENTITY_SEARCH_EVENTS.CHANGE,
    ENTITY_UPLOAD_EVENTS.PROGRESS,
];

const ENTITY_ACTIONS = [
    'list',
    'create',
    'update',
    'delete',
    'toggle',
    'save',
    'get',
    'refresh',
    'reload',
    'filter',
    'searchBy',
    'sort',
    'reset',
    'prev',
    'next',
    'jump',
    'changeSize',
    'expand',
    'collapse',
    'move',
    'getSubTree',
    'upload',
];

export class EntityDispatchCenter extends RegistrarBase<Map<string, EntityEntry>> {
    public readonly name = 'EntityDispatchCenter';
    protected storage = new Map<string, EntityEntry>();

    private readonly instances = new Map<string, EntityInstance>();
    private readonly bus: EntityEventBus;

    constructor() {
        super();
        this.bus = EntityEventBus.getInstance();
        this.logger.debug?.('[EntityDispatchCenter] initialized');
    }

    register(
        entityKey: string,
        mgrType: EntityManagerConstructor,
        config?: Record<string, any>
    ): void {
        this.checkLock();
        this.storage.set(entityKey, { mgrType, config });
        this._listenEntityActions(entityKey);
        this.logger.debug?.(`[EntityDispatchCenter] registered entityKey="${entityKey}"`);
    }

    registerAll(definitions: EntityDefinitions): void {
        for (const [entityKey, def] of Object.entries(definitions)) {
            this.register(entityKey, def.mgrType, def.config);
        }
    }

    unregister(entityKey: string): void {
        this.checkLock();
        const instance = this.instances.get(entityKey);
        if (instance) {
            for (const off of instance.offFns) off();
            instance.mgr.dispose();
            this.instances.delete(entityKey);
        }
        this.storage.delete(entityKey);
        this.logger.debug?.(`[EntityDispatchCenter] unregistered entityKey="${entityKey}"`);
    }

    get(entityKey: string): EntityEntry | undefined {
        return this.storage.get(entityKey);
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

        const entry = this.storage.get(entityKey);
        if (!entry) {
            this.logger.error?.(`[EntityDispatchCenter] entityKey="${entityKey}" not registered`);
            throw new Error(`EntityDispatchCenter: entityKey "${entityKey}" not registered`);
        }

        const mgr = new entry.mgrType(entry.config);
        const offFns = this._bridgeMgrEvents(entityKey, mgr);

        this.instances.set(entityKey, { mgr, refCount: 1, offFns });
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
            for (const off of entry.offFns) off();
            entry.mgr.dispose();
            this.instances.delete(entityKey);
            this.logger.debug?.(`[EntityDispatchCenter] disposed entityKey="${entityKey}"`);
        }
    }

    getManager(entityKey: string): CoreEntityManager | undefined {
        return this.instances.get(entityKey)?.mgr;
    }

    has(entityKey: string): boolean {
        return this.storage.has(entityKey);
    }

    protected doInspect(): void {
        const definitions = [...this.storage.keys()];
        const instances = [...this.instances.entries()].map(([key, inst]) => ({
            entityKey: key,
            refCount: inst.refCount,
            mgrType: inst.mgr.constructor.name,
        }));

        console.log('Definitions:', definitions);
        console.log('Instances:', instances);
        console.log('EventBus scopeId:', this.bus.getScopeId());
    }

    private _listenEntityActions(entityKey: string): void {
        for (const action of ENTITY_ACTIONS) {
            this.bus.entityOn(entityKey, action, (data: any) => {
                this._dispatchAction(entityKey, action, data);
            });
        }
    }

    private _dispatchAction(entityKey: string, action: string, data?: any): void {
        let mgr = this.instances.get(entityKey)?.mgr;
        if (!mgr) {
            if (!this.storage.has(entityKey)) {
                this.logger.warn?.(
                    `[EntityDispatchCenter] action "${action}" ignored, entityKey="${entityKey}" not registered`
                );
                return;
            }
            mgr = this.connect(entityKey);
        }

        if (typeof (mgr as any)[action] === 'function') {
            (mgr as any)[action](data);
        } else {
            this.logger.warn?.(
                `[EntityDispatchCenter] mgr has no method "${action}" for entityKey="${entityKey}"`
            );
        }
    }

    private _bridgeMgrEvents(entityKey: string, mgr: CoreEntityManager): (() => void)[] {
        const offFns: (() => void)[] = [];

        for (const event of BRIDGED_EVENTS) {
            const off = mgr.on(event, (ctx: any) => {
                const data = ctx?.data !== undefined ? ctx.data : ctx;
                this.bus.entityEmit(
                    EventContextBuilder.create()
                        .withEvent(event)
                        .withType(event)
                        .withSource(entityKey)
                        .withData(data)
                        .build()
                );
            });
            offFns.push(off);
        }

        for (const action of [
            'list',
            'create',
            'update',
            'delete',
            'toggle',
            'save',
            'upload',
        ] as const) {
            for (const status of [
                ENTITY_REQUEST_STATUS.LOADING,
                ENTITY_REQUEST_STATUS.SUCCESS,
                ENTITY_REQUEST_STATUS.ERROR,
            ]) {
                const mgrEvent = buildRequestEvent(action, status);
                const off = mgr.on(mgrEvent, (ctx: any) => {
                    const data = ctx?.data !== undefined ? ctx.data : ctx;
                    this.bus.entityEmit(
                        EventContextBuilder.create()
                            .withEvent(mgrEvent)
                            .withType(mgrEvent)
                            .withSource(entityKey)
                            .withData(data)
                            .build()
                    );
                });
                offFns.push(off);
            }
        }

        return offFns;
    }

    dispose(): void {
        for (const [key, entry] of this.instances) {
            for (const off of entry.offFns) off();
            entry.mgr.dispose();
        }
        this.instances.clear();
        this.logger.debug?.('[EntityDispatchCenter] all disposed');
    }
}

export const entityDispatchCenter = EntityDispatchCenter.getInstance();

const VALID_ENTITY_EVENTS: Set<string> = new Set(Object.values(ENTITY_EVENTS));

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
