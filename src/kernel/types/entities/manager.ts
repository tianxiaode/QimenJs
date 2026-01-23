import { ENTITY_ACTION } from './base';
import { EntityRequestTask, FlowContext } from '../actions';
import { RequestOptions } from '../http';
import { IComposableBase } from '../composable';


export interface ICoreEntityManager extends IComposableBase {
    domain: string;
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask;
    cancelAll(): void;
    [key: string]: any;
}

export interface IBaseEntityManager extends ICoreEntityManager {
    fetch(
        action: ENTITY_ACTION | string,
        payload: any,
        updater?: (data: any) => void
    ): Promise<FlowContext>;
}

