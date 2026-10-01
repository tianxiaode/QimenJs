import type { AbilityDefinition } from '@/composable';
import { ENTITY_COMMAND_EVENTS, ENTITY_LIFECYCLE_EVENTS } from '@/events';
import { DICTIONARY_MANAGER_ENTITY_TYPE } from '@/entity/types';
import type { EntityDataHost } from './types';

export const EntityDataAbility = {
    _connectEntity(this: EntityDataHost): void {
        const entityKey = this.getData('entityKey');
        if (!entityKey) return;

        this.entityEmit(ENTITY_LIFECYCLE_EVENTS.CONNECT, {
            entityKey,
            entityType: this.getData('entityType') || DICTIONARY_MANAGER_ENTITY_TYPE,
        });

        const data = this.getData('data');
        if (Array.isArray(data) && data.length > 0) {
            this.entityEmit(ENTITY_COMMAND_EVENTS.LOAD_DICTIONARY, data, { source: entityKey });
        }

        this.entityEmit(ENTITY_COMMAND_EVENTS.LIST, null, { source: entityKey });

        this.onCleanup(() => this._disconnectEntity());
    },

    _disconnectEntity(this: EntityDataHost): void {
        const entityKey = this.getData('entityKey');
        if (entityKey) {
            this.entityEmit(ENTITY_LIFECYCLE_EVENTS.DISCONNECT, { entityKey });
        }
    },

    onEntityListed(this: EntityDataHost, items: any[]): void {
        this._entityItems = Array.isArray(items) ? items : [];
        if (typeof this._onEntityDataChange === 'function') {
            this._onEntityDataChange();
        }
    },

    hasEntity(this: EntityDataHost): boolean {
        return !!this.getData('entityKey');
    },

    getEntityItems(this: EntityDataHost): any[] {
        return this._entityItems;
    },
} satisfies AbilityDefinition;
