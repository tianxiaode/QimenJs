import { ItemGroupBaseComponent } from './ItemGroupBaseComponent';

export class ItemGroupStaticComponent extends ItemGroupBaseComponent {
    setItems(datas: Record<string, any>[]): void {
        this.clear();
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            const component = this._createItem(data);
            if (component) {
                this._items.push(component);
                this._itemData.push(data);
                this._emitItemAdd(i, component, data);
            }
        }
        this.sort();
        this._emitItemsChange('set', { count: datas.length });
    }

    add(data: Record<string, any>): any {
        const component = this._createItem(data);
        if (component) {
            this._items.push(component);
            this._itemData.push(data);
            this.sort();
            this._emitItemAdd(this._items.length - 1, component, data);
            return component;
        }
        return null;
    }

    insert(index: number, data: Record<string, any>): any {
        const component = this._createItem(data);
        if (!component) return null;
        const clampedIndex = Math.min(Math.max(0, index), this._items.length);

        if (this._items.length === 0) {
            this._items.push(component);
            this._itemData.push(data);
        } else if (clampedIndex === 0) {
            const firstOrder = this._items[0]?.order ?? 0;
            component.order = firstOrder - 1;
            this._items.push(component);
            this._itemData.push(data);
        } else if (clampedIndex >= this._items.length) {
            const lastOrder = this._items[this._items.length - 1]?.order ?? 0;
            component.order = lastOrder + 1;
            this._items.push(component);
            this._itemData.push(data);
        } else {
            const prevOrder = this._items[clampedIndex - 1]?.order ?? 0;
            const nextOrder = this._items[clampedIndex]?.order ?? 0;
            component.order = (prevOrder + nextOrder) / 2;
            this._items.push(component);
            this._itemData.push(data);
        }

        this.sort();
        this._emitItemAdd(clampedIndex, component, data);
        return component;
    }

    removeAt(index: number): any {
        if (index < 0 || index >= this._items.length) return undefined;
        const [component] = this._items.splice(index, 1);
        const [data] = this._itemData.splice(index, 1);
        this._destroyItem(component);
        this._emitItemRemove(index, component, data);
        return component;
    }

    clear(): void {
        for (let i = 0; i < this._items.length; i++) {
            const component = this._items[i];
            this._emitItemRemove(i, component, this._itemData[i]);
            this._destroyItem(component);
        }
        this._items = [];
        this._itemData = [];
        this.itemContainer?.el && (this.itemContainer.el.innerHTML = '');
        this._emitItemsChange('clear');
    }

    sort(compareFn?: (a: any, b: any) => number): void {
        if (compareFn) {
            this._items.sort((a: any, b: any) => compareFn(a, b));
        } else {
            this._items.sort((a: any, b: any) => {
                const orderA = a?.order ?? 0;
                const orderB = b?.order ?? 0;
                return orderA - orderB;
            });
        }
        this._reorderDOM();
        this._emitItemsChange('sort');
    }

    move(fromIndex: number, toIndex: number): void {
        if (fromIndex < 0 || fromIndex >= this._items.length) return;
        if (toIndex < 0 || toIndex >= this._items.length) return;
        if (fromIndex === toIndex) return;

        const fromOrder = this._items[fromIndex]?.order ?? 0;
        const toOrder = this._items[toIndex]?.order ?? 0;
        this._items[fromIndex].order = toOrder;
        this._items[toIndex].order = fromOrder;
        this.sort();
        this._emitItemsChange('move', { from: fromIndex, to: toIndex });
    }
}
