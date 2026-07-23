// ============================================
// ItemGroupBaseComponent.ts - 基类
// 提供：模板、工具方法、事件处理、defaultItem 合并
// ============================================

import { Component, ComponentRegistrar } from '@qimenjs/component-core';
import type { DomEventDecl } from '@qimenjs/component-core';
import { getId } from '@/utils/string/id';

export type OverflowMode = 'none' | 'scroll' | 'menu';
export type DefaultItemDef = Record<string, any>;
export type DefaultItemConfig = DefaultItemDef | Record<string, DefaultItemDef>;

export interface ItemGroupConfig {
    direction?: 'horizontal' | 'vertical';
    /** 默认子组件类型，当 item 没有指定 type 时使用 */
    defaultItemType?: string;
    items?: Record<string, any>[];
    gap?: string;
    /** 列数，大于 1 时使用 CSS Grid 多列布局，行内顶部对齐 */
    cols?: number;
    /** 按 type 索引的默认配置，主要用于事件转发 */
    defaultItem?: DefaultItemConfig;
    overflowMode?: OverflowMode;
}

export interface ItemGroupProps extends ItemGroupConfig {
    cls?: string;
    itemsCls?: string;
}

// 基类：模板 + 工具方法 + 事件处理
export let ItemGroupBaseComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-itemgroup',
        children: [{ tag: 'div', name: 'itemContainer', cls: 'q-itemgroup__items' }],
    },
    body: {
        type: 'ItemGroupBase',

        onInitState() {
            return {
                _items: [] as Array<{
                    data: Record<string, any>;
                    component: any;
                    el: HTMLElement;
                    events?: Record<string, DomEventDecl>;
                }>,
                _direction: 'horizontal' as 'horizontal' | 'vertical',
                /** 默认子组件类型 */
                _defaultItemType: '',
                _gap: '',
                _cols: 1 as number,
                /** 按 type 索引的默认配置（事件等） */
                _defaultItem: {} as DefaultItemConfig,
                _overflowMode: 'none' as OverflowMode,
            };
        },

        onAfterInit(props?: any): void {
            this._initItemGroupComponent(props);
        },

        _initItemGroupComponent(props?: any): void {
            if (props?.direction) this.direction = props.direction;
            if (props?.gap) this.gap = props.gap;
            if (props?.cols) this.cols = props.cols;
            if (props?.defaultItemType) this.defaultItemType = props.defaultItemType;
            if (props?.defaultItem) this.defaultItem = props.defaultItem;
            if (props?.overflowMode) this.overflowMode = props.overflowMode;
            if (props?.cls) this.addCls(props.cls);
            if (props?.items) this.setItems(props.items);
        },

        // ========== 公共属性 ==========
        get items(): readonly any[] {
            return this._items.map((item: any) => item.component);
        },
        get count(): number {
            return this._items.length;
        },

        get direction(): 'horizontal' | 'vertical' {
            return this._direction;
        },
        set direction(value: 'horizontal' | 'vertical') {
            this._direction = value;
            this._applyDirection();
        },

        get defaultItemType(): string {
            return this._defaultItemType;
        },
        set defaultItemType(value: string) {
            this._defaultItemType = value;
        },

        get gap(): string {
            return this._gap;
        },
        set gap(value: string) {
            this._gap = value;
            this._applyGap();
        },

        get cols(): number {
            return this._cols;
        },
        set cols(value: number) {
            this._cols = value;
            this._applyCols();
        },

        get defaultItem(): DefaultItemConfig {
            return this._defaultItem;
        },
        set defaultItem(value: DefaultItemConfig) {
            this._defaultItem = value;
        },

        get overflowMode(): OverflowMode {
            return this._overflowMode;
        },
        set overflowMode(value: OverflowMode) {
            this._overflowMode = value;
            this._applyOverflowMode();
        },

        // ========== 通用方法 ==========
        getAt(index: number): any {
            if (index < 0 || index >= this._items.length) return null;
            return this._items[index].component;
        },

        indexOf(instance: any): number {
            for (let i = 0; i < this._items.length; i++) {
                if (this._items[i].component === instance) return i;
            }
            return -1;
        },

        updateAt(index: number, data: Record<string, any>): void {
            if (index < 0 || index >= this._items.length) return;
            const item = this._items[index];
            item.data = data;
            if (typeof item.component.update === 'function') {
                item.component.update(data);
            }
        },

        // ========== 创建/销毁 ==========
        _createItem(data: Record<string, any>): any {
            // 优先使用 data.type，否则使用 defaultItemType
            const itemType = data.type ?? this._defaultItemType;
            if (!itemType) return null;

            const ItemClass = ComponentRegistrar.getInstance().get(itemType);
            if (!ItemClass) return null;

            // 合并事件：defaultItem[type] 中的 events + data 中的 events
            const mergedEvents = this._mergeEvents(data, itemType);

            // 准备 props，剔除控制字段
            const props = { ...data };
            delete props.type;
            delete props.events;

            const instance = new ItemClass(props);
            const name = getId('item');

            // ✅ 关键：先注册到 nodeMap
            this.nodeMap[name] = {
                name,
                el: instance.el,
                component: instance,
                events: mergedEvents,
            };

            const item = {
                name,
                data,
                component: instance,
                el: instance.el,
                events: mergedEvents,
            };

            // 挂载 DOM
            this.itemContainer.el.appendChild(instance.el);

            // 绑定事件
            if (mergedEvents && Object.keys(mergedEvents).length > 0) {
                this._bindItemEvents(item);
            }

            return item;
        },

        _destroyItem(item: any): void {
            this._unbindItemEvents(item);
            delete this.nodeMap[item.name];
            if (typeof item?.component?.dispose === 'function') {
                item.component.dispose();
            }
        },

        // ========== 事件处理 ==========
        /**
         * 合并事件配置
         * defaultItem[type].events 作为基础，data.events 覆盖
         */
        _mergeEvents(
            data: Record<string, any>,
            itemType: string
        ): Record<string, DomEventDecl> | undefined {
            const itemEvents = data.events as Record<string, DomEventDecl> | undefined;
            const defaultDef = this._defaultItem[itemType];

            // 都没有事件
            if (!defaultDef?.events && !itemEvents) return undefined;
            // 只有 default 有事件
            if (!itemEvents) return defaultDef.events;
            // 只有 data 有事件
            if (!defaultDef?.events) return itemEvents;

            // 两者都有，合并（data 覆盖 default）
            const merged: Record<string, DomEventDecl> = { ...defaultDef.events };
            for (const [event, decl] of Object.entries(itemEvents)) {
                if (merged[event]) {
                    merged[event] = { ...merged[event], ...decl };
                } else {
                    merged[event] = decl;
                }
            }
            return merged;
        },

        _bindItemEvents(item: any): void {
            if (!item?.component || !item.events) return;
            item._unsubs = [];
            for (const [domEvent, decl] of Object.entries(item.events) as [
                string,
                DomEventDecl,
            ][]) {
                const { once } = decl;
                const callback = (ctx: any) => {
                    const data = ctx?.data !== undefined ? ctx.data : ctx;
                    this._handleDomEvent(data, item.component.name || 'item', domEvent, decl);
                };

                let off: (() => void) | undefined;
                if (once) {
                    off = item.component.once?.(domEvent, callback);
                } else {
                    off = item.component.on?.(domEvent, callback);
                }
                if (typeof off === 'function') {
                    item._unsubs.push(off);
                }
            }
        },

        _unbindItemEvents(item: any): void {
            if (!item?._unsubs) return;
            for (const off of item._unsubs) {
                if (typeof off === 'function') off();
            }
            item._unsubs = [];
        },

        // ========== DOM 操作 ==========
        _reorderDOM(): void {
            const container = this.itemContainer.el;
            if (!container) return;
            const fragment = document.createDocumentFragment();
            for (const item of this._items) {
                fragment.appendChild(item.el);
            }
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            container.appendChild(fragment);
        },

        // ========== 样式应用 ==========
        _applyDirection(): void {
            this.el.classList.remove('q-itemgroup--horizontal', 'q-itemgroup--vertical');
            this.el.classList.add(`q-itemgroup--${this._direction}`);
        },

        _applyGap(): void {
            this.itemContainer.el.style.gap = this._gap || '';
        },

        _applyCols(): void {
            const container = this.itemContainer.el;
            if (this._cols > 1) {
                container.style.setProperty('--q-itemgroup-cols', String(this._cols));
                container.classList.add('q-itemgroup__items--cols');
            } else {
                container.style.removeProperty('--q-itemgroup-cols');
                container.classList.remove('q-itemgroup__items--cols');
            }
        },

        _applyOverflowMode(): void {
            if (this._overflowMode === 'none') return;
            this.overflowConfig = {
                type: this._overflowMode as 'scroll' | 'menu',
                direction: this._direction as 'horizontal' | 'vertical',
            };
        },

        _cleanupOverflow(): void {
            this.overflowConfig = undefined;
            // ... 清理 overflow 样式
        },

        // ========== 子类必须实现 ==========
        setItems(datas: Record<string, any>[]): void {
            throw new Error('setItems must be implemented');
        },
        add(data: Record<string, any>): any {
            throw new Error('add must be implemented');
        },
        insert(index: number, data: Record<string, any>): any {
            throw new Error('insert must be implemented');
        },
        removeAt(index: number): any {
            throw new Error('removeAt must be implemented');
        },
        clear(): void {
            throw new Error('clear must be implemented');
        },

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
        },

        onBeforeDispose(): void {
            this._cleanupOverflow();
            this.clear();
        },
    },
});

export type ItemGroupBaseComponentType = InstanceType<typeof ItemGroupBaseComponent>;
