export interface ILocalChangeSet<T = any> {
    added: T[];
    updated: Map<string | number, T>;
    deleted: (string | number)[];
}

export interface IDeletionPlan<T = any> {
    localOnly: T[];
    persistent: T[];
}
