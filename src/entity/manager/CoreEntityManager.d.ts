import { ActionEntry, ENTITY_ACTION, EntityRequestTask, RequestOptions, ICoreEntityManager, Schema, IEventAbilitiy, IDomainAbility, ISystemAbility, ISchemaAbility } from '../types';
import { ComposableBase } from '../composable';
export declare abstract class CoreEntityManager extends ComposableBase implements ICoreEntityManager {
    domain: string;
    abstract customActions: ActionEntry[];
    abstract entityName: string;
    abstract url: string;
    abstract schema?: Schema;
    protected activeTasks: Map<ENTITY_ACTION, AbortController>;
    constructor();
    request(action: ENTITY_ACTION, options: RequestOptions): EntityRequestTask;
    /**
     * 强力工具：取消该实体下所有的在研请求
     */
    cancelAll(): void;
    dispose(): void;
}
export interface CoreEntityManager extends IEventAbilitiy, IDomainAbility, ISystemAbility, ISchemaAbility {
}
//# sourceMappingURL=CoreEntityManager.d.ts.map