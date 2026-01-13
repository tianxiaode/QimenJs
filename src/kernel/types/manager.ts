import { ILogger } from '@orbitjs/logger';
import { EnvType } from '@orbitjs/registry';
import { ENTITY_ACTION } from './base';
import { EntityRequestTask, FlowContext } from './actions';
import { RequestOptions } from './http';

export interface IEntityManager {
    logger: ILogger;
    env: EnvType;
    domain: string;
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask;
    cancelAll(): void;
}

export interface ICollectionState<T, TCriteria = any> {}

export interface IReadonlyEntityManager<T, TCriteria = any> extends IEntityManager {
    useLocalSearch: boolean;
    _pageSize?: number;
    _pageSizes?: number[];
    state: ICollectionState<T, TCriteria>;
    fetch(
        action: ENTITY_ACTION | string,
        options: RequestOptions,
        updater?: (data: any) => void
    ): Promise<FlowContext>;
    get(id: string | number): Promise<T | undefined>;
    getAll(params?: any): Promise<T[]>;
    list(forceRefresh: boolean): Promise<T[]>;
    refresh(force: boolean): Promise<T[]>;
    reset(): Promise<T[]>;
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
    jump(page: number): Promise<T[]>;
    prev(): Promise<T[]>;
    next(): Promise<T[]>;
    changeSize(size: number): Promise<T[]>;
    localFilter?: (text: string, record: T) => T[];
    localSearch?: (criteria: Partial<TCriteria>, records: T[]) => T[];
    localSort?: (
        criteria: Partial<TCriteria>,
        sort: string | null,
        order: 'asc' | 'desc' | null,
        records: T[]
    ) => T[];
}
