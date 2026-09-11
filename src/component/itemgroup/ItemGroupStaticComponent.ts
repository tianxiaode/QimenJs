import { ItemGroupBaseComponent } from './ItemGroupBaseComponent';

export class ItemGroupStaticComponent extends ItemGroupBaseComponent {
    setItems(datas: Record<string, any>[]): void {
        this.clear();
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            const component = this._createItem(data);
            if (component) {
                this.items.push(component);
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
            this.items.push(component);
            this._itemData.push(data);
            this.sort();
            this._emitItemAdd(this.items.length - 1, component, data);
            return component;
        }
        return null;
    }

    insert(index: number, data: Record<string, any>): any {
        const component = this._createItem(data);
        if (!component) return null;
        const clampedIndex = Math.min(Math.max(0, index), this.items.length);

        if (this.items.length === 0) {
            this.items.push(component);
            this._itemData.push(data);
        } else if (clampedIndex === 0) {
            const firstOrder = this.items[0]?.order ?? 0;
            component.order = firstOrder - 1;
            this.items.push(component);
            this._itemData.push(data);
        } else if (clampedIndex >= this.items.length) {
            const lastOrder = this.items[this.items.length - 1]?.order ?? 0;
            component.order = lastOrder + 1;
            this.items.push(component);
            this._itemData.push(data);
        } else {
            const prevOrder = this.items[clampedIndex - 1]?.order ?? 0;
            const nextOrder = this.items[clampedIndex]?.order ?? 0;
            component.order = (prevOrder + nextOrder) / 2;
            this.items.push(component);
            this._itemData.push(data);
        }

        this.sort();
        this._emitItemAdd(clampedIndex, component, data);
        return component;
    }

    removeAt(index: number): any {
        if (index < 0 || index >= this.items.length) return undefined;
        const [component] = this.items.splice(index, 1);
        const [data] = this._itemData.splice(index, 1);
        this._destroyItem(component);
        this._emitItemRemove(index, component, data);
        return component;
    }

    clear(): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
                const component = items[i];
                this._emitItemRemove(i, component, this._itemData[i]);
                this._destroyItem(component);
            }
            items.length = 0;
        }
        this._itemData = [];
        this.itemContainer?.el && (this.itemContainer.el.innerHTML = '');
        this._emitItemsChange('clear');
    }

    sort(compareFn?: (a: any, b: any) => number): void {
        const items = this.items;
        if (!Array.isArray(items)) return;
        if (compareFn) {
            items.sort((a: any, b: any) => compareFn(a, b));
        } else {
            items.sort((a: any, b: any) => {
                const orderA = a?.order ?? 0;
                const orderB = b?.order ?? 0;
                return orderA - orderB;
            });
        }
        this._reorderDOM();
        this._emitItemsChange('sort');
    }

    move(fromIndex: number, toIndex: number): void {
        const items = this.items;
        if (!Array.isArray(items)) return;
        if (fromIndex < 0 || fromIndex >= items.length) return;
        if (toIndex < 0 || toIndex >= items.length) return;
        if (fromIndex === toIndex) return;

        const fromOrder = items[fromIndex]?.order ?? 0;
        const toOrder = items[toIndex]?.order ?? 0;
        items[fromIndex].order = toOrder;
        items[toIndex].order = fromOrder;
        this.sort();
        this._emitItemsChange('move', { from: fromIndex, to: toIndex });
    }
}
