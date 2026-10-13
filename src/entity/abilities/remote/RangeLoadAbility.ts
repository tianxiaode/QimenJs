import type { AbilityDefinition } from '@/composable';
import { ENTITY_LIST_EVENTS } from '@/events';
import { ENTITY_ACTION } from '../../types/constants';

export interface RangeLoadedData {
    start: number;
    end: number;
    total: number;
    items: (any | null)[];
}

export const RangeLoadAbility = {
    _ensureRangeCache(): Map<number, any> {
        if (!this._rangeCache) {
            this._rangeCache = new Map();
        }
        return this._rangeCache;
    },

    async loadRange(start: number, end: number): Promise<void> {
        const cache = this._ensureRangeCache();
        const missing: number[] = [];
        for (let i = start; i < end; i++) {
            if (!cache.has(i)) {
                missing.push(i);
            }
        }

        if (missing.length === 0) {
            this._emitRangeLoaded(start, end);
            return;
        }

        const loadStart = missing[0];
        const loadEnd = missing[missing.length - 1] + 1;

        const mockData = this.getData('mockData');
        if (Array.isArray(mockData)) {
            this._rangeTotal = mockData.length;
            for (let i = loadStart; i < loadEnd; i++) {
                if (i < mockData.length) {
                    cache.set(i, mockData[i]);
                }
            }
        } else {
            const params = { offset: loadStart, limit: loadEnd - loadStart };
            const options = await this.buildOptions(ENTITY_ACTION.RANGE_LOAD, params, null, {});
            const context = await this.fetch(ENTITY_ACTION.RANGE_LOAD, options);
            const { list, total } = context.data;
            this._rangeTotal = typeof total === 'number' ? total : this._rangeTotal;
            for (let i = 0; i < list.length; i++) {
                cache.set(loadStart + i, list[i]);
            }
        }

        this._emitRangeLoaded(start, end);
    },

    _emitRangeLoaded(start: number, end: number): void {
        const cache = this._ensureRangeCache();
        const items: (any | null)[] = [];
        for (let i = start; i < end; i++) {
            items.push(cache.get(i) ?? null);
        }
        const data: RangeLoadedData = {
            start,
            end,
            total: this._rangeTotal ?? 0,
            items,
        };
        this.emitEvent(ENTITY_LIST_EVENTS.RANGE_LOADED, data);
    },

    getRangeItem(index: number): any {
        const cache = this._ensureRangeCache();
        return cache.get(index) ?? null;
    },

    isRangeLoaded(start: number, end: number): boolean {
        const cache = this._ensureRangeCache();
        for (let i = start; i < end; i++) {
            if (!cache.has(i)) return false;
        }
        return true;
    },

    clearRangeCache(): void {
        if (this._rangeCache) {
            this._rangeCache.clear();
        }
        this._rangeTotal = 0;
    },
} satisfies AbilityDefinition;
