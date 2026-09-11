import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, FloatDecl } from '@qimenjs/component-core';
import { OverflowAbility } from '@qimenjs/component-abilities';
import { Definitions } from '@/composable';
import { ITEMGROUP_BASE_TPL } from './itemgroup-tpl';
import './itemgroup.css';

export type { OverflowMode } from '@qimenjs/component-abilities';
export type DefaultItemDef = Record<string, any>;
export type DefaultItemConfig = DefaultItemDef | Record<string, DefaultItemDef>;

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
        isItemContainer: true,
        _items: [],
    },
} as const;

class ItemGroupBaseComponent extends Component {
    static type = 'itemgroup';
    get tpl(): TemplateDecl {
        return ITEMGROUP_BASE_TPL;
    }

    _onDirectionOptionChange(value: string): void {
        this.removeCls(['q-itemgroup--horizontal', 'q-itemgroup--vertical']);
        this.addCls(`q-itemgroup--${value}`);
        this._applyOrders();
    }

    _onGapOptionChange(value: string): void {
        this.setStyles({ gap: value || '' }, 'itemContainer');
    }

    _onColsOptionChange(value: number): void {
        const container = this.getNodeEl('itemContainer');
        if (!container) return;
        if (value > 1) {
            this.setStyles({ '--q-itemgroup-cols': String(value) }, 'itemContainer'); // 设置样式
            this.addCls('q-itemgroup__items--cols');
        } else {
            this.removeStyles(['--q-itemgroup-cols']);
            this.removeCls('q-itemgroup__items--cols');
        }
    }

    _onStepOptionChange(_value: number): void {
        this._applyOrders();
    }

    _onItemsOptionChange(value: Record<string, any>[]): void {
        if (!Array.isArray(this._items)) this._items = [];
        if (value) this.setItems(value);
        this._setRawData(
            'items',
            this._items.map((item: any) => item.component)
        );
    }

    onAfterInit(): void {
        if (typeof (this as any).indicatorFloat === 'object') {
            for (const [key, decl] of Object.entries((this as any).indicatorFloat)) {
                this.attachFloat(key, decl as FloatDecl);
            }
        }
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
                return null;
            }
        } else {
            this.logger.warn(`[_createItem] invalid type: ${itemType}`);
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

    setItems(_datas: Record<string, any>[]): void {
        throw new Error('setItems must be implemented');
    }
    add(_data: Record<string, any>): any {
        throw new Error('add must be implemented');
    }
    insert(_index: number, _data: Record<string, any>): any {
        throw new Error('insert must be implemented');
    }
    removeAt(_index: number): any {
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
        this.clear();
    }
}

ItemGroupBaseComponent.use([OverflowAbility]);
ItemGroupBaseComponent.define(ItemGroupBaseComponentDefs);

export { ItemGroupBaseComponent };
export type ItemGroupBaseComponentType = InstanceType<typeof ItemGroupBaseComponent>;
