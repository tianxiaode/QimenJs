import { BaseEntityManager } from './BaseEntityManager';
import type { InferAbilities, Definitions } from '@/composable';
import type { IEntity, RegistrSchema } from '@/schema';
import { ENTITY_ACTION } from '../types/constants';
import { ENTITY_COMMAND_EVENTS as CMD, ENTITY_LIST_EVENTS } from '@/events/entity-events';
import {
    SchemaProxyAbility,
    CacheAbility,
    FlatRemoteStateAbility,
    FlatRemoteQueryAbility,
    RangeLoadAbility,
} from '../abilities';

const VIRTUAL_SCROLL_ABILITIES = [
    SchemaProxyAbility,
    CacheAbility,
    FlatRemoteStateAbility,
    FlatRemoteQueryAbility,
    RangeLoadAbility,
] as const;

const VirtualScrollDefs: Definitions = {
    options: {
        mockData: null,
    },
} as const;

export class VirtualScrollEntityManager extends BaseEntityManager {
    static entityType: string = 'virtual-scroll';

    isRemote: boolean = true;
    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
    total: number = 0;

    _rangeCache: Map<number, any> = new Map();
    _rangeTotal: number = 0;

    schema: RegistrSchema = {
        name: 'virtual-scroll',
        idField: 'id',
        idType: 'number',
        nameField: 'name',
        domain: 'remote',
        isTree: false,
    };

    eventMap: Record<string, string> = {
        [CMD.LIST]: 'list',
        [CMD.LOAD_RANGE]: 'loadRange',
    };

    constructor(config?: Record<string, any>) {
        super(config);
        this.initOptions();
    }

    async list(): Promise<any[]> {
        const mockData = this.getData('mockData');
        if (Array.isArray(mockData)) {
            this._rangeTotal = mockData.length;
            this.items = mockData;
            this.total = mockData.length;
            this.emitEvent(ENTITY_LIST_EVENTS.LISTED, this.items);
            return this.items;
        }

        const params = this.toParams();
        const options = await this.buildOptions(ENTITY_ACTION.LIST, params, null, {});
        const context = await this.fetch(ENTITY_ACTION.LIST, options);
        const { list, total } = context.data;
        this.items = list || [];
        this.total = total || 0;
        this._rangeTotal = this.total;
        this.emitEvent(ENTITY_LIST_EVENTS.LISTED, this.items);
        return this.items;
    }
}

VirtualScrollEntityManager.use(VIRTUAL_SCROLL_ABILITIES);
VirtualScrollEntityManager.define(VirtualScrollDefs);
VirtualScrollEntityManager.register();
export interface VirtualScrollEntityManager extends InferAbilities<
    typeof VIRTUAL_SCROLL_ABILITIES
> {}
