import { DictionaryManagerConfig } from './dictionary';

export interface EntityTypeEntry {
    mgrType: any;
}

export interface EntityInstance {
    mgr: any;
    refCount: number;
}
