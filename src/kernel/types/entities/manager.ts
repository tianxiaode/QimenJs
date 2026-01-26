import { ENTITY_ACTION } from './base';
import { EntityRequestTask, FlowContext } from '../actions';
import { RequestOptions } from '../http';
import { IComposableBase } from '../composable';
import {
    EntityState,
    IFlatLocalEntityState,
    IFlatRemoteEntityState,
    ITreeLocalEntityState,
    ITreeRemoteEntityState,
} from './state';
import {
    FieldDefinition,
    IEntity,
    IFlatSearchParams,
    ILocalSearchParams,
    ITreeSearchParams,
    SearchParams,
} from './schema';

export interface ICoreEntityManager extends IComposableBase {
    domain: string;
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask;
    cancelAll(): void;
    [key: string]: any;
}

export interface IEntityManagerBase<
    T extends IEntity,
    TSearch extends SearchParams,
    TState extends EntityState<T, TSearch>,
> extends ICoreEntityManager {
    state: TState;
    fetch(
        action: ENTITY_ACTION | string,
        payload: any,
        updater?: (data: any) => void
    ): Promise<FlowContext>;
    buildOptions(
        action: string,
        params: any,
        body: any,
        extra: Partial<RequestOptions>
    ): Promise<RequestOptions>;
}

export interface IFlatRemoteEntityManager<
    T extends IEntity,
    TSearch extends IFlatSearchParams,
    TState extends IFlatRemoteEntityState<T, TSearch>,
> extends IEntityManagerBase<T, TSearch, TState> {}

export interface IFlatLocalEntityManager<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends IFlatLocalEntityState<T, TSearch>,
> extends IEntityManagerBase<T, TSearch, TState> {}

export interface ITreeRemoteEntityManager<
    T extends IEntity,
    TSearch extends ITreeSearchParams,
    TState extends ITreeRemoteEntityState<T, TSearch>,
> extends IEntityManagerBase<T, TSearch, TState> {}

export interface ITreeLocalEntityManager<
    T extends IEntity,
    TSearch extends ILocalSearchParams,
    TState extends ITreeLocalEntityState<T, TSearch>,
> extends IEntityManagerBase<T, TSearch, TState> {}
