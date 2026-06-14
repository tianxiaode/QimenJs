import { DebounceAbilityBase } from '../../../composable';
import { IEntity, IBaseEntityManager, IExposeResult, SearchParams, IFlatRemoteEntityState } from '../../../types';
export declare class FlatRemoteGetAllAbility<T extends IEntity, TSearch extends SearchParams, TState extends IFlatRemoteEntityState<T, TSearch>> extends DebounceAbilityBase<IBaseEntityManager<T, TSearch, TState>> {
    /**
     * 暴露外部可调用的方法
     *
     * @returns 返回包含 getAll 方法的对象，供外部使用
     */
    protected expose(): IExposeResult;
    protected internalGetAll(): Promise<T[]>;
}
//# sourceMappingURL=FlatRemoteGetAllAbility.d.ts.map