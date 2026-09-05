import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, TplEventAction, FloatDecl } from '@qimenjs/component-core';
import { OverflowAbility } from '@qimenjs/component-abilities';
import { Definitions } from '@/composable';
import { ITEMGROUP_BASE_TPL } from './itemgroup-tpl';
import './itemgroup.css';

export type { OverflowMode } from '@qimenjs/component-abilities';
export type DefaultItemDef = Record<string, any>;
export type DefaultItemConfig = DefaultItemDef | Record<string, DefaultItemDef>;

export interface ItemGroupConfig {
    direction?: 'horizontal' | 'vertical';
    defaultItemType?: string;
    items?: Record<string, any>[];
    gap?: string;
    cols?: number;
    defaultItem?: DefaultItemConfig;
    overflowMode?: import('@qimenjs/component-abilities').OverflowMode;
    step?: number;
    indicator?: any;
}

const ItemGroupBaseComponentDefs: Definitions = {
    options: {
        direction: 'horizontal',
        gap: '',
        cols: 1,
        overflowMode: 'none',
        step: 100,
        items: null,
    },
    fields: {
        defaultItemType: '',
        defaultItem: {},
        indicator: undefined,
    },
} as const;

class ItemGroupBaseComponent extends Component {
    static type = 'itemgroup';

    get tpl(): TemplateDecl {
        return ITEMGROUP_BASE_TPL;
    }

    _items: Array<{
        data: Record<string, any>;
        component: any;
        el: HTMLElement;
        events?: Record<string, TplEventAction>;
    }> = [];

    get isItemContainer(): boolean {
        return true;
    }

    _onDirectionOptionChange(value: string): void {
        this.el!.classList.remove('q-itemgroup--horizontal', 'q-itemgroup--vertical');
        this.el!.classList.add(`q-itemgroup--${value}`);
        if (typeof (this as any)._onOverflowDirectionChange === 'function') {
            (this as any)._onOverflowDirectionChange();
        }
        this._applyOrders();
    }

    _onGapOptionChange(value: string): void {
        const container = this.getNodeEl('itemContainer');
        if (container) (container as HTMLElement).style.gap = value || '';
    }

    _onColsOptionChange(value: number): void {
        const container = this.getNodeEl('itemContainer');
        if (!container) return;
        if (value > 1) {
            (container as HTMLElement).style.setProperty('--q-itemgroup-cols', String(value));
            container.classList.add('q-itemgroup__items--cols');
        } else {
            (container as HTMLElement).style.removeProperty('--q-itemgroup-cols');
            container.classList.remove('q-itemgroup__items--cols');
        }
    }

    _onOverflowModeOptionChange(value: string): void {
        if (typeof (this as any)._applyOverflowMode === 'function') {
            (this as any)._applyOverflowMode();
        }
    }

    _onStepOptionChange(value: number): void {
        if (typeof (this as any)._onOverflowStepChange === 'function') {
            (this as any)._onOverflowStepChange(value);
        }
        this._applyOrders();
    }

    _onItemsOptionChange(value: Record<string, any>[]): void {
        if (value) this.setItems(value);
    }

    onAfterInit(): void {
        this._initItemGroupComponent();

        if (typeof (this as any).indicatorFloat === 'object') {
            for (const [key, decl] of Object.entries((this as any).indicatorFloat)) {
                this.attachFloat(key, decl as FloatDecl);
            }
        }
    }

    _initItemGroupComponent(props?: any): void {
        const data = props ?? {};
        if (data.direction) this.direction = data.direction;
        if (data.gap) this.gap = data.gap;
        if (data.cols) this.cols = data.cols;
        if (data.defaultItemType) this.defaultItemType = data.defaultItemType;
        if (data.defaultItem) this.defaultItem = data.defaultItem;
        if (data.step) this.step = data.step;
        if (data.indicator && typeof (this as any).initIndicator === 'function') {
            (this as any).initIndicator(data.indicator);
        }
        if (data.cls) this.addCls(data.cls);
        if (data.items) this.setItems(data.items);
        this._initOverflow(data);
    }

    _initOverflow(props?: any): void {
        if (typeof (this as any).initOverflow === 'function') {
            (this as any).initOverflow({
                mode: props?.overflowMode ?? this.overflowMode,
                direction: this.direction,
                step: this.step,
            });
        }
    }

    get items(): readonly any[] {
        return (this._items || []).map((item: any) => item.component);
    }
    get count(): number {
        return (this._items || []).length;
    }

    getTargetItem(target: Element): { component: any; type: string; index: number } | null {
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            if (this.containsElement('', target) || item.el.contains(target)) {
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
        this._emitItemUpdate(index, item.component, data);
    }

    _emitItemAdd(index: number, component: any, data: Record<string, any>): void {
        this.emit('itemadd', { index, component, data });
    }

    _emitItemRemove(index: number, component: any, data: Record<string, any>): void {
        this.emit('itemremove', { index, component, data });
    }

    _emitItemUpdate(index: number, component: any, data: Record<string, any>): void {
        this.emit('itemupdate', { index, component, data });
    }

    _emitItemsChange(type: 'set' | 'clear' | 'sort' | 'move', details?: Record<string, any>): void {
        this.emit('itemchange', { type, ...details });
    }

    _createItem(data: Record<string, any>): any {
        const itemType = data.type ?? this.defaultItemType;
        if (!itemType) return null;

        let ItemClass: any;
        if (typeof itemType === 'function') {
            ItemClass = itemType;
        } else if (typeof itemType === 'string') {
            ItemClass = this.resolveComponent(itemType);
            if (!ItemClass) {
                console.warn(`[_createItem] type "${itemType}" not found`);
                return null;
            }
        } else {
            console.warn(`[_createItem] invalid type: ${itemType}`);
            return null;
        }

        const props = { ...data };
        delete props.type;
        const itemEvents = props.events;
        delete props.events;

        const instance = new ItemClass(props);

        const item = {
            data,
            component: instance,
            el: instance.el,
            events: itemEvents,
        };

        const container = this.getNodeEl('itemContainer');
        if (container) container.appendChild(instance.el);

        return item;
    }

    _destroyItem(item: any): void {
        if (typeof item?.component?.dispose === 'function') {
            item.component.dispose();
        }
    }

    _applyOrders(): void {}

    _reorderDOM(): void {
        const container = this.getNodeEl('itemContainer');
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
        this._applyOptions(props);
        if (typeof (this as any).onUpdated === 'function') {
            (this as any).onUpdated(props);
        }
    }

    onBeforeDispose(): void {
        if (typeof (this as any)._teardownOverflow === 'function') {
            (this as any)._teardownOverflow();
        }
        this.clear();
    }
}

ItemGroupBaseComponent.use([OverflowAbility]);
ItemGroupBaseComponent.define(ItemGroupBaseComponentDefs);

export { ItemGroupBaseComponent };
export type ItemGroupBaseComponentType = InstanceType<typeof ItemGroupBaseComponent>;
