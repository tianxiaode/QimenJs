export interface DictionaryManagerConfig {
    entityKey?: string;
    valueField?: string;
    labelField?: string;
    idType?: 'number' | 'string';
    searchFields?: string[];
    defaultSort?: string;
    defaultOrder?: 'asc' | 'desc';
    data: any[];
}
