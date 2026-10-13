import type { RangeLoadedData } from '@/entity/abilities/remote/RangeLoadAbility';

export interface EntityDataHost {
    getData(key: string): any;
    setData(key: string, value: any, raw?: boolean): void;
    entityEmit(event: string, data?: any, opts?: Record<string, any>): void;
    entityOn(entityKey: string, eventName: string, handler: (data: any) => void): () => void;
    onCleanup(cb: () => void): void;
    _entityItems: any[];
    _entityTotal: number;
    _disconnectEntity: () => void;
    onEntityListed: (items: any[]) => void;
    onEntityRangeLoaded?: (data: RangeLoadedData) => void;
    _onEntityDataChange?: () => void;
}
