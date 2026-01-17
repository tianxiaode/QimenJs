import { Ability } from '../composable';
import {
    ILocalCreateAbility,
    ILocalDeleteAbility,
    ILocalListAbility,
    ILocalToggleAbility,
    ILocalUpdateAbility,
    IRemoteCreateAbility,
    IRemoteDeleteAbility,
    IRemoteGetAbility,
    IRemoteGetAllAbility,
    IRemoteListAbility,
    IRemoteQueryAbility,
    IRemoteToggleAbility,
    IRemoteUpdateAbility,
    LocalCreateAbilityName,
    LocalDeleteAbilityName,
    LocalListAbilityName,
    LocalToggleAbilityName,
    LocalUpdateAbilityName,
    RemoteCreateAbilityName,
    RemoteDeleteAbilityName,
    RemoteGetAbilityName,
    RemoteGetAllAbilityName,
    RemoteListAbilityName,
    RemoteQueryAbilityName,
    RemoteToggleAbilityName,
    RemoteUpdateAbilityName,
} from '../types';
import { EntityManagerBase } from './EntityManagerBase';

@Ability(
    RemoteListAbilityName,
    RemoteGetAbilityName,
    RemoteGetAllAbilityName,
    RemoteQueryAbilityName
)
export abstract class RemoteReadonlyEntityManager<T, TC> extends EntityManagerBase<T, TC> {}

export interface RemoteReadonlyEntityManager<T, TC>
    extends
        IRemoteListAbility<T>,
        IRemoteGetAbility<T>,
        IRemoteGetAbility<T>,
        IRemoteGetAllAbility<T>,
        IRemoteQueryAbility<T, TC> {}

@Ability(LocalListAbilityName)
export abstract class LocalReadonlyEntityManager<T, TC> extends EntityManagerBase<T, TC> {}

export interface LocalReadonlyEntityManager<T, TC> extends ILocalListAbility<T, TC> {}

@Ability(
    RemoteCreateAbilityName,
    RemoteUpdateAbilityName,
    RemoteDeleteAbilityName,
    RemoteToggleAbilityName
)
export abstract class RemoteCurdEntityManager<T, TC> extends EntityManagerBase<T, TC> {}

export interface RemoteCurdEntityManager<T, TC>
    extends
        IRemoteCreateAbility<T>,
        IRemoteUpdateAbility<T>,
        IRemoteDeleteAbility,
        IRemoteToggleAbility<T> {}

@Ability(
    LocalCreateAbilityName,
    LocalUpdateAbilityName,
    LocalDeleteAbilityName,
    LocalToggleAbilityName
)
export abstract class LocalCrudEntityManager<T, TC> extends EntityManagerBase<T, TC> {}

export interface LocalCrudEntityManager<T, TC>
    extends
        ILocalCreateAbility<T>,
        ILocalUpdateAbility<T>,
        ILocalDeleteAbility,
        ILocalToggleAbility<T> {}
