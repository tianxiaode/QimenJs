import { DictionaryManager } from './DictionaryManager';
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