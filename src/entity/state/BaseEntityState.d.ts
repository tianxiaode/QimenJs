import { ComposableBase } from '../../composable';
import { IEntity, Schema, SearchParams, IBaseEntityState, IStateCacheAbility, IStateSchemaAbility, IStateSearchAbility, IStateDirtyAbility } from '../../types';
export declare abstract class BaseEntityState<T extends IEntity, TSearch extends SearchParams> extends ComposableBase implements IBaseEntityState<T, TSearch> {
    loading: boolean;
    items: T[];
    item: T | null;
    search: TSearch;
    schema: Schema;
    cacheTTL: number;
    isRemote: boolean;
    constructor(schema: Schema, cacheTTL: number);
    abstract refreshView(): void;
    dispose(): void;
}
export interface BaseEntityState<T extends IEntity, TSearch extends SearchParams> extends IStateCacheAbility, IStateSchemaAbility, IStateSearchAbility<T, TSearch>, IStateDirtyAbility<T> {
}
//# sourceMappingURL=BaseEntityState.d.ts.map