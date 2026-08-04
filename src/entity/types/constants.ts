export const SCHEMA_CACHE_SYMBOL = Symbol('schema-cache');

export enum ENTITY_ACTION {
    LIST = 'list',
    GET = 'get',
    GET_ALL = 'getAll',
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    TOGGLE = 'toggle',
    SAVE = 'save',
    BATCH_DELETE = 'batchDelete',
}

export const DICTIONARY_MANAGER_ENTITY_TYPE = 'dictionary_manager';
