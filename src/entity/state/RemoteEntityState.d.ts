import { BaseEntityState } from './BaseEntityState';
import { IEntity, IRemoteEntityState, SearchParams } from '../../types';
export declare abstract class RemoteEntityState<T extends IEntity, TSearch extends SearchParams> extends BaseEntityState<T, TSearch> implements IRemoteEntityState<T, TSearch> {
    snapshot: T | null;
    isDirty(currentItem: T): boolean;
    edit(item: T): void;
    rollback(): T | null;
    dispose(): void;
}
//# sourceMappingURL=RemoteEntityState.d.ts.map