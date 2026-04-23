import { Ability, ComposableBase } from '../../composable';
import {
    IEntity,
    Schema,
    SearchParams,
    IBaseEntityState,
    StateCacheAbilityName,
    StateSchemaAbilityName,
    StateSearchAbilityName,
    StateDirtyAbilityName,
    IStateCacheAbility,
    IStateSchemaAbility,
    IStateSearchAbility,
    IStateDirtyAbility,
} from '../../types';

@Ability(
    StateCacheAbilityName,
    StateSchemaAbilityName,
    StateSearchAbilityName,
    StateDirtyAbilityName
)
export abstract class BaseEntityState<T extends IEntity, TSearch extends SearchParams>
    extends ComposableBase
    implements IBaseEntityState<T, TSearch>
{
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

export interface BaseEntityState<T extends IEntity, TSearch extends SearchParams>
    extends
        IStateCacheAbility,
        IStateSchemaAbility,
        IStateSearchAbility<T, TSearch>,
        IStateDirtyAbility<T> {}
