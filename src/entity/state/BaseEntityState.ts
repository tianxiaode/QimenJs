import { ComposableBase } from '@/composable';
import type { AbilityConstructor } from '@/composable';
import type { IEntity, Schema, SearchParams } from '@/schema';
import type { IBaseEntityState } from '@/entity/types';
import { StateSchemaAbility } from '@/entity/abilities/state/StateSchemaAbility';
import { StateCacheAbility } from '@/entity/abilities/state/StateCacheAbility';
import { StateDirtyAbility } from '@/entity/abilities/state/StateDirtyAbility';
import { StateSearchAbility } from '@/entity/abilities/state/StateSearchAbility';

export abstract class BaseEntityState<T extends IEntity, TSearch extends SearchParams>
    extends ComposableBase
    implements IBaseEntityState<T, TSearch>
{
    static readonly abilities: readonly AbilityConstructor[] = [
        StateSchemaAbility,
        StateCacheAbility,
        StateDirtyAbility,
        StateSearchAbility,
    ];

    loading: boolean = false;
    items: T[] = [];
    item: T | null = null;
    search: TSearch = {} as TSearch;
    schema: Schema;
    cacheTTL: number;
    isRemote: boolean = false;

    constructor(schema: Schema, cacheTTL: number) {
        super();
        this.schema = schema;
        this.cacheTTL = cacheTTL;
    }

    abstract refreshView(): void;

    dispose(): void {
        this.search = null as any; // 统一搜索对象
        this.items = [];
        this.item = null;
        this.schema = null as any;
        this.loading = false;
        super.dispose();
    }
}
