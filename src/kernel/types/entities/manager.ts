import { ILogger } from '@orbitjs/logger';
import { EnvType } from '@orbitjs/registry';
import { ENTITY_ACTION } from '../base';
import { EntityRequestTask, FlowContext } from '../actions';
import { RequestOptions } from '../http';
import { IComposableBase } from '../composable';

export interface ICoreEntityManager extends IComposableBase {
    domain: string;
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask;
    cancelAll(): void;
    emit(event: string, data: any): void;
    [key: string]: any;
}

export interface ICollectionState<T = any, TC = Record<string, any>> {
    items: T[];
    item: T  | null;
    total: number;
    pageIndex: number;
    pageSize: number;
    pageSizes: number[];
    pageCount: number;
    filter: string;
    criteria: TC;
    loading: boolean;
    cacheTTL: number;
    sortBy: string | null;
    sortOrder: 'asc' | 'desc' | null;
    toParams(): Record<string, any>;
    updateList(items: T[], total: number): void;
    getSource(): T[];
    setSource(source: T[]): void;
    tryGetCache(): { items: T[]; total: number } | null;
    updateView(items: T[], total?: number): void;
    setCache(items: T[], total: number): void;
    reset(includePageSettings: boolean): void;
    setSort(key: string, order: 'asc' | 'desc' | null): void;
    dispose(): void;
}

export interface IEntityManagerBase<T = any, TC = Record<string, any>> extends ICoreEntityManager {
    state: ICollectionState<T, TC>;
    fetch(
        action: ENTITY_ACTION | string,
        options: RequestOptions,
        updater?: (data: any) => void
    ): Promise<FlowContext>;
}
