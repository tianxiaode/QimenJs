// ============================================
// ItemGroupPooledComponent.ts - 池化
// 数据驱动，CSS order 控制位置，支持辅助池
// ============================================

import { ItemGroupBaseComponent } from './ItemGroupBaseComponent';
import type { TplEventAction } from '@qimenjs/component-core';
import { Logger } from '@qimenjs/logger';

const logger = Logger.for('ItemGroupPooled');

export const AUX_ROLE_GROUP = 'group';
export const AUX_ROLE_EXPAND = 'expand';
export const AUX_ROLE_GROUP_SUMMARY = 'groupSummary';
export const AUX_ROLE_TABLE_SUMMARY = 'tableSummary';

const ROLE_OFFSETS: Record<string, number> = {
    [AUX_ROLE_GROUP]: 0.25,
    [AUX_ROLE_EXPAND]: 0.5,
    [AUX_ROLE_GROUP_SUMMARY]: 0.75,
    [AUX_ROLE_TABLE_SUMMARY]: 0.9,
};

export interface AuxPoolConfig {
    itemType: string;
    offset: number;
}

interface AuxPoolEntry {
    data: Record<string, any>;
    component: any;
    el: HTMLElement;
}

interface AuxPool {
    items: AuxPoolEntry[];
    hiddenItems: AuxPoolEntry[];
    itemType: string;
    offset: number;
}

export let ItemGroupPooledComponent = ItemGroupBaseComponent.replace({
    type: 'ItemGroupPooled',

    onInitState() {
        return {
            _hiddenItems: [] as Array<{
                data: Record<string, any>;
                component: any;
                el: HTMLElement;
                events?: Record<string, TplEventAction>;
            }>,
            _auxPools: new Map<string, AuxPool>(),
        };
    },

    // ========== 属性 ==========
    get poolSize(): number {
        return this._hiddenItems.length;
    },

    onAfterInit(props?: any): void {
        this._initItemGroupComponent(props);

        if (props?.groupRowType) {
            this.registerAuxPool(AUX_ROLE_GROUP, {
                itemType: props.groupRowType,
                offset: ROLE_OFFSETS[AUX_ROLE_GROUP],
            });
        }
        if (props?.expandRowType) {
            this.registerAuxPool(AUX_ROLE_EXPAND, {
                itemType: props.expandRowType,
                offset: ROLE_OFFSETS[AUX_ROLE_EXPAND],
            });
        }
        if (props?.groupSummaryType) {
            this.registerAuxPool(AUX_ROLE_GROUP_SUMMARY, {
                itemType: props.groupSummaryType,
                offset: ROLE_OFFSETS[AUX_ROLE_GROUP_SUMMARY],
            });
        }
        if (props?.tableSummaryType) {
            this.registerAuxPool(AUX_ROLE_TABLE_SUMMARY, {
                itemType: props.tableSummaryType,
                offset: ROLE_OFFSETS[AUX_ROLE_TABLE_SUMMARY],
            });
        }

        if (props?.groupItems) this.setAuxItems(AUX_ROLE_GROUP, props.groupItems);
        if (props?.expandItems) this.setAuxItems(AUX_ROLE_EXPAND, props.expandItems);
        if (props?.groupSummaryItems)
            this.setAuxItems(AUX_ROLE_GROUP_SUMMARY, props.groupSummaryItems);
        if (props?.tableSummaryItems)
            this.setAuxItems(AUX_ROLE_TABLE_SUMMARY, props.tableSummaryItems);
    },

    // ========== 业务方法 ==========
    setItems(datas: Record<string, any>[]): void {
        const newLength = datas.length;
        const currentLength = this._items.length;

        for (let i = 0; i < Math.min(currentLength, newLength); i++) {
            const item = this._items[i];
            item.data = datas[i];
            if (typeof item.component.update === 'function') {
                item.component.update(datas[i]);
            } else {
                logger.warn(
                    `item "${item.component.name || item.component.type || i}" missing update(), pooled data change will not reflect`
                );
            }
            item.el.hidden = false;
        }

        for (let i = currentLength; i < newLength; i++) {
            const reused = this._reuseFromPool(datas[i]);
            if (reused) {
                this._items.push(reused);
            } else {
                const item = this._createItem(datas[i]);
                if (item) this._items.push(item);
            }
        }

        for (let i = newLength; i < currentLength; i++) {
            const item = this._items[i];
            item.el.hidden = true;
            this._hiddenItems.push(item);
        }
        this._items.length = newLength;

        this._applyOrders();
    },

    add(data: Record<string, any>): any {
        const reused = this._reuseFromPool(data);
        if (reused) {
            this._items.push(reused);
            this._applyOrders();
            return reused.component;
        }

        const item = this._createItem(data);
        if (item) {
            this._items.push(item);
            this._applyOrders();
            return item.component;
        }
        return null;
    },

    insert(index: number, data: Record<string, any>): any {
        const clampedIndex = Math.min(Math.max(0, index), this._items.length);

        const reused = this._reuseFromPool(data);
        if (reused) {
            this._items.splice(clampedIndex, 0, reused);
            this._applyOrders();
            return reused.component;
        }

        const item = this._createItem(data);
        if (item) {
            this._items.splice(clampedIndex, 0, item);
            this._applyOrders();
            return item.component;
        }
        return null;
    },

    removeAt(index: number): any {
        if (index < 0 || index >= this._items.length) return undefined;
        const [item] = this._items.splice(index, 1);
        item.el.hidden = true;
        this._hiddenItems.push(item);
        this._applyOrders();
        return item.component;
    },

    clear(): void {
        for (const item of this._items) {
            item.el.hidden = true;
            this._hiddenItems.push(item);
        }
        this._items = [];
        for (const pool of this._auxPools.values()) {
            for (const item of pool.items) {
                item.el.hidden = true;
                pool.hiddenItems.push(item);
            }
            pool.items = [];
        }
        this.itemContainer.el.innerHTML = '';
    },

    // ========== 池化管理 ==========
    _reuseFromPool(data: Record<string, any>): any {
        const dataType = data.type ?? this._defaultItemType;
        if (!dataType) return null;
        for (let i = 0; i < this._hiddenItems.length; i++) {
            const item = this._hiddenItems[i];
            const itemType = item.component?.type ?? item.component?.constructor?.type;
            if (itemType === dataType) {
                this._hiddenItems.splice(i, 1);
                item.data = data;
                if (typeof item.component.update === 'function') {
                    item.component.update(data);
                }
                item.el.hidden = false;
                return item;
            }
        }
        return null;
    },

    trimPool(maxSize: number = 10): void {
        while (this._hiddenItems.length > maxSize) {
            const item = this._hiddenItems.pop();
            if (item) this._destroyItem(item);
        }
    },

    // ========== 辅助池 ==========

    registerAuxPool(role: string, config: AuxPoolConfig): void {
        this._auxPools.set(role, {
            items: [],
            hiddenItems: [],
            itemType: config.itemType,
            offset: config.offset,
        });
    },

    unregisterAuxPool(role: string): void {
        const pool = this._auxPools.get(role);
        if (!pool) return;
        for (const item of pool.items) this._destroyItem(item);
        for (const item of pool.hiddenItems) this._destroyItem(item);
        this._auxPools.delete(role);
    },

    setAuxItems(role: string, datas: Record<string, any>[]): void {
        const pool = this._auxPools.get(role);
        if (!pool) return;

        const newLength = datas.length;
        const currentLength = pool.items.length;

        for (let i = 0; i < Math.min(currentLength, newLength); i++) {
            const item = pool.items[i];
            item.data = datas[i];
            if (typeof item.component.update === 'function') {
                item.component.update(datas[i]);
            }
            item.el.hidden = false;
        }

        for (let i = currentLength; i < newLength; i++) {
            const reused = this._reuseFromAuxPool(role, datas[i]);
            if (reused) {
                pool.items.push(reused);
            } else {
                const item = this._createItem(datas[i]);
                if (item) pool.items.push(item);
            }
        }

        for (let i = newLength; i < currentLength; i++) {
            const item = pool.items[i];
            item.el.hidden = true;
            pool.hiddenItems.push(item);
        }
        pool.items.length = newLength;

        this._applyOrders();
    },

    addAuxItem(role: string, data: Record<string, any>): any {
        const pool = this._auxPools.get(role);
        if (!pool) return null;

        const reused = this._reuseFromAuxPool(role, data);
        if (reused) {
            pool.items.push(reused);
            this._applyOrders();
            return reused.component;
        }

        const item = this._createItem(data);
        if (item) {
            pool.items.push(item);
            this._applyOrders();
            return item.component;
        }
        return null;
    },

    removeAuxItemAt(role: string, index: number): any {
        const pool = this._auxPools.get(role);
        if (!pool) return undefined;
        if (index < 0 || index >= pool.items.length) return undefined;

        const [item] = pool.items.splice(index, 1);
        item.el.hidden = true;
        pool.hiddenItems.push(item);
        this._applyOrders();
        return item.component;
    },

    clearAuxPool(role: string): void {
        const pool = this._auxPools.get(role);
        if (!pool) return;

        for (const item of pool.items) {
            item.el.hidden = true;
            pool.hiddenItems.push(item);
        }
        pool.items = [];
        this._applyOrders();
    },

    getAuxItems(role: string): readonly any[] {
        const pool = this._auxPools.get(role);
        if (!pool) return [];
        return pool.items.map((item: any) => item.component);
    },

    getAuxCount(role: string): number {
        const pool = this._auxPools.get(role);
        return pool ? pool.items.length : 0;
    },

    trimAuxPool(role: string, maxSize: number = 10): void {
        const pool = this._auxPools.get(role);
        if (!pool) return;
        while (pool.hiddenItems.length > maxSize) {
            const item = pool.hiddenItems.pop();
            if (item) this._destroyItem(item);
        }
    },

    _reuseFromAuxPool(role: string, data: Record<string, any>): any {
        const pool = this._auxPools.get(role);
        if (!pool) return null;

        const dataType = data.type ?? pool.itemType;
        if (!dataType) return null;

        for (let i = 0; i < pool.hiddenItems.length; i++) {
            const item = pool.hiddenItems[i];
            const itemType = item.component?.type ?? item.component?.constructor?.type;
            if (itemType === dataType) {
                pool.hiddenItems.splice(i, 1);
                item.data = data;
                if (typeof item.component.update === 'function') {
                    item.component.update(data);
                }
                item.el.hidden = false;
                return item;
            }
        }
        return null;
    },

    // ========== 表格角色便捷方法 ==========

    setGroupRows(datas: any[]): void {
        this.setAuxItems(AUX_ROLE_GROUP, datas);
    },
    setExpandRows(datas: any[]): void {
        this.setAuxItems(AUX_ROLE_EXPAND, datas);
    },
    setGroupSummaries(datas: any[]): void {
        this.setAuxItems(AUX_ROLE_GROUP_SUMMARY, datas);
    },
    setTableSummaries(datas: any[]): void {
        this.setAuxItems(AUX_ROLE_TABLE_SUMMARY, datas);
    },

    // ========== Order 布局 ==========

    _applyOrders(): void {
        const container = this.itemContainer.el;
        if (!container) return;

        container.style.display = 'flex';
        container.style.flexDirection = this._direction === 'horizontal' ? 'row' : 'column';

        const step = this._step;

        for (let i = 0; i < this._items.length; i++) {
            this._items[i].el.style.order = String((i + 1) * step);
        }

        for (const pool of this._auxPools.values()) {
            for (const item of pool.items) {
                const orderIndex = item.data.orderIndex ?? 0;
                item.el.style.order = String(Math.floor(orderIndex * step + step * pool.offset));
            }
        }
    },

    // ========== 事件 ==========

    getTargetItem(target: Element): { component: any; type: string; index: number } | null {
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            if (item.component.containsElement('', target) || item.el.contains(target)) {
                const type = item.component.constructor?._type || item.component.type || '';
                return { component: item.component, type, index: i };
            }
        }
        for (const pool of this._auxPools.values()) {
            for (let i = 0; i < pool.items.length; i++) {
                const item = pool.items[i];
                if (item.component.containsElement('', target) || item.el.contains(target)) {
                    const type = item.component.constructor?._type || item.component.type || '';
                    return { component: item.component, type, index: i };
                }
            }
        }
        return null;
    },
});

export type ItemGroupPooledComponentType = InstanceType<typeof ItemGroupPooledComponent>;
