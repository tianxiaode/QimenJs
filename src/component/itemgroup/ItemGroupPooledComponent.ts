// ============================================
// ItemGroupPooledComponent.ts - 池化
// 数据驱动，索引即位置，无需 order
// ============================================

import { ItemGroupBaseComponent } from './ItemGroupBaseComponent';
import type { DomEventDecl } from '@qimenjs/component-core';
import { Logger } from '@qimenjs/logger';

const logger = Logger.for('ItemGroupPooled');

export let ItemGroupPooledComponent = ItemGroupBaseComponent.replace({
    type: 'ItemGroupPooled',

    onInitState() {
        const state = this._super.onInitState();
        return {
            ...state,
            _hiddenItems: [] as Array<{
                data: Record<string, any>;
                component: any;
                el: HTMLElement;
                events?: Record<string, DomEventDecl>;
            }>,
        };
    },

    // ========== 属性 ==========
    get poolSize(): number {
        return this._hiddenItems.length;
    },

    // ========== 业务方法 ==========
    setItems(datas: Record<string, any>[]): void {
        const newLength = datas.length;
        const currentLength = this._items.length;

        // 1. 更新已有的
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

        // 2. 新增
        for (let i = currentLength; i < newLength; i++) {
            const reused = this._reuseFromPool(datas[i]);
            if (reused) {
                this._items.push(reused);
            } else {
                const item = this._createItem(datas[i]);
                if (item) this._items.push(item);
            }
        }

        // 3. 隐藏多余的
        for (let i = newLength; i < currentLength; i++) {
            const item = this._items[i];
            item.el.hidden = true;
            this._hiddenItems.push(item);
        }
        this._items.length = newLength;

        this._reorderDOM();
    },

    add(data: Record<string, any>): any {
        const reused = this._reuseFromPool(data);
        if (reused) {
            this._items.push(reused);
            this._reorderDOM();
            return reused.component;
        }

        const item = this._createItem(data);
        if (item) {
            this._items.push(item);
            this._reorderDOM();
            return item.component;
        }
        return null;
    },

    insert(index: number, data: Record<string, any>): any {
        const clampedIndex = Math.min(Math.max(0, index), this._items.length);

        const reused = this._reuseFromPool(data);
        if (reused) {
            this._items.splice(clampedIndex, 0, reused);
            this._reorderDOM();
            return reused.component;
        }

        const item = this._createItem(data);
        if (item) {
            this._items.splice(clampedIndex, 0, item);
            this._reorderDOM();
            return item.component;
        }
        return null;
    },

    removeAt(index: number): any {
        if (index < 0 || index >= this._items.length) return undefined;
        const [item] = this._items.splice(index, 1);
        item.el.hidden = true;
        this._hiddenItems.push(item);
        return item.component;
    },

    clear(): void {
        for (const item of this._items) {
            item.el.hidden = true;
            this._hiddenItems.push(item);
        }
        this._items = [];
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
});

export type ItemGroupPooledComponentType = InstanceType<typeof ItemGroupPooledComponent>;
