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
        virtualScroll: false,
        itemHeight: 0,
        virtualBuffer: 5,
    },
    fields: {
        _hiddenItems: [],
        _auxPools: undefined,
        _virtualData: [],
        _visibleRange: { start: 0, end: 0 },
        _virtualItemMap: undefined,
        _scrollUnbind: null,
        _scrollOff: null,
        _rafId: 0,
        _resizeObserver: null,
        _topSpacerEl: null,
        _bottomSpacerEl: null,
    },
} as const;

class ItemGroupPooledComponent extends ItemGroupBaseComponent {
    get poolSize(): number {
        return this._hiddenItems.length;
    }

    onAfterInit(): void {
        super.onAfterInit();
        this._hiddenItems = [];
        this._auxPools = new Map();
        this._initAuxPools();
        if (this.getData('virtualScroll') && !this._scrollUnbind) {
            this._setupVirtualScroll();
        }
    }

    get count(): number {
        if (this.getData('virtualScroll')) {
            return this._virtualData.length;
        }
        return (this.items || []).length;
    }

    _onVirtualScrollOptionChange(value: boolean): void {
        if (value) {
            if (this.el && this.getNodeEl('itemContainer')) {
                this._setupVirtualScroll();
            }
        } else {
            this._teardownVirtualScroll();
        }
    }

    _onItemHeightOptionChange(_value: number): void {
        if (this.getData('virtualScroll') && this._scrollUnbind) {
            this._renderVirtualItems();
        }
    }

    _getScrollContainer(): HTMLElement | undefined {
        return this.el;
    }

    _getVirtualItemHeight(): number {
        const itemHeight = this.getData('itemHeight');
        if (itemHeight && itemHeight > 0) return itemHeight;
        const items = this.items;
        if (Array.isArray(items) && items.length > 0) {
            const el = items[0]?.el;
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.height > 0) return rect.height;
            }
        }
        return 36;
    }

    _setupVirtualScroll(): void {
        const scrollContainer = this._getScrollContainer();
        if (!scrollContainer) return;

        this._virtualItemMap = new Map();

        const itemContainer = this.getNodeEl('itemContainer');
        if (itemContainer && itemContainer.parentNode) {
            this._topSpacerEl = document.createElement('div');
            this._topSpacerEl.className = 'q-virtual-spacer q-virtual-spacer--top';
            this._topSpacerEl.style.height = '0px';

            this._bottomSpacerEl = document.createElement('div');
            this._bottomSpacerEl.className = 'q-virtual-spacer q-virtual-spacer--bottom';
            this._bottomSpacerEl.style.height = '0px';

            itemContainer.parentNode.insertBefore(this._topSpacerEl, itemContainer);
            if (itemContainer.nextSibling) {
                itemContainer.parentNode.insertBefore(this._bottomSpacerEl, itemContainer.nextSibling);
            } else {
                itemContainer.parentNode.appendChild(this._bottomSpacerEl);
            }
        }

        this._scrollUnbind = this.bind(scrollContainer, 'scroll');
        this._scrollOff = this.on('dom:scroll', () => this._onVirtualScroll());

        this._resizeObserver = new ResizeObserver(() => this._onVirtualScroll());
        this._resizeObserver.observe(scrollContainer);

        this.onCleanup(() => this._teardownVirtualScroll());

        if (this._virtualData.length > 0) {
            this._renderVirtualItems();
        }
    }

    _teardownVirtualScroll(): void {
        if (this._scrollUnbind) {
            this._scrollUnbind();
            this._scrollUnbind = null;
        }
        if (this._scrollOff) {
            this._scrollOff();
            this._scrollOff = null;
        }
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = 0;
        }
        this._topSpacerEl?.remove();
        this._bottomSpacerEl?.remove();
        this._topSpacerEl = null;
        this._bottomSpacerEl = null;

        if (this._virtualData.length > 0) {
            const fullData = this._virtualData;
            this._virtualData = [];
            this._virtualItemMap?.clear();
            this._visibleRange = { start: 0, end: 0 };
            super.setItems(fullData);
        }
    }

    _onVirtualScroll(): void {
        if (this._rafId) cancelAnimationFrame(this._rafId);
        this._rafId = requestAnimationFrame(() => {
            this._rafId = 0;
            this._renderVirtualItems();
        });
    }

    _computeVisibleRange(): { start: number; end: number } {
        const scrollContainer = this._getScrollContainer();
        if (!scrollContainer) return { start: 0, end: 0 };

        const itemHeight = this._getVirtualItemHeight();
        const scrollTop = scrollContainer.scrollTop;
        const clientHeight = scrollContainer.clientHeight;
        const buffer = this.getData('virtualBuffer') ?? 5;
        const total = this._virtualData.length;

        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
        const end = Math.min(total, Math.ceil((scrollTop + clientHeight) / itemHeight) + buffer);

        return { start, end };
    }

    _renderVirtualItems(): void {
        const data = this._virtualData;
        if (data.length === 0) {
            const items = this.items;
            if (Array.isArray(items)) {
                for (const item of items) {
                    item.hidden = true;
                    this._hiddenItems.push(item);
                }
                items.length = 0;
            }
            this._virtualItemMap?.clear();
            this._updateSpacers(0, 0, 0);
            return;
        }

        const { start, end } = this._computeVisibleRange();
        this._visibleRange = { start, end };

        this._updateSpacers(start, end, data.length);

        const oldMap = this._virtualItemMap ?? new Map();
        const newMap = new Map<number, any>();
        const newItems: any[] = [];

        for (let i = start; i < end; i++) {
            const existing = oldMap.get(i);
            if (existing) {
                if (typeof existing.update === 'function') {
                    existing.update(data[i]);
                }
                existing.hidden = false;
                existing._virtualIndex = i;
                newMap.set(i, existing);
                newItems.push(existing);
            } else {
                const reused = this._reuseFromPool(data[i]);
                if (reused) {
                    reused._virtualIndex = i;
                    newMap.set(i, reused);
                    newItems.push(reused);
                } else {
                    const component = this._createItem(data[i]);
                    if (component) {
                        component._virtualIndex = i;
                        newMap.set(i, component);
                        newItems.push(component);
                    }
                }
            }
        }

        for (const [vi, item] of oldMap) {
            if (vi < start || vi >= end) {
                item.hidden = true;
                this._hiddenItems.push(item);
            }
        }

        this.items = newItems;
        this._virtualItemMap = newMap;

        this._applyVirtualOrders();

        this._emitItemsChange('set', { count: data.length });
    }

    _updateSpacers(start: number, end: number, total: number): void {
        const itemHeight = this._getVirtualItemHeight();
        if (this._topSpacerEl) {
            this._topSpacerEl.style.height = `${start * itemHeight}px`;
        }
        if (this._bottomSpacerEl) {
            this._bottomSpacerEl.style.height = `${Math.max(0, total - end) * itemHeight}px`;
        }
    }

    _applyVirtualOrders(): void {
        const step = this.step;
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (let i = 0; i < items.length; i++) {
            const component = items[i];
            if (!component?.el) continue;
            const vi = component._virtualIndex ?? i;
            component.order = (vi + 1) * step;
        }
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

        if (this.getData('groupItems'))
            this.setAuxItems(AUX_ROLE_GROUP, this.getData('groupItems'));
        if (this.getData('expandItems'))
            this.setAuxItems(AUX_ROLE_EXPAND, this.getData('expandItems'));
        if (this.getData('groupSummaryItems'))
            this.setAuxItems(AUX_ROLE_GROUP_SUMMARY, this.getData('groupSummaryItems'));
        if (this.getData('tableSummaryItems'))
            this.setAuxItems(AUX_ROLE_TABLE_SUMMARY, this.getData('tableSummaryItems'));
    }

    setItems(datas: Record<string, any>[]): void {
        if (this.getData('virtualScroll')) {
            this._virtualData = datas;
            if (this._scrollUnbind) {
                this._renderVirtualItems();
            }
            return;
        }

        const items = this.items;
        const newLength = datas.length;
        const currentLength = Array.isArray(items) ? items.length : 0;

        for (let i = 0; i < Math.min(currentLength, newLength); i++) {
            const component = items[i];
            const expectedType = datas[i].type ?? this.defaultItemType;
            const actualType = component?.type ?? component?.constructor?.type;

            if (expectedType !== actualType) {
                component.hidden = true;
                this._hiddenItems.push(component);
                const reused = this._reuseFromPool(datas[i]);
                if (reused) {
                    items[i] = reused;
                    this._emitItemRemove(i, component);
                    this._emitItemAdd(i, reused);
                } else {
                    const newComponent = this._createItem(datas[i]);
                    if (newComponent) {
                        items[i] = newComponent;
                        this._emitItemRemove(i, component);
                        this._emitItemAdd(i, newComponent);
                    }
                }
            } else {
                if (typeof component.update === 'function') {
                    component.update(datas[i]);
                }
                component.hidden = false;
            }
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
            component.hidden = true;
            this._hiddenItems.push(component);
            this._emitItemRemove(i, component);
        }
        items.length = newLength;

        this._applyOrders();
        this._emitItemsChange('set', { count: newLength });
    }

    add(data: Record<string, any>): any {
        if (this.getData('virtualScroll')) {
            this._virtualData.push(data);
            if (this._scrollUnbind) this._renderVirtualItems();
            return this._virtualItemMap?.get(this._virtualData.length - 1) ?? null;
        }

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
        if (this.getData('virtualScroll')) {
            const clampedIndex = Math.min(Math.max(0, index), this._virtualData.length);
            this._virtualData.splice(clampedIndex, 0, data);
            if (this._scrollUnbind) this._renderVirtualItems();
            return this._virtualItemMap?.get(clampedIndex) ?? null;
        }

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
        if (this.getData('virtualScroll')) {
            if (index < 0 || index >= this._virtualData.length) return undefined;
            const [removed] = this._virtualData.splice(index, 1);
            const component = this._virtualItemMap?.get(index);
            if (component) {
                component.hidden = true;
                this._hiddenItems.push(component);
            }
            if (this._scrollUnbind) this._renderVirtualItems();
            return removed;
        }

        const items = this.items;
        if (index < 0 || index >= items.length) return undefined;
        const [component] = items.splice(index, 1);
        component.hidden = true;
        this._hiddenItems.push(component);
        this._applyOrders();
        this._emitItemRemove(index, component);
        return component;
    }

    clear(): void {
        if (this.getData('virtualScroll')) {
            this._virtualData = [];
            this._virtualItemMap?.clear();
            this._visibleRange = { start: 0, end: 0 };
            const items = this.items;
            if (Array.isArray(items)) {
                for (const item of items) {
                    item.hidden = true;
                    this._hiddenItems.push(item);
                }
                items.length = 0;
            }
            this._updateSpacers(0, 0, 0);
            this._emitItemsChange('clear');
            return;
        }

        const items = this.items;
        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
                const component = items[i];
                component.hidden = true;
                this._hiddenItems.push(component);
                this._emitItemRemove(i, component);
            }
            items.length = 0;
        }
        for (const pool of this._auxPools.values()) {
            for (const component of pool.items) {
                component.hidden = true;
                pool.hiddenItems.push(component);
            }
            pool.items = [];
        }
        const container = this.getNodeEl('itemContainer');
        if (container) container.innerHTML = '';
        this._emitItemsChange('clear');
    }

    _reuseFromPool(data: Record<string, any>): any {
        const dataType = data.type ?? this.defaultItemType;
        if (!dataType) return null;
        for (let i = 0; i < this._hiddenItems.length; i++) {
            const component = this._hiddenItems[i];
            const itemType = component?.type ?? component?.constructor?.type;
            if (itemType === dataType) {
                this._hiddenItems.splice(i, 1);
                if (typeof component.update === 'function') {
                    component.update(data);
                }
                component.hidden = false;
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
            component.hidden = false;
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
            component.hidden = true;
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
        component.hidden = true;
        pool.hiddenItems.push(component);
        this._applyOrders();
        return component;
    }

    clearAuxPool(role: string): void {
        const pool = this._auxPools.get(role);
        if (!pool) return;

        for (const component of pool.items) {
            component.hidden = true;
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
                if (typeof component.update === 'function') {
                    component.update(data);
                }
                component.hidden = false;
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
        const container = this.getNodeEl('itemContainer');
        if (!container) return;

        container.style.display = 'flex';
        container.style.flexDirection =
            this.getData('direction') === 'horizontal' ? 'row' : 'column';

        const step = this.step;
        const items = this.items;
        if (!Array.isArray(items)) return;

        for (let i = 0; i < items.length; i++) {
            const component = items[i];
            if (!component?.el) continue;
            component.order = (i + 1) * step;
        }

        if (this._auxPools) {
            for (const pool of this._auxPools.values()) {
                for (let i = 0; i < pool.items.length; i++) {
                    const component = pool.items[i];
                    if (!component?.el) continue;
                    const orderIndex = component?.orderIndex ?? 0;
                    component.order = Math.floor(orderIndex * step + step * pool.offset);
                }
            }
        }
    }

    getTargetItem(target: Element): { component: any; type: string; index: number } | null {
        const base = super.getTargetItem(target);
        if (base) return base;

        for (const pool of this._auxPools.values()) {
            for (let i = 0; i < pool.items.length; i++) {
                const component = pool.items[i];
                if (component.el.contains(target)) {
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
