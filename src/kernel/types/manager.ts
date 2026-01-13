import { ILogger } from "@orbitjs/logger";
import { EnvType } from "@orbitjs/registry";
import { ENTITY_ACTION } from "./base";
import { EntityRequestTask, FlowContext } from "./actions";
import { RequestOptions } from "./http";

export interface IEntityManager {
    logger: ILogger;
    env: EnvType;
    request(action:ENTITY_ACTION, options: RequestOptions): EntityRequestTask;
    cancelAll():void;
}

export interface IReadonlyEntityManager<T, TCriteria = any> extends IEntityManager {
    fetch(action: ENTITY_ACTION | string,options: RequestOptions,updater?: (data: any) => void): Promise<FlowContext>
    get(id: string | number): Promise<void>;
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

}