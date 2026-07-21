/**
 * ItemGroupComponent 项组组件
 *
 * 轻量排列容器，通过 items 数组管理子组件实例。
 * 子项注册进 nodeMap，事件转发由 EventForwardAbility 统一处理。
 *
 * 核心设计：
 * - defaultItem：按 type 索引的 TplNode 默认定义，子项创建时深合并
 * - _visibleNames：有序可见 name 列表，控制 DOM 顺序和数据映射
 * - _hiddenNames：池化可用 name 列表（itemDestroy=false 时复用）
 * - nodeMap[name]：子项实例 + 事件声明，EventForwardAbility 自动接管
 *
 * 模板节点：
 * - itemContainer — 子项挂载区
 */

import { TemplateComponent, ComponentRegistrar } from '@qimenjs/component-core';
import type { DomEventDecl } from '@qimenjs/component-core';
import { getId } from '@/utils/string/id';

export type OverflowMode = 'none' | 'scroll' | 'menu';

export type DefaultItemDef = Record<string, any>;

export type DefaultItemConfig = DefaultItemDef | Record<string, DefaultItemDef>;

export interface ItemGroupConfig {
    direction?: 'horizontal' | 'vertical';
    itemType?: string;
    items?: Record<string, any>[];
    gap?: string;
    defaultItem?: DefaultItemConfig;
    itemDestroy?: boolean;
    overflowMode?: OverflowMode;
}

export interface ItemGroupProps extends ItemGroupConfig {
    cls?: string;
    itemsCls?: string;
}

export let ItemGroupComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-itemgroup',
        children: [{ tag: 'div', name: 'itemContainer', cls: 'q-itemgroup__items' }],
    },
    body: {
        type: 'ItemGroup',

        onInitState() {
            return {
                _visibleNames: [] as string[],
                _hiddenNames: [] as string[],
                _direction: 'horizontal' as 'horizontal' | 'vertical',
                _itemType: '',
                _gap: '',
                _containerEl: null as HTMLElement | null,
                _defaultItem: {} as DefaultItemConfig,
                _itemDestroy: true,
                _overflowMode: 'none' as OverflowMode,
            };
        },

        onAfterInit(props?: ItemGroupProps): void {
            this._initItemGroupComponent(props);
        },

        _initItemGroupComponent(props?: ItemGroupProps): void {

            if (props?.cls) {
                this.addCls(props.cls);
            }


            if (props?.itemsCls && this._containerEl) {
                this.itemContainer.addCls(props.itemsCls);
            }

            if (props?.direction) this.direction = props.direction;
            if (props?.gap) this.gap = props.gap;
            if (props?.itemType) this.itemType = props.itemType;
            if (props?.overflowMode) this.overflowMode = props.overflowMode;

            if (props?.defaultItem) this._defaultItem = props.defaultItem;
            if (props?.itemDestroy !== undefined) this._itemDestroy = props.itemDestroy;

            this._applyDirection();
            this._applyGap();

            if (props?.items?.length) {
                this.setItems(props.items);
            }

            if (this._overflowMode !== 'none') {
                this._applyOverflowMode();
            }
        },

        get items(): readonly any[] {
            return this._visibleNames
                .map((name: string) => this.nodeMap[name]?.component)
                .filter(Boolean);
        },
        get count(): number {
            return this._visibleNames.length;
        },
        get direction(): 'horizontal' | 'vertical' {
            return this._direction;
        },
        set direction(value: 'horizontal' | 'vertical') {
            this._direction = value;
            this._applyDirection();
        },
        get itemType(): string {
            return this._itemType;
        },
        set itemType(value: string) {
            this._itemType = value;
        },
        get gap(): string {
            return this._gap;
        },
        set gap(value: string) {
            this._gap = value;
            this._applyGap();
        },
        get defaultItem(): DefaultItemConfig {
            return this._defaultItem;
        },
        get itemDestroy(): boolean {
            return this._itemDestroy;
        },
        get overflowMode(): OverflowMode {
            return this._overflowMode;
        },
        set overflowMode(value: OverflowMode) {
            this._overflowMode = value;
            this._applyOverflowMode();
        },

        setItems(datas: Record<string, any>[]): void {
            for (let i = 0; i < datas.length; i++) {
                if (i < this._visibleNames.length) {
                    const name = this._visibleNames[i];
                    const component = this.nodeMap[name]?.component;
                    if (component && typeof component.update === 'function') {
                        component.update(datas[i]);
                    }
                    const el = this.nodeMap[name]?.el;
                    if (el) el.hidden = false;
                } else {
                    this._createAndRegister(datas[i]);
                }
            }

            if (this._itemDestroy) {
                for (let i = datas.length; i < this._visibleNames.length; i++) {
                    const name = this._visibleNames[i];
                    this._destroyItem(name);
                }
                this._visibleNames.length = datas.length;
            } else {
                for (let i = datas.length; i < this._visibleNames.length; i++) {
                    const name = this._visibleNames[i];
                    const el = this.nodeMap[name]?.el;
                    if (el) el.hidden = true;
                    this._hiddenNames.push(name);
                }
                this._visibleNames.length = datas.length;
            }
        },

        add(data: Record<string, any>): any {
            if (!this._itemDestroy) {
                const reuseName = this._findReusableHidden(data.type);
                if (reuseName) {
                    const component = this.nodeMap[reuseName]?.component;
                    if (component && typeof component.update === 'function') {
                        component.update(data);
                    }
                    const el = this.nodeMap[reuseName]?.el;
                    if (el) el.hidden = false;
                    this._visibleNames.push(reuseName);
                    this._hiddenNames.splice(this._hiddenNames.indexOf(reuseName), 1);
                    return component;
                }
            }

            const name = this._createAndRegister(data);
            return name ? this.nodeMap[name]?.component : null;
        },

        insert(index: number, data: Record<string, any>): any {
            const clampedIndex = Math.min(Math.max(0, index), this._visibleNames.length);

            if (!this._itemDestroy) {
                const reuseName = this._findReusableHidden(data.type);
                if (reuseName) {
                    const component = this.nodeMap[reuseName]?.component;
                    if (component && typeof component.update === 'function') {
                        component.update(data);
                    }
                    const el = this.nodeMap[reuseName]?.el;
                    if (el) el.hidden = false;
                    this._visibleNames.splice(clampedIndex, 0, reuseName);
                    this._hiddenNames.splice(this._hiddenNames.indexOf(reuseName), 1);
                    this._insertDOMAt(clampedIndex, el);
                    return component;
                }
            }

            const name = this._createAndRegister(data);
            if (!name) return null;

            this._visibleNames.splice(clampedIndex, 1);
            this._visibleNames.splice(clampedIndex, 0, name);
            this._insertDOMAt(clampedIndex, this.nodeMap[name]?.el);
            return this.nodeMap[name]?.component;
        },

        removeAt(index: number): any {
            if (index < 0 || index >= this._visibleNames.length) return undefined;
            const name = this._visibleNames[index];
            const component = this.nodeMap[name]?.component;
            this._visibleNames.splice(index, 1);

            if (this._itemDestroy) {
                this._destroyItem(name);
            } else {
                const el = this.nodeMap[name]?.el;
                if (el) el.hidden = true;
                this._hiddenNames.push(name);
            }
            return component;
        },

        updateAt(index: number, data: Record<string, any>): void {
            if (index < 0 || index >= this._visibleNames.length) return;
            const name = this._visibleNames[index];
            const component = this.nodeMap[name]?.component;
            if (component && typeof component.update === 'function') component.update(data);
        },

        clear(): void {
            for (const name of this._visibleNames) {
                if (this._itemDestroy) {
                    this._destroyItem(name);
                } else {
                    const el = this.nodeMap[name]?.el;
                    if (el) el.hidden = true;
                    this._hiddenNames.push(name);
                }
            }
            this._visibleNames.length = 0;

            if (this._itemDestroy) {
                for (const name of this._hiddenNames) {
                    this._destroyItem(name);
                }
                this._hiddenNames.length = 0;
            }
        },

        indexOf(instance: any): number {
            for (let i = 0; i < this._visibleNames.length; i++) {
                if (this.nodeMap[this._visibleNames[i]]?.component === instance) return i;
            }
            return -1;
        },

        getAt(index: number): any {
            if (index < 0 || index >= this._visibleNames.length) return null;
            return this.nodeMap[this._visibleNames[index]]?.component ?? null;
        },

        sort(compareFn?: (a: any, b: any) => number): void {
            const defaultCompare = (nameA: string, nameB: string): number => {
                const a = this.nodeMap[nameA]?.component;
                const b = this.nodeMap[nameB]?.component;
                const orderA = a?.order ?? a?.props?.order ?? 0;
                const orderB = b?.order ?? b?.props?.order ?? 0;
                return orderA - orderB;
            };
            this._visibleNames.sort(
                compareFn
                    ? (a: string, b: string) => {
                          const compA = this.nodeMap[a]?.component;
                          const compB = this.nodeMap[b]?.component;
                          return compareFn(compA, compB);
                      }
                    : defaultCompare
            );
            this._flushDOMOrder();
        },

        move(fromIndex: number, toIndex: number): void {
            if (fromIndex < 0 || fromIndex >= this._visibleNames.length) return;
            if (toIndex < 0 || toIndex >= this._visibleNames.length) return;
            if (fromIndex === toIndex) return;
            const [name] = this._visibleNames.splice(fromIndex, 1);
            this._visibleNames.splice(toIndex, 0, name);
            this._flushDOMOrder();
        },

        _createAndRegister(data: Record<string, any>): string | null {
            const itemType = data.type ?? this._itemType;
            if (!itemType) return null;

            const ItemClass = ComponentRegistrar.getInstance().get(itemType);
            if (!ItemClass) return null;

            const mergedEvents = this._mergeEvents(data, itemType);
            const name = data.name ?? getId('item');
            const props = { ...data };
            delete props.name;
            delete props.events;

            const instance = new ItemClass(props);

            this.nodeMap[name] = {
                name,
                el: instance.el,
                component: instance,
                events: mergedEvents,
            };

            this._mountItem(instance);

            if (mergedEvents && Object.keys(mergedEvents).length > 0) {
                this._bindItemNodeEvents(name);
            }

            this._visibleNames.push(name);
            return name;
        },

        _mergeEvents(
            data: Record<string, any>,
            itemType: string
        ): Record<string, DomEventDecl> | undefined {
            const itemEvents = data.events as Record<string, DomEventDecl> | undefined;
            const defaultDef = this._defaultItem[itemType];
            if (!defaultDef?.events && !itemEvents) return undefined;
            if (!defaultDef?.events) return itemEvents;
            if (!itemEvents) return defaultDef.events;

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

        _bindItemNodeEvents(name: string): void {
            const node = this.nodeMap[name];
            if (!node?.component || !node.events) return;

            for (const [domEvent, decl] of Object.entries(node.events)) {
                if (typeof this._bindComponentEvent === 'function') {
                    this._bindComponentEvent(node.component, name, domEvent, decl);
                }
            }
        },

        _unbindItemNodeEvents(name: string): void {
            const node = this.nodeMap[name];
            if (!node?.component) return;

            if (typeof this.onCleanup === 'function') {
                const unsubKey = `_itemUnsub_${name}`;
                const unsub = (this as any)[unsubKey];
                if (typeof unsub === 'function') {
                    unsub();
                    delete (this as any)[unsubKey];
                }
            }
        },

        _findReusableHidden(itemType?: string): string | null {
            if (!itemType) return this._hiddenNames.length > 0 ? this._hiddenNames[0] : null;
            for (const name of this._hiddenNames) {
                const component = this.nodeMap[name]?.component;
                if (component?.type === itemType || component?.constructor?.type === itemType) {
                    return name;
                }
            }
            return null;
        },

        _destroyItem(name: string): void {
            this._unbindItemNodeEvents(name);
            const node = this.nodeMap[name];
            if (node?.component) {
                this._unmountItem(node.component);
            }
            delete this.nodeMap[name];
        },

        _mountItem(instance: any): void {
            if (this._containerEl && instance?.el) this._containerEl.appendChild(instance.el);
        },

        _unmountItem(instance: any): void {
            if (instance?.el) instance.el.remove();
            if (typeof instance?.dispose === 'function') instance.dispose();
        },

        _insertDOMAt(index: number, el?: HTMLElement): void {
            if (!this._containerEl || !el) return;
            const refNode = this._containerEl.children[index];
            if (refNode) this._containerEl.insertBefore(el, refNode);
            else this._containerEl.appendChild(el);
        },

        _applyDirection(): void {
            this.el.classList.remove('q-itemgroup--horizontal', 'q-itemgroup--vertical');
            this.el.classList.add(`q-itemgroup--${this._direction}`);
        },

        _applyGap(): void {
            if (this._containerEl) this._containerEl.style.gap = this._gap || '';
        },

        _flushDOMOrder(): void {
            if (!this._containerEl) return;
            const fragment = document.createDocumentFragment();
            for (const name of this._visibleNames) {
                const el = this.nodeMap[name]?.el;
                if (el) fragment.appendChild(el);
            }
            this._containerEl.appendChild(fragment);
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
            if (this._containerEl) {
                for (const child of Array.from(this._containerEl.children) as HTMLElement[]) {
                    child.hidden = false;
                }
            }
            this.el.classList.remove(
                'q-overflow-scroll',
                'q-overflow-scroll--horizontal',
                'q-overflow-scroll--vertical',
                'q-overflow-scroll--can-prev',
                'q-overflow-scroll--can-next',
                'q-overflow-scroll--overflowing',
                'q-overflow-menu-container',
                'q-overflow-menu-container--horizontal',
                'q-overflow-menu-container--vertical',
                'q-overflow-menu-container--overflowing'
            );
            if (this._containerEl)
                this._containerEl.classList.remove(
                    'q-overflow-scroll__area',
                    'q-overflow-menu__visible'
                );
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
            if (props?.itemType !== undefined) this._itemType = props.itemType;
            if (props?.overflowMode !== undefined) {
                this._overflowMode = props.overflowMode;
                this._applyOverflowMode();
            }
            if (typeof this.onUpdated === 'function') this.onUpdated(props);
        },

        onBeforeDispose(): void {
            this._cleanupOverflow();
            this.clear();
        },
    },
});

export type ItemGroupComponentType = InstanceType<typeof ItemGroupComponent>;
