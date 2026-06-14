import { IBaseEntityState, IEntity, IExposeResult, SearchParams } from '../../types';
import { AbilityBase } from '../../composable';
export declare class StateCacheAbility<T extends IEntity, TSearch extends SearchParams> extends AbilityBase<IBaseEntityState<T, TSearch>> {
    private _provider;
    protected expose(): IExposeResult;
    protected getCacheKey(): string;
    private simpleHash;
    private getProvider;
    protected onDispose(): void;
}
//# sourceMappingURL=StateCacheAbility.d.ts.map