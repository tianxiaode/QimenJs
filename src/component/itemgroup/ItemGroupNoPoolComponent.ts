/**
 * ItemGroupNoPoolComponent 不使用池化的项组组件
 *
 * 轻量排列容器，通过 items 数组管理子组件实例。
 * 子项注册进 nodeMap，事件转发由 EventForwardAbility 统一处理。
 * 不使用池化机制，每次操作都会创建或销毁组件实例。
 *
 * 核心设计：
 * - defaultItem：按 type 索引的 TplNode 默认定义，子项创建时深合并
 * - _visibleNames：有序可见 name 列表，控制 DOM 顺序和数据映射
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

export let ItemGroupNoPoolComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-itemgroup',
        children: [{ tag: 'div', name: 'itemContainer', cls: 'q-itemgroup__items' }],
    },
    body: {
        type: 'ItemGroupNoPool',

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
            return true; // 不使用池化，总是销毁
        },
        get overflowMode(): OverflowMode {
            return this._overflowMode;
        },
        set overflowMode(value: OverflowMode) {
            this._overflowMode = value;
            this._applyOverflowMode();
        },

        setItems(datas: Record<string, any>[]): void {
            // 先销毁所有现有项
            for (const name of this._visibleNames) {
                this._destroyItem(name);
            }
            this._visibleNames.length = 0;

            // 创建新项
            for (let i = 0; i < datas.length; i++) {
                this._createAndRegister(datas[i]);
            }
        },

        add(data: Record<string, any>): any {
            const name = this._createAndRegister(data);
            return name ? this.nodeMap[name]?.component : null;
        },

        insert(index: number, data: Record<string, any>): any {
            const clampedIndex = Math.min(Math.max(0, index), this._visibleNames.length);
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
            this._destroyItem(name);
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
                this._destroyItem(name);
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
    },
}).with([ItemGroupAbility]);

export type ItemGroupNoPoolComponentType = InstanceType<typeof ItemGroupNoPoolComponent>;
