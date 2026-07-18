import type { CoreEntityManager } from '../manager/CoreEntityManager';

export type EntityManagerConstructor = new (...args: any[]) => CoreEntityManager;

export interface EntityDefinition {
    mgrType: EntityManagerConstructor;
    config?: Record<string, any>;
}

export type EntityDefinitions = Record<string, EntityDefinition>;
