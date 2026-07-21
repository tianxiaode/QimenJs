/**
 * ItemGroupWithPoolComponent 使用池化的项组组件
 *
 * 轻量排列容器，通过 items 数组管理子组件实例。
 * 子项注册进 nodeMap，事件转发由 EventForwardAbility 统一处理。
 * 使用池化机制，隐藏的项会被保留以复用，提高性能。
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

import { TemplateComponent } from '@qimenjs/component-core';
import { ItemGroupAbility } from './ItemGroupAbility';

export type OverflowMode = 'none' | 'scroll' | 'menu';

export type DefaultItemDef = Record<string, any>;

export type DefaultItemConfig = DefaultItemDef | Record<string, DefaultItemDef>;

export interface ItemGroupConfig {
    direction?: 'horizontal' | 'vertical';
    itemType?: string;
    items?: Record<string, any>[];
    gap?: string;
    defaultItem?: DefaultItemConfig;
    overflowMode?: OverflowMode;
}

export interface ItemGroupProps extends ItemGroupConfig {
    cls?: string;
    itemsCls?: string;
}

export let ItemGroupWithPoolComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-itemgroup',
        children: [{ tag: 'div', name: 'itemContainer', cls: 'q-itemgroup__items' }],
    },
    body: {
        type: 'ItemGroupWithPool',

        onAfterInit(props?: ItemGroupProps): void {
            this.initItemGroup(props);
        },

        get items() {
            return this._visibleNames
                .map((name: string) => this.nodeMap[name]?.component)
                .filter(Boolean);
        },
        get count() {
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
            return false; // 使用池化，不销毁
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

            // 隐藏多余的项
            for (let i = datas.length; i < this._visibleNames.length; i++) {
                const name = this._visibleNames[i];
                const el = this.nodeMap[name]?.el;
                if (el) el.hidden = true;
                this._hiddenNames.push(name);
            }
            this._visibleNames.length = datas.length;
        },

        add(data: Record<string, any>): any {
            // 尝试复用隐藏的项
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

            // 没有可复用的项，创建新项
            const name = this._createAndRegister(data);
            return name ? this.nodeMap[name]?.component : null;
        },

        insert(index: number, data: Record<string, any>): any {
            const clampedIndex = Math.min(Math.max(0, index), this._visibleNames.length);

            // 尝试复用隐藏的项
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

            // 没有可复用的项，创建新项
            const name = this._createAndRegister(data);
            if (!name) return null;

            this._visibleNames.splice(clampedIndex, 0, name);
            this._insertDOMAt(clampedIndex, this.nodeMap[name]?.el);
            return this.nodeMap[name]?.component;
        },

        removeAt(index: number): any {
            if (index < 0 || index >= this._visibleNames.length) return undefined;
            const name = this._visibleNames[index];
            const component = this.nodeMap[name]?.component;
            this._visibleNames.splice(index, 1);

            // 不销毁，而是隐藏并加入池化列表
            const el = this.nodeMap[name]?.el;
            if (el) el.hidden = true;
            this._hiddenNames.push(name);
            return component;
        },

        updateAt(index: number, data: Record<string, any>): void {
            if (index < 0 || index >= this._visibleNames.length) return;
            const name = this._visibleNames[index];
            const component = this.nodeMap[name]?.component;
            if (component && typeof component.update === 'function') component.update(data);
        },

        clear(): void {
            // 隐藏所有项
            for (const name of this._visibleNames) {
                const el = this.nodeMap[name]?.el;
                if (el) el.hidden = true;
                this._hiddenNames.push(name);
            }
            this._visibleNames.length = 0;
        },

        indexOf(instance: any): number {
            for (let i = 0; i < this._visibleNames.length; i++) {
                if (this.nodeMap[this._visibleNames[i]]?.component === instance) return i;
            }
            return -1;
        },

        getAt(index: number): any {
            if (index < 0 || index >= this._visibleNames.length) return null;
            return this.nodeMap[this._visibleNames[index]]?.component;
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

        // 查找可复用的隐藏项
        protected _findReusableHidden(itemType?: string): string | null {
            if (!itemType) return this._hiddenNames.length > 0 ? this._hiddenNames[0] : null;
            for (const name of this._hiddenNames) {
                const component = this.nodeMap[name]?.component;
                if (component?.type === itemType || component?.constructor?.type === itemType) {
                    return name;
                }
            }
            return null;
        },
    },
}).with([ItemGroupAbility]);

export type ItemGroupWithPoolComponentType = InstanceType<typeof ItemGroupWithPoolComponent>;
