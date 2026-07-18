/**
 * ItemGroupComponent 项组组件
 *
 * 轻量排列容器，通过 items 数组管理子组件实例。
 * 行为内聚于类本身，派生组件通过 withTemplate 覆盖模板，
 * 通过 extends 继承池化、事件转发等逻辑。
 *
 * 模板节点：
 * - items — 子项挂载区
 */

import { TemplateComponent, ComponentRegistrar } from '@qimenjs/component-core';

export type OverflowMode = 'none' | 'scroll' | 'menu';

export interface ItemGroupConfig {
    direction?: 'horizontal' | 'vertical';
    itemType?: string;
    items?: Record<string, any>[];
    gap?: string;
    eventKey?: string;
    events?: string[];
    itemData?: string[];
    overflowMode?: OverflowMode;
}

export interface ItemGroupProps extends ItemGroupConfig {
    cls?: string;
    itemsCls?: string;
}

const DEFAULT_FORWARD_EVENTS = ['click', 'close'];

export class ItemGroupComponent extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        children: [{ tag: 'div', name: 'items', className: 'q-itemgroup__items' }],
    },
    body: {
        type: 'ItemGroup',

        _pool: [],
        _visibleCount: 0,
        _direction: 'horizontal' as 'horizontal' | 'vertical',
        _itemType: '',
        _gap: '',
        _containerEl: null as HTMLElement | null,
        _eventKey: '',
        _forwardEvents: [...DEFAULT_FORWARD_EVENTS],
        _itemData: [] as string[],
        _itemUnsubscribes: new Map<any, Map<string, () => void>>(),
        _overflowMode: 'none' as OverflowMode,

        _initItemGroupComponent(props?: ItemGroupProps): void {
            this.el.classList.add('q-itemgroup');

            if (props?.cls) {
                this.el.classList.add(...props.cls.split(/\s+/).filter(Boolean));
            }

            this._containerEl = this.nodeMap?.items?.el ?? null;

            if (props?.itemsCls && this._containerEl) {
                this._containerEl.classList.add(...props.itemsCls.split(/\s+/).filter(Boolean));
            }

            if (props?.direction) this._direction = props.direction;
            if (props?.itemType) this._itemType = props.itemType;
            if (props?.gap) this._gap = props.gap;
            if (props?.eventKey) this._eventKey = props.eventKey;
            if (props?.events) this._forwardEvents = props.events;
            if (props?.itemData) this._itemData = props.itemData;
            if (props?.overflowMode) this._overflowMode = props.overflowMode;

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
            return this._pool.slice(0, this._visibleCount);
        },
        get pool(): readonly any[] {
            return this._pool;
        },
        get count(): number {
            return this._visibleCount;
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
        get eventKey(): string {
            return this._eventKey;
        },
        set eventKey(value: string) {
            this._eventKey = value;
        },
        get forwardEvents(): readonly string[] {
            return this._forwardEvents;
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
                if (i < this._pool.length) {
                    const item = this._pool[i];
                    if (typeof item.update === 'function') item.update(datas[i]);
                    item.el.hidden = false;
                } else {
                    const instance = this._createItemInstance(datas[i]);
                    if (instance) {
                        this._pool.push(instance);
                        this._mountItem(instance);
                        this._bindItemEvents(instance);
                    }
                }
            }
            for (let i = datas.length; i < this._pool.length; i++) {
                this._pool[i].el.hidden = true;
            }
            this._visibleCount = datas.length;
        },

        add(data: Record<string, any>): any {
            const instance = this._createItemInstance(data);
            if (!instance) return null;
            this._pool.push(instance);
            this._visibleCount = this._pool.length;
            this._mountItem(instance);
            this._bindItemEvents(instance);
            return instance;
        },

        insert(index: number, data: Record<string, any>): any {
            const instance = this._createItemInstance(data);
            if (!instance) return null;
            const clampedIndex = Math.min(Math.max(0, index), this._visibleCount);
            this._pool.splice(clampedIndex, 0, instance);
            this._visibleCount++;
            if (this._containerEl) {
                const refNode = this._containerEl.children[clampedIndex];
                if (refNode) this._containerEl.insertBefore(instance.el, refNode);
                else this._containerEl.appendChild(instance.el);
            }
            this._bindItemEvents(instance);
            return instance;
        },

        removeAt(index: number, destroy: boolean = true): any {
            if (index < 0 || index >= this._visibleCount) return undefined;
            const instance = this._pool[index];
            if (destroy) {
                this._pool.splice(index, 1);
                this._visibleCount--;
                this._unbindItemEvents(instance);
                this._unmountItem(instance);
            } else {
                instance.el.hidden = true;
                this._pool.splice(index, 1);
                this._pool.push(instance);
                this._visibleCount--;
            }
            return instance;
        },

        updateAt(index: number, data: Record<string, any>): void {
            if (index < 0 || index >= this._visibleCount) return;
            const item = this._pool[index];
            if (typeof item.update === 'function') item.update(data);
        },

        clear(): void {
            for (const instance of this._pool) {
                this._unbindItemEvents(instance);
                this._unmountItem(instance);
            }
            this._pool.length = 0;
            this._visibleCount = 0;
        },

        indexOf(instance: any): number {
            return this._pool.slice(0, this._visibleCount).indexOf(instance);
        },

        getAt(index: number): any {
            if (index < 0 || index >= this._visibleCount) return null;
            return this._pool[index];
        },

        sort(compareFn?: (a: any, b: any) => number): void {
            const defaultCompare = (a: any, b: any): number => {
                const orderA = a.order ?? a.props?.order ?? 0;
                const orderB = b.order ?? b.props?.order ?? 0;
                return orderA - orderB;
            };
            this._pool.sort(compareFn ?? defaultCompare);
            this._flushDOMOrder();
        },

        move(fromIndex: number, toIndex: number): void {
            if (fromIndex < 0 || fromIndex >= this._visibleCount) return;
            if (toIndex < 0 || toIndex >= this._visibleCount) return;
            if (fromIndex === toIndex) return;
            const [item] = this._pool.splice(fromIndex, 1);
            this._pool.splice(toIndex, 0, item);
            this._flushDOMOrder();
        },

        onForwardEvent(event: string, data: Record<string, any>): void {
            this.emit(event, data, { source: this._eventKey || undefined });
        },

        _createItemInstance(data: Record<string, any>): any {
            if (!this._itemType) return null;
            const ItemClass = ComponentRegistrar.getInstance().get(this._itemType);
            if (!ItemClass) return null;
            const props = { ...data };
            if (this._eventKey) props.eventKey = this._eventKey;
            return new ItemClass(props);
        },

        _bindItemEvents(instance: any): void {
            if (!this._eventKey || typeof instance.on !== 'function') return;
            const unsubMap = new Map<string, () => void>();
            const childScopeId = instance.eventScope?.getScopeId?.();
            for (const event of this._forwardEvents) {
                const unsub = instance.on(event, (data: any) => {
                    if (childScopeId && data?.scopeId && data.scopeId !== childScopeId) return;
                    const index = this.indexOf(instance);
                    this.onForwardEvent(event, {
                        ...data?.data,
                        ...this._extractItemData(instance, index),
                    });
                });
                unsubMap.set(event, unsub);
            }
            this._itemUnsubscribes.set(instance, unsubMap);
        },

        _unbindItemEvents(instance: any): void {
            const unsubMap = this._itemUnsubscribes.get(instance);
            if (!unsubMap) return;
            for (const unsub of unsubMap.values()) {
                if (typeof unsub === 'function') unsub();
            }
            this._itemUnsubscribes.delete(instance);
        },

        _extractItemData(instance: any, index: number): Record<string, any> {
            const result: Record<string, any> = { index };
            for (const key of this._itemData) {
                const value = instance[key];
                if (value !== undefined && typeof value !== 'function' && !value?.el)
                    result[key] = value;
            }
            return result;
        },

        _mountItem(instance: any): void {
            if (this._containerEl && instance?.el) this._containerEl.appendChild(instance.el);
        },

        _unmountItem(instance: any): void {
            if (instance?.el) instance.el.remove();
            if (typeof instance?.dispose === 'function') instance.dispose();
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
            for (const instance of this._pool) {
                if (instance?.el) fragment.appendChild(instance.el);
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
            if (props?.eventKey !== undefined) this._eventKey = props.eventKey;
            if (props?.overflowMode !== undefined) {
                this._overflowMode = props.overflowMode;
                this._applyOverflowMode();
            }
        },

        dispose(): void {
            this._cleanupOverflow();
            this.clear();
            this._itemUnsubscribes.clear();
            super.dispose();
        },
    },
}) {
    constructor(props?: ItemGroupProps) {
        super(props);
        this._initItemGroupComponent(props);
    }
}

export type ItemGroupComponentType = InstanceType<typeof ItemGroupComponent>;
