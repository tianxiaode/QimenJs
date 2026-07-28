// ============================================
// ItemGroupBaseComponent.ts - 基类
// 提供：模板、工具方法、事件处理、defaultItem 合并
// ============================================

import { Component, ComponentRegistrar } from '@qimenjs/component-core';

export type OverflowMode = 'none' | 'scroll' | 'menu';
export type DefaultItemDef = Record<string, any>;
export type DefaultItemConfig = DefaultItemDef | Record<string, DefaultItemDef>;

export interface ItemGroupConfig {
    direction?: 'horizontal' | 'vertical';
    defaultItemType?: string;
    items?: Record<string, any>[];
    gap?: string;
    cols?: number;
    defaultItem?: DefaultItemConfig;
    overflowMode?: OverflowMode;
    step?: number;
}

export interface ItemGroupProps extends ItemGroupConfig {
    cls?: string;
    itemsCls?: string;
}

class ItemGroupBaseComponent extends Component {
    static type = 'ItemGroupBase';

    type = 'ItemGroupBase';

    onInitState() {
        return {
            _items: [] as Array<{
                data: Record<string, any>;
                component: any;
                el: HTMLElement;
            }>,
            _direction: 'horizontal' as 'horizontal' | 'vertical',
            _defaultItemType: '',
            _gap: '',
            _cols: 1 as number,
            _defaultItem: {} as DefaultItemConfig,
            _overflowMode: 'none' as OverflowMode,
            _step: 100 as number,
        };
    }

    onAfterInit(props?: any): void {
        this._initItemGroupComponent(props);
    }

    _initItemGroupComponent(props?: any): void {
        if (props?.direction) this.direction = props.direction;
        if (props?.gap) this.gap = props.gap;
        if (props?.cols) this.cols = props.cols;
        if (props?.defaultItemType) this.defaultItemType = props.defaultItemType;
        if (props?.defaultItem) this.defaultItem = props.defaultItem;
        if (props?.overflowMode) this.overflowMode = props.overflowMode;
        if (props?.step) this.step = props.step;

        if (props?.cls) this.addCls(props.cls);
        if (props?.items) this.setItems(props.items);
    }

    get items(): readonly any[] {
        return (this._items || []).map((item: any) => item.component);
    }
    get count(): number {
        return (this._items || []).length;
    }

    get direction(): 'horizontal' | 'vertical' {
        return this._direction;
    }
    set direction(value: 'horizontal' | 'vertical') {
        this._direction = value;
        this._applyDirection();
    }

    get defaultItemType(): string {
        return this._defaultItemType;
    }
    set defaultItemType(value: string) {
        this._defaultItemType = value;
    }

    get gap(): string {
        return this._gap;
    }
    set gap(value: string) {
        this._gap = value;
        this._applyGap();
    }

    get cols(): number {
        return this._cols;
    }
    set cols(value: number) {
        this._cols = value;
        this._applyCols();
    }

    get defaultItem(): DefaultItemConfig {
        return this._defaultItem;
    }
    set defaultItem(value: DefaultItemConfig) {
        this._defaultItem = value;
    }

    get overflowMode(): OverflowMode {
        return this._overflowMode;
    }
    set overflowMode(value: OverflowMode) {
        this._overflowMode = value;
        this._applyOverflowMode();
    }

    get step(): number {
        return this._step;
    }
    set step(value: number) {
        this._step = value;
        this._applyOrders();
    }

    getTargetItem(target: Element): { component: any; type: string; index: number } | null {
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            if (item.component.containsElement('', target) || item.el.contains(target)) {
                const type = item.component.constructor?._type || item.component.type || '';
                return { component: item.component, type, index: i };
            }
        }
        return null;
    }

    getAt(index: number): any {
        if (index < 0 || index >= this._items.length) return null;
        return this._items[index].component;
    }

    indexOf(instance: any): number {
        for (let i = 0; i < this._items.length; i++) {
            if (this._items[i].component === instance) return i;
        }
        return -1;
    }

    updateAt(index: number, data: Record<string, any>): void {
        if (index < 0 || index >= this._items.length) return;
        const item = this._items[index];
        item.data = data;
        if (typeof item.component.update === 'function') {
            item.component.update(data);
        }
    }

    _createItem(data: Record<string, any>): any {
        const itemType = data.type ?? this._defaultItemType;
        if (!itemType) return null;

        const ItemClass = ComponentRegistrar.getInstance().get(itemType) as any;
        if (!ItemClass) return null;

        const props = { ...data };
        delete props.type;
        delete props.events;

        const instance = new ItemClass(props);

        const name = instance.id;

        this.nodeMap[name] = {
            name,
            el: instance.el,
            component: instance,
        };

        const item = {
            name,
            data,
            component: instance,
            el: instance.el,
        };

        this.itemContainer?.el?.appendChild(instance.el);

        return item;
    }

    _destroyItem(item: any): void {
        delete this.nodeMap[item.name];
        if (typeof item?.component?.dispose === 'function') {
            item.component.dispose();
        }
    }

    _applyOrders(): void {}

    _reorderDOM(): void {
        const container = this.itemContainer?.el;
        if (!container) return;
        const fragment = document.createDocumentFragment();
        for (const item of this._items) {
            fragment.appendChild(item.el);
        }
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        container.appendChild(fragment);
    }

    _applyDirection(): void {
        this.el.classList.remove('q-itemgroup--horizontal', 'q-itemgroup--vertical');
        this.el.classList.add(`q-itemgroup--${this._direction}`);
        this._applyOrders();
    }

    _applyGap(): void {
        if (!this.itemContainer?.el) return;
        this.itemContainer.el.style.gap = this._gap || '';
    }

    _applyCols(): void {
        const container = this.itemContainer?.el;
        if (!container) return;
        if (this._cols > 1) {
            container.style.setProperty('--q-itemgroup-cols', String(this._cols));
            container.classList.add('q-itemgroup__items--cols');
        } else {
            container.style.removeProperty('--q-itemgroup-cols');
            container.classList.remove('q-itemgroup__items--cols');
        }
    }

    _applyOverflowMode(): void {
        if (this._overflowMode === 'none') return;
        this.overflowConfig = {
            type: this._overflowMode as 'scroll' | 'menu',
            direction: this._direction as 'horizontal' | 'vertical',
        };
    }

    _cleanupOverflow(): void {
        this.overflowConfig = undefined;
    }

    setItems(datas: Record<string, any>[]): void {
        throw new Error('setItems must be implemented');
    }
    add(data: Record<string, any>): any {
        throw new Error('add must be implemented');
    }
    insert(index: number, data: Record<string, any>): any {
        throw new Error('insert must be implemented');
    }
    removeAt(index: number): any {
        throw new Error('removeAt must be implemented');
    }
    clear(): void {
        throw new Error('clear must be implemented');
    }

    update(props?: Record<string, any>): void {
        if (props?.direction !== undefined) {
            this._direction = props.direction;
            this._applyDirection();
        }
        if (props?.gap !== undefined) {
            this._gap = props.gap;
            this._applyGap();
        }
        if (props?.cols !== undefined) {
            this._cols = props.cols;
            this._applyCols();
        }
        if (props?.defaultItemType !== undefined) {
            this.defaultItemType = props.defaultItemType;
        }
        if (props?.overflowMode !== undefined) {
            this._overflowMode = props.overflowMode;
            this._applyOverflowMode();
        }
        if (typeof this.onUpdated === 'function') (this as any).onUpdated(props);
    }

    onBeforeDispose(): void {
        this._cleanupOverflow();
        this.clear();
    }
}

export { ItemGroupBaseComponent };
export type ItemGroupBaseComponentType = InstanceType<typeof ItemGroupBaseComponent>;
