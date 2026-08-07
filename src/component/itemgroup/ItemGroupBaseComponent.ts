// ============================================
// ItemGroupBaseComponent.ts - 基类
// 提供：模板、工具方法、事件处理、defaultItem 合并
// ============================================

import { Component, TplNode } from '@qimenjs/component-core';
import type { TplEventAction, FloatDecl } from '@qimenjs/component-core';
import { IndicatorAbility, type IndicatorConfig } from '@qimenjs/component-abilities';
import { OverflowAbility } from '@qimenjs/component-abilities';

export type { OverflowMode } from '@qimenjs/component-abilities';
/** 默认项定义 */
export type DefaultItemDef = Record<string, any>;
/** 默认项配置 */
export type DefaultItemConfig = DefaultItemDef | Record<string, DefaultItemDef>;

/** 项组基础模板定义 */
const ITEMGROUP_BASE_TPL: TplNode = {
    tag: 'div',
    cls: 'q-itemgroup',
    children: [
        {
            tag: 'div',
            name: 'overflowPrev',
            cls: 'q-itemgroup__overflow-prev',
            hidden: true,
        },
        { tag: 'div', name: 'itemContainer', cls: 'q-itemgroup__items' },
        {
            tag: 'div',
            name: 'overflowNext',
            cls: 'q-itemgroup__overflow-next',
            hidden: true,
        },
        {
            tag: 'div',
            name: 'overflowMore',
            cls: 'q-itemgroup__overflow-more',
            hidden: true,
        },
    ],
};

/** 项组配置 */
export interface ItemGroupConfig {
    direction?: 'horizontal' | 'vertical';
    defaultItemType?: string;
    items?: Record<string, any>[];
    gap?: string;
    cols?: number;
    defaultItem?: DefaultItemConfig;
    overflowMode?: import('@qimenjs/component-abilities').OverflowMode;
    step?: number;
    indicator?: IndicatorConfig;
}

/** 项组属性接口 */
export interface ItemGroupProps extends ItemGroupConfig {
    cls?: string;
    itemsCls?: string;
}

/** 项组基类组件 */
class ItemGroupBaseComponent extends Component {
    get tpl(): TplNode {
        return ITEMGROUP_BASE_TPL;
    }

    _items: Array<{
        data: Record<string, any>;
        component: any;
        el: HTMLElement;
        events?: Record<string, TplEventAction>;
    }> = [];

    _direction: 'horizontal' | 'vertical' = 'horizontal';
    _defaultItemType: string = '';
    _gap: string = '';
    _cols: number = 1;
    _defaultItem: DefaultItemConfig = {};
    _overflowMode: import('@qimenjs/component-abilities').OverflowMode = 'none';
    _step: number = 100;

    get isItemContainer(): boolean {
        return true;
    }

    onAfterInit(props?: any): void {
        this._initItemGroupComponent(props);

        if (typeof this.indicatorFloat === 'object') {
            for (const [key, decl] of Object.entries(this.indicatorFloat)) {
                this.attachFloat(key, decl as FloatDecl);
            }
        }
    }

    _initItemGroupComponent(props?: any): void {
        if (props?.direction) this.direction = props.direction;
        if (props?.gap) this.gap = props.gap;
        if (props?.cols) this.cols = props.cols;
        if (props?.defaultItemType) this.defaultItemType = props.defaultItemType;
        if (props?.defaultItem) this.defaultItem = props.defaultItem;
        if (props?.step) this.step = props.step;
        if (props?.indicator && typeof this.initIndicator === 'function') {
            this.initIndicator(props.indicator);
        }

        if (props?.cls) this.addCls(props.cls);
        if (props?.items) this.setItems(props.items);

        this._initOverflow(props);
    }

    _initOverflow(props?: any): void {
        if (typeof this.initOverflow === 'function') {
            this.initOverflow({
                mode: props?.overflowMode ?? 'none',
                direction: this._direction,
                step: this._step,
            });
        }
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

    get overflowMode(): import('@qimenjs/component-abilities').OverflowMode {
        return this._overflowMode;
    }
    set overflowMode(value: import('@qimenjs/component-abilities').OverflowMode) {
        this._overflowMode = value;
        if (typeof this._applyOverflowMode === 'function') {
            this._applyOverflowMode();
        }
    }

    get step(): number {
        return this._step;
    }
    set step(value: number) {
        this._step = value;
        if (typeof this._onOverflowStepChange === 'function') {
            this._onOverflowStepChange(value);
        }
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
        this._emitItemUpdate(index, item.component, data);
    }

    // ============================================
    // 事件辅助方法
    // ============================================

    /** 触发 itemadd 事件 */
    _emitItemAdd(index: number, component: any, data: Record<string, any>): void {
        this.emit('itemadd', { index, component, data });
    }

    /** 触发 itemremove 事件 */
    _emitItemRemove(index: number, component: any, data: Record<string, any>): void {
        this.emit('itemremove', { index, component, data });
    }

    /** 触发 itemupdate 事件 */
    _emitItemUpdate(index: number, component: any, data: Record<string, any>): void {
        this.emit('itemupdate', { index, component, data });
    }

    /** 触发 itemchange 事件（批量变化，如 setItems/clear） */
    _emitItemsChange(type: 'set' | 'clear' | 'sort' | 'move', details?: Record<string, any>): void {
        this.emit('itemchange', { type, ...details });
    }

    _createItem(data: Record<string, any>): any {
        const itemType = data.type ?? this._defaultItemType;
        if (!itemType) return null;

        // 支持组件类直接引用或字符串类型名
        let ItemClass: any;
        if (typeof itemType === 'function') {
            ItemClass = itemType;
        } else if (typeof itemType === 'string') {
            ItemClass = CompileEngine.get(itemType);
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
            events: itemEvents,
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
        if (typeof this._onOverflowDirectionChange === 'function') {
            this._onOverflowDirectionChange();
        }
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
            this.overflowMode = props.overflowMode;
        }
        if (typeof this.onUpdated === 'function') (this as any).onUpdated(props);
    }

    onBeforeDispose(): void {
        if (typeof this._teardownOverflow === 'function') {
            this._teardownOverflow();
        }
        this.clear();
    }
}

ItemGroupBaseComponent.use([IndicatorAbility, OverflowAbility]);

export { ItemGroupBaseComponent };
/** 项组基类实例类型 */
export type ItemGroupBaseComponentType = InstanceType<typeof ItemGroupBaseComponent>;
