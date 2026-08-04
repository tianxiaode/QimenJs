import type { IEntity, Schema, RegistrSchema, SearchParams } from '@/schema';
import type { IComposableBase } from '@/composable';
import type { HttpRequestOptions, HttpRequestTask } from '@/http';
import type { RequestContext } from '@/context';
import { ENTITY_ACTION } from './constants';

export interface ICoreEntityManager extends IComposableBase {
    domain: string;
    entityKey: string;
    url: string;
    schema: RegistrSchema;
    readonly compiledSchema: Schema;
    request(action: ENTITY_ACTION, options: HttpRequestOptions): HttpRequestTask;
    cancelAll(): void;
    dispose(): void;
}

export interface IBaseEntityManager<
    TSearch extends SearchParams = SearchParams,
> extends ICoreEntityManager {
    loading: boolean;
    items: IEntity[];
    item: IEntity | null;
    search: TSearch;
    sourceData: Map<string | number, IEntity>;
    fetch(action: ENTITY_ACTION, options: HttpRequestOptions): Promise<RequestContext>;
    buildOptions(
        action: ENTITY_ACTION,
        params?: any,
        body?: any,
        extra?: Partial<HttpRequestOptions>
    ): Promise<HttpRequestOptions>;
}

export type EntityManagerConstructor = new (...args: any[]) => ICoreEntityManager;
