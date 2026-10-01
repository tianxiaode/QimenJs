import { globalEventBus } from './GlobalEventBus';
import type { IEventScope } from './types';
import type { EventContext } from '@/context';
import { ILogger, Logger } from '@qimenjs/logger';
import { ENTITY_LIFECYCLE_EVENTS } from './entity-events';

const BROADCAST_EVENTS = new Set<string>([
    ENTITY_LIFECYCLE_EVENTS.CONNECT,
    ENTITY_LIFECYCLE_EVENTS.DISCONNECT,
]);

function encodeEntityEvent(entityKey: string, eventName: string): string {
    if (BROADCAST_EVENTS.has(eventName)) {
        return `entity:${eventName}`;
    }
    return `entity:${entityKey}:${eventName}`;
}

export class EntityEventBus {
    private static instance: EntityEventBus;

    private readonly entityScope: IEventScope;
    private readonly logger: ILogger;

    private constructor() {
        this.entityScope = globalEventBus.createEventScope();
        this.logger = Logger.for('entity-bus');
        this.logger.debug?.(
            '[EntityEventBus] initialized, scopeId =',
            this.entityScope.getScopeId()
        );
    }

    static getInstance(): EntityEventBus {
        if (!EntityEventBus.instance) {
            EntityEventBus.instance = new EntityEventBus();
        }
        return EntityEventBus.instance;
    }

    getScopeId(): string {
        return this.entityScope.getScopeId();
    }

    entityEmit(ctx: EventContext): void {
        const entityKey = ctx.source;
        const eventName = ctx.type!;
        const entityEvent = encodeEntityEvent(entityKey, eventName);
        this.logger.debug?.(
            '[EntityEventBus] entityEmit, entityKey =',
            entityKey,
            'eventName =',
            eventName
        );

        if (BROADCAST_EVENTS.has(eventName)) {
            this.entityScope.emit(entityEvent, { entityKey, ...ctx });
        } else {
            this.entityScope.emit(entityEvent, ctx);
        }
    }

    entityOn(entityKey: string, eventName: string, handler: (data: any) => void): () => void {
        const entityEvent = encodeEntityEvent(entityKey, eventName);
        this.logger.debug?.(
            '[EntityEventBus] entityOn, entityKey =',
            entityKey,
            'eventName =',
            eventName
        );
        return this.entityScope.on(entityEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    entityOnce(entityKey: string, eventName: string, handler: (data: any) => void): void {
        const entityEvent = encodeEntityEvent(entityKey, eventName);
        this.entityScope.once(entityEvent, (ctx: any) => {
            const data = ctx?.data !== undefined ? ctx.data : ctx;
            handler(data);
        });
    }

    dispose(): void {
        this.entityScope.dispose();
        this.logger.debug?.('[EntityEventBus] disposed');
    }
}

export const entityEventBus = EntityEventBus.getInstance();
