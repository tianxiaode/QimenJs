export { SCHEMA_CACHE_SYMBOL, ENTITY_ACTION, DICTIONARY_MANAGER_ENTITY_TYPE } from './constants';
export type { ILocalChangeSet, IDeletionPlan } from './change-set';
export type {
    IBaseEntityState,
    ILocalEntityState,
    IFlatLocalEntityState,
    IRemoteEntityState,
    IFlatRemoteEntityState,
    ITreeRemoteEntityState,
    EntityState,
} from './entity-state';
export type {
    ICoreEntityManager,
    IBaseEntityManager,
    EntityManagerConstructor,
} from './entity-manager';
export type {
    ISchemaAbility,
    ILocalListAbility,
    ILocalGetAbility,
    IFlatLocalMutationAbility,
    IFlatLocalDeleteAbility,
    IFlatLocalStateAbility,
    IFlatRemoteListAbility,
    IFlatRemoteGetAllAbility,
    IRemoteGetAbility,
    IRemoteCreateAbility,
    IRemoteUpdateAbility,
    IRemoteDeleteAbility,
    IRemoteToggleAbility,
    IFlatRemoteQueryAbility,
    IFlatRemoteStateAbility,
    ITreeRemoteStateAbility,
    ITreeManagerAbility,
    IStateSchemaAbility,
    IStateCacheAbility,
    IStateDirtyAbility,
    IStateLocalMutationAbility,
    IStateSearchAbility,
    ITreePathAbility,
    ITreeLifecycleAbility,
    ITreeSearchAbility,
    ITreeViewAbility,
} from './ability-interfaces';
export type { DictionaryManagerConfig } from './dictionary';
export * from './entries';
