import { ENTITY_ACTION, FieldDefinition, FlowContext, RequestOptions, IBaseEntityManager, IEntity, SearchParams, EntityState } from '../types';
import { CoreEntityManager } from './CoreEntityManager';
export declare abstract class BaseEntityManager<T extends IEntity, TSearch extends SearchParams, TState extends EntityState<T, TSearch>> extends CoreEntityManager implements IBaseEntityManager<T, TSearch, TState> {
    abstract state: TState;
    fetch(action: ENTITY_ACTION, options: RequestOptions): Promise<FlowContext>;
    buildOptions(action: ENTITY_ACTION, params?: any, body?: any, extra?: Partial<RequestOptions>): Promise<RequestOptions>;
    protected processItem(action: ENTITY_ACTION, options: RequestOptions, data: any, fields: FieldDefinition[]): any;
    protected onPrepareField(field: FieldDefinition, value: any, rawData: any, action: ENTITY_ACTION, options: RequestOptions): any;
    protected onBeforeFetch(action: ENTITY_ACTION, options: RequestOptions): Promise<RequestOptions>;
    protected populateResponseData(context: FlowContext): void;
    protected processEntity(context: FlowContext, entity: any, fields?: FieldDefinition[]): any;
    protected onPopulateEntity(context: FlowContext, entity: T): any;
    protected onAfterFetch(action: string, context: FlowContext): Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=BaseEntityManager.d.ts.map