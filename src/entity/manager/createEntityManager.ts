import { DictionaryManager } from './DictionaryManager';
import { LocalReadonlyEntityManager } from './LocalReadonlyEntityManager';
import { LocalCrudEntityManager } from './LocalCrudEntityManager';
import { RemoteReadonlyEntityManager } from './RemoteReadonlyEntityManager';
import { RemoteCrudEntityManager } from './RemoteCrudEntityManager';
import { RemoteTreeEntityManager } from './RemoteTreeEntityManager';
import type { BaseEntityManager } from './BaseEntityManager';

export type EntityManagerType =
    | 'dictionary'
    | 'local-readonly'
    | 'local-crud'
    | 'remote-readonly'
    | 'remote-crud'
    | 'remote-tree';

export interface EntityManagerConfig {
    type: EntityManagerType;
    [key: string]: any;
}

const ENTITY_MANAGER_REGISTRY: Partial<Record<EntityManagerType, any>> = {
    dictionary: DictionaryManager,
    'local-readonly': LocalReadonlyEntityManager,
    'local-crud': LocalCrudEntityManager,
    'remote-readonly': RemoteReadonlyEntityManager,
    'remote-crud': RemoteCrudEntityManager,
    'remote-tree': RemoteTreeEntityManager,
};

export function createEntityManager(config: EntityManagerConfig): BaseEntityManager {
    const ManagerClass = ENTITY_MANAGER_REGISTRY[config.type];
    if (!ManagerClass) {
        throw new Error(`Unknown entity manager type: ${config.type}`);
    }
    const { type, ...options } = config;
    return new ManagerClass(options);
}

export function registerEntityManager(type: EntityManagerType, managerClass: any): void {
    ENTITY_MANAGER_REGISTRY[type] = managerClass;
}
