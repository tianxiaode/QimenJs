import { ItemGroupBaseComponent } from './ItemGroupBaseComponent';
import { Definitions } from '@/composable';

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

interface AuxPool {
    items: any[];
    hiddenItems: any[];
    itemType: string;
    offset: number;
}

const ItemGroupPooledComponentDefs: Definitions = {
    options: {
        groupRowType: null,
        expandRowType: null,
        groupSummaryType: null,
        tableSummaryType: null,
        groupItems: null,
        expandItems: null,
        groupSummaryItems: null,
        tableSummaryItems: null,
    },
    fields: {
        _hiddenItems: [],
        _auxPools: undefined,
    },
} as const;

class ItemGroupPooledComponent extends ItemGroupBaseComponent {
    get poolSize(): number {
        return this._hiddenItems.length;
    }

    onAfterInit(): void {
        super.onAfterInit();
        this._auxPools = new Map();
        this._initAuxPools();
    }

    _initAuxPools(): void {
        if (this.getData('groupRowType')) {
            this.registerAuxPool(AUX_ROLE_GROUP, {
                itemType: this.getData('groupRowType'),
                offset: ROLE_OFFSETS[AUX_ROLE_GROUP],
            });
        }
        if (this.getData('expandRowType')) {
            this.registerAuxPool(AUX_ROLE_EXPAND, {
                itemType: this.getData('expandRowType'),
                offset: ROLE_OFFSETS[AUX_ROLE_EXPAND],
            });
        }
        if (this.getData('groupSummaryType')) {
            this.registerAuxPool(AUX_ROLE_GROUP_SUMMARY, {
                itemType: this.getData('groupSummaryType'),
                offset: ROLE_OFFSETS[AUX_ROLE_GROUP_SUMMARY],
            });
        }
        if (this.getData('tableSummaryType')) {
            this.registerAuxPool(AUX_ROLE_TABLE_SUMMARY, {
                itemType: this.getData('tableSummaryType'),
                offset: ROLE_OFFSETS[AUX_ROLE_TABLE_SUMMARY],
            });
        }

        if (this.getData('groupItems')) this.setAuxItems(AUX_ROLE_GROUP, this.getData('groupItems'));
        if (this.getData('expandItems')) this.setAuxItems(AUX_ROLE_EXPAND, this.getData('expandItems'));
        if (this.getData('groupSummaryItems'))
            this.setAuxItems(AUX_ROLE_GROUP_SUMMARY, this.getData('groupSummaryItems'));
        if (this.getData('tableSummaryItems'))
            this.setAuxItems(AUX_ROLE_TABLE_SUMMARY, this.getData('tableSummaryItems'));
    }

    setItems(datas: Record<string, any>[]): void {
        const items = this.items;
        const newLength = datas.length;
        const currentLength = Array.isArray(items) ? items.length : 0;

        for (let i = 0; i < Math.min(currentLength, newLength); i++) {
            const component = items[i];
            if (typeof component.update === 'function') {
                component.update(datas[i]);
            } else {
                this.logger.warn(
                    `item "${component.name || component.type || i}" missing update(), pooled data change will not reflect`
                );
            }
            component.el.hidden = false;
        }

        for (let i = currentLength; i < newLength; i++) {
            const reused = this._reuseFromPool(datas[i]);
            if (reused) {
                items.push(reused);
                this._emitItemAdd(i, reused);
            } else {
                const component = this._createItem(datas[i]);
                if (component) {
                    items.push(component);
                    this._emitItemAdd(i, component);
                }
            }
        }

        for (let i = newLength; i < currentLength; i++) {
            const component = items[i];
            component.el.hidden = true;
            this._hiddenItems.push(component);
            this._emitItemRemove(i, component);
        }
        items.length = newLength;

        this._applyOrders();
        this._emitItemsChange('set', { count: newLength });
    }

    add(data: Record<string, any>): any {
        const items = this.items;
        const reused = this._reuseFromPool(data);
        if (reused) {
            items.push(reused);
            this._applyOrders();
            this._emitItemAdd(items.length - 1, reused);
            return reused;
        }

        const component = this._createItem(data);
        if (component) {
            items.push(component);
            this._applyOrders();
            this._emitItemAdd(items.length - 1, component);
            return component;
        }
        return null;
    }

    insert(index: number, data: Record<string, any>): any {
        const items = this.items;
        const clampedIndex = Math.min(Math.max(0, index), items.length);

        const reused = this._reuseFromPool(data);
        if (reused) {
            items.splice(clampedIndex, 0, reused);
            this._applyOrders();
            this._emitItemAdd(clampedIndex, reused);
            return reused;
        }

        const component = this._createItem(data);
        if (component) {
            items.splice(clampedIndex, 0, component);
            this._applyOrders();
            this._emitItemAdd(clampedIndex, component);
            return component;
        }
        return null;
    }

    removeAt(index: number): any {
        const items = this.items;
        if (index < 0 || index >= items.length) return undefined;
        const [component] = items.splice(index, 1);
        component.el.hidden = true;
        this._hiddenItems.push(component);
        this._applyOrders();
        this._emitItemRemove(index, component);
        return component;
    }

    clear(): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
                const component = items[i];
                component.el.hidden = true;
                this._hiddenItems.push(component);
                this._emitItemRemove(i, component);
            }
            items.length = 0;
        }
        for (const pool of this._auxPools.values()) {
            for (const component of pool.items) {
                component.el.hidden = true;
                pool.hiddenItems.push(component);
            }
            pool.items = [];
        }
        this.itemContainer?.el && (this.itemContainer.el.innerHTML = '');
        this._emitItemsChange('clear');
    }

    _reuseFromPool(data: Record<string, any>): any {
        const dataType = data.type ?? this._defaultItemType;
        if (!dataType) return null;
        for (let i = 0; i < this._hiddenItems.length; i++) {
            const component = this._hiddenItems[i];
            const itemType = component?.type ?? component?.constructor?.type;
            if (itemType === dataType) {
                this._hiddenItems.splice(i, 1);
                if (typeof component.update === 'function') {
                    component.update(data);
                }
                component.el.hidden = false;
                return component;
            }
        }
        return null;
    }

    trimPool(maxSize: number = 10): void {
        while (this._hiddenItems.length > maxSize) {
            const component = this._hiddenItems.pop();
            if (component) this._destroyItem(component);
        }
    }

    registerAuxPool(role: string, config: AuxPoolConfig): void {
        this._auxPools.set(role, {
            items: [],
            hiddenItems: [],
            itemType: config.itemType,
            offset: config.offset,
        });
    }

    unregisterAuxPool(role: string): void {
        const pool = this._auxPools.get(role);
        if (!pool) return;
        for (const component of pool.items) this._destroyItem(component);
        for (const component of pool.hiddenItems) this._destroyItem(component);
        this._auxPools.delete(role);
    }

    setAuxItems(role: string, datas: Record<string, any>[]): void {
        const pool = this._auxPools.get(role);
        if (!pool) return;

        const newLength = datas.length;
        const currentLength = pool.items.length;

        for (let i = 0; i < Math.min(currentLength, newLength); i++) {
            const component = pool.items[i];
            if (typeof component.update === 'function') {
                component.update(datas[i]);
            }
            component.el.hidden = false;
        }

        for (let i = currentLength; i < newLength; i++) {
            const reused = this._reuseFromAuxPool(role, datas[i]);
            if (reused) {
                pool.items.push(reused);
            } else {
                const component = this._createItem(datas[i]);
                if (component) {
                    pool.items.push(component);
                }
            }
        }

        for (let i = newLength; i < currentLength; i++) {
            const component = pool.items[i];
            component.el.hidden = true;
            pool.hiddenItems.push(component);
        }
        pool.items.length = newLength;

        this._applyOrders();
    }

    addAuxItem(role: string, data: Record<string, any>): any {
        const pool = this._auxPools.get(role);
        if (!pool) return null;

        const reused = this._reuseFromAuxPool(role, data);
        if (reused) {
            pool.items.push(reused);
            this._applyOrders();
            return reused;
        }

        const component = this._createItem(data);
        if (component) {
            pool.items.push(component);
            this._applyOrders();
            return component;
        }
        return null;
    }

    removeAuxItemAt(role: string, index: number): any {
        const pool = this._auxPools.get(role);
        if (!pool) return undefined;
        if (index < 0 || index >= pool.items.length) return undefined;

        const [component] = pool.items.splice(index, 1);
        component.el.hidden = true;
        pool.hiddenItems.push(component);
        this._applyOrders();
        return component;
    }

    clearAuxPool(role: string): void {
        const pool = this._auxPools.get(role);
        if (!pool) return;

        for (const component of pool.items) {
            component.el.hidden = true;
            pool.hiddenItems.push(component);
        }
        pool.items = [];
        this._applyOrders();
    }

    getAuxItems(role: string): readonly any[] {
        const pool = this._auxPools.get(role);
        if (!pool) return [];
        return pool.items;
    }

    getAuxCount(role: string): number {
        const pool = this._auxPools.get(role);
        return pool ? pool.items.length : 0;
    }

    trimAuxPool(role: string, maxSize: number = 10): void {
        const pool = this._auxPools.get(role);
        if (!pool) return;
        while (pool.hiddenItems.length > maxSize) {
            const component = pool.hiddenItems.pop();
            if (component) this._destroyItem(component);
        }
    },

    _reuseFromAuxPool(role: string, data: Record<string, any>): any {
        const pool = this._auxPools.get(role);
        if (!pool) return null;

        const dataType = data.type ?? pool.itemType;
        if (!dataType) return null;

        for (let i = 0; i < pool.hiddenItems.length; i++) {
            const component = pool.hiddenItems[i];
            const itemType = component?.type ?? component?.constructor?.type;
            if (itemType === dataType) {
                pool.hiddenItems.splice(i, 1);
                if (typeof component.update === 'function') {
                    component.update(data);
                }
                component.el.hidden = false;
                return component;
            }
        }
        return null;
    }
    }

    _reuseFromAuxPool(role: string, data: Record<string, any>): any {
        const pool = this._auxPools.get(role);
        if (!pool) return null;

        const dataType = data.type ?? pool.itemType;
        if (!dataType) return null;

        for (let i = 0; i < pool.hiddenItems.length; i++) {
            const component = pool.hiddenItems[i];
            const itemType = component?.type ?? component?.constructor?.type;
            if (itemType === dataType) {
                pool.hiddenItems.splice(i, 1);
                pool.hiddenItemData.splice(i, 1);
                if (typeof component.update === 'function') {
                    component.update(data);
                }
                component.el.hidden = false;
                return component;
            }
        }
        return null;
    }

    setGroupRows(datas: any[]): void {
        this.setAuxItems(AUX_ROLE_GROUP, datas);
    }
    setExpandRows(datas: any[]): void {
        this.setAuxItems(AUX_ROLE_EXPAND, datas);
    }
    setGroupSummaries(datas: any[]): void {
        this.setAuxItems(AUX_ROLE_GROUP_SUMMARY, datas);
    }
    setTableSummaries(datas: any[]): void {
        this.setAuxItems(AUX_ROLE_TABLE_SUMMARY, datas);
    }

    _applyOrders(): void {
        const container = this.itemContainer?.el;
        if (!container) return;

        container.style.display = 'flex';
        container.style.flexDirection = this._direction === 'horizontal' ? 'row' : 'column';

        const step = this._step;
        const items = this.items;
        if (!Array.isArray(items)) return;

        for (let i = 0; i < items.length; i++) {
            const customOrder = items[i]?.order;
            items[i].el.style.order =
                customOrder !== undefined ? String(customOrder) : String((i + 1) * step);
        }

        for (const pool of this._auxPools.values()) {
            for (let i = 0; i < pool.items.length; i++) {
                const component = pool.items[i];
                const orderIndex = component?.orderIndex ?? 0;
                component.el.style.order = String(Math.floor(orderIndex * step + step * pool.offset));
            }
        }
    }

    getTargetItem(target: Element): { component: any; type: string; index: number } | null {
        const base = super.getTargetItem(target);
        if (base) return base;

        for (const pool of this._auxPools.values()) {
            for (let i = 0; i < pool.items.length; i++) {
                const component = pool.items[i];
                if (component.containsElement('', target) || component.el.contains(target)) {
                    const type = component.constructor?._type || component.type || '';
                    return { component, type, index: i };
                }
            }
        }
        return null;
    }
}

ItemGroupPooledComponent.define(ItemGroupPooledComponentDefs);

export { ItemGroupPooledComponent };
export type ItemGroupPooledComponentType = InstanceType<typeof ItemGroupPooledComponent>;
