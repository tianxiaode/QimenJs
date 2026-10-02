export interface EntityDataHost {
    getData(key: string): any;
    setData(key: string, value: any, raw?: boolean): void;
    entityEmit(event: string, data?: any, opts?: Record<string, any>): void;
    entityOn(entityKey: string, eventName: string, handler: (data: any) => void): () => void;
    onCleanup(cb: () => void): void;
    _entityItems: any[];
    _disconnectEntity: () => void;
    onEntityListed: (items: any[]) => void;
    _onEntityDataChange?: () => void;
}
