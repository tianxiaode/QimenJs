// ============================================
// ItemGroupStaticComponent.ts - 非池化
// 使用 order 控制顺序，组件随数据生灭
// ============================================

import { ItemGroupBaseComponent } from './ItemGroupBaseComponent';

class ItemGroupStaticComponent extends ItemGroupBaseComponent {
    setItems(datas: Record<string, any>[]): void {
        this.clear();
        for (const data of datas) {
            const item = this._createItem(data);
            if (item) this._items.push(item);
        }
        this.sort();
    }

    add(data: Record<string, any>): any {
        const item = this._createItem(data);
        if (item) {
            this._items.push(item);
            this.sort();
            return item.component;
        }
        return null;
    }

    insert(index: number, data: Record<string, any>): any {
        const item = this._createItem(data);
        if (!item) return null;
        const clampedIndex = Math.min(Math.max(0, index), this._items.length);

        if (this._items.length === 0) {
            this._items.push(item);
        } else if (clampedIndex === 0) {
            const firstOrder = this._items[0].component?.order ?? 0;
            item.component.order = firstOrder - 1;
            this._items.push(item);
        } else if (clampedIndex >= this._items.length) {
            const lastOrder = this._items[this._items.length - 1].component?.order ?? 0;
            item.component.order = lastOrder + 1;
            this._items.push(item);
        } else {
            const prevOrder = this._items[clampedIndex - 1].component?.order ?? 0;
            const nextOrder = this._items[clampedIndex].component?.order ?? 0;
            item.component.order = (prevOrder + nextOrder) / 2;
            this._items.push(item);
        }

        this.sort();
        return item.component;
    }

    removeAt(index: number): any {
        if (index < 0 || index >= this._items.length) return undefined;
        const [item] = this._items.splice(index, 1);
        this._destroyItem(item);
        return item.component;
    }

    clear(): void {
        for (const item of this._items) {
            this._destroyItem(item);
        }
        this._items = [];
        this.itemContainer?.el && (this.itemContainer.el.innerHTML = '');
    }

    sort(compareFn?: (a: any, b: any) => number): void {
        if (compareFn) {
            this._items.sort((a: any, b: any) => compareFn(a.component, b.component));
        } else {
            this._items.sort((a: any, b: any) => {
                const orderA = a.component?.order ?? 0;
                const orderB = b.component?.order ?? 0;
                return orderA - orderB;
            });
        }
        this._reorderDOM();
    }

    move(fromIndex: number, toIndex: number): void {
        if (fromIndex < 0 || fromIndex >= this._items.length) return;
        if (toIndex < 0 || toIndex >= this._items.length) return;
        if (fromIndex === toIndex) return;

        const fromOrder = this._items[fromIndex].component?.order ?? 0;
        const toOrder = this._items[toIndex].component?.order ?? 0;
        this._items[fromIndex].component.order = toOrder;
        this._items[toIndex].component.order = fromOrder;
        this.sort();
    }
}

export { ItemGroupStaticComponent };
export type ItemGroupStaticComponentType = InstanceType<typeof ItemGroupStaticComponent>;
