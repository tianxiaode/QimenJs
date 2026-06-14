import { ILocalCreateAbility, ILocalDeleteAbility, ILocalListAbility, ILocalToggleAbility, ILocalUpdateAbility, IRemoteCreateAbility, IRemoteDeleteAbility, IRemoteGetAbility, IRemoteGetAllAbility, IRemoteListAbility, IRemoteQueryAbility, IRemoteToggleAbility, IRemoteUpdateAbility } from '../types';
import { BaseEntityManager } from './BaseEntityManager';
export declare abstract class RemoteReadonlyEntityManager<T, TC> extends BaseEntityManager<T, TC> {
}
export interface RemoteReadonlyEntityManager<T, TC> extends IRemoteListAbility<T>, IRemoteGetAbility<T>, IRemoteGetAbility<T>, IRemoteGetAllAbility<T>, IRemoteQueryAbility<T, TC> {
}
export declare abstract class LocalReadonlyEntityManager<T, TC> extends EntitBaseEntityManageryManagerBase<T, TC> {
}
export interface LocalReadonlyEntityManager<T, TC> extends ILocalListAbility<T, TC> {
}
export declare abstract class RemoteCurdEntityManager<T, TC> extends BaseEntityManager<T, TC> {
}
export interface RemoteCurdEntityManager<T, TC> extends IRemoteCreateAbility<T>, IRemoteUpdateAbility<T>, IRemoteDeleteAbility, IRemoteToggleAbility<T> {
}
export declare abstract class LocalCrudEntityManager<T, TC> extends EntityManagerBase<T, TC> {
}
export interface LocalCrudEntityManager<T, TC> extends ILocalCreateAbility<T>, ILocalUpdateAbility<T>, ILocalDeleteAbility, ILocalToggleAbility<T> {
}
//# sourceMappingURL=managers.d.ts.map