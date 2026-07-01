import { ComposableBase } from '@/composable';
import type { AbilityType } from '@/composable';
import type { IEntity, Schema, SearchParams } from '@/schema';
import type { IBaseEntityState, IStateSchemaAbility, IStateCacheAbility, IStateDirtyAbility } from '@/entity/types';
import { StateSchemaAbility } from '@/entity/abilities/state/base/StateSchemaAbility';
import { StateCacheAbility } from '@/entity/abilities/state/base/StateCacheAbility';
import { StateDirtyAbility } from '@/entity/abilities/state/base/StateDirtyAbility';

export abstract class BaseEntityState<TSearch extends SearchParams>
    extends ComposableBase
    implements IBaseEntityState<TSearch>
{
    static readonly abilities: readonly AbilityType[] = [
        StateSchemaAbility,
        StateCacheAbility,
        StateDirtyAbility,
    ];

    loading: boolean = false;
    items: IEntity[] = [];
    item: IEntity | null = null;
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

export type BaseEntityStateAbilities =
    IStateSchemaAbility &
    IStateCacheAbility &
    IStateDirtyAbility;
