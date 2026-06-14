import { IEntity, IFlatLocalEntityState, ILocalSearchParams, IStateLocalMutationAbility } from '../../types';
import { BaseEntityState } from './BaseEntityState';
export declare class FlatLocalEntityState<T extends IEntity, TSearch extends ILocalSearchParams> extends BaseEntityState<T, TSearch> implements IFlatLocalEntityState<T, TSearch> {
    isRemote: false;
    protected sourceData: Map<string | number, T>;
    refreshView(): Promise<void>;
    dispose(): void;
}
export interface FlatLocalEntityState<T extends IEntity, TSearch extends ILocalSearchParams> extends IStateLocalMutationAbility<T> {
}
//# sourceMappingURL=FlatLocalEntityState.d.ts.map