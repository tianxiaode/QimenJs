export interface EntityDataHost {
    getData(key: string): any;
    setData(key: string, value: any, raw?: boolean): void;
    entityEmit(event: string, data?: any, opts?: Record<string, any>): void;
    onCleanup(cb: () => void): void;
    _entityItems: any[];
    _disconnectEntity: () => void;
    _onEntityDataChange?: () => void;
}
