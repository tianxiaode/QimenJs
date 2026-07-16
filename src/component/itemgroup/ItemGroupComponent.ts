/**
 * ItemGroupComponent 项组组件
 *
 * 轻量排列容器，通过 items 数组管理子组件实例。
 * direction 控制排列方向，itemType 指定子项组件类型。
 *
 * 模板节点（ITEMGROUP_TEMPLATE）：
 * - itemgroup:default — 子项挂载区
 *
 * 核心操作：
 * - add(data) — 添加子项（根据 itemType 自动创建实例）
 * - removeAt(index) — 按索引移除子项
 * - insert(index, data) — 按索引插入子项
 * - setItems(datas) — 批量设置子项（池化复用）
 * - sort() — 按 order 属性排序并刷新 DOM 顺序
 * - items — 子项实例数组（只读）
 *
 * 事件转发机制：
 * - eventKey 作为事件源标识（source），注入子组件
 * - 子组件通过 source=eventKey 触发事件（如 this.emit('click', data, { source: eventKey })）
 * - ItemGroup 通过 handlers 机制监听子组件的 click/close 事件
 * - 转发为自身的 click/close 事件（source=eventKey），附带子项实例和索引信息
 * - 默认内置转发 click 和 close，可通过 events 扩展
 *
 * 组合：TemplateComponent + ITEMGROUP_TEMPLATE
 */

import { TemplateComponent, ComponentRegistrar } from '@qimenjs/component-core';

/** 默认转发的事件类型 */
const DEFAULT_FORWARD_EVENTS = ['click', 'close'];

/**
 * ItemGroup 组件 props
 */
export interface ItemGroupProps {
    /** 排列方向，默认 'horizontal' */
    direction?: 'horizontal' | 'vertical';
    /** 子项组件类型（对应 ComponentRegistrar 中注册的 type） */
    itemType?: string;
    /** 初始子项数据数组 */
    items?: Record<string, any>[];
    /** 子项间距（CSS gap 值），如 '4px'、'0.5em' */
    gap?: string;
    /** 根元素额外 CSS 类名，如 'q-itemgroup--divider q-itemgroup--compact' */
    cls?: string;
    /** 子项挂载区额外 CSS 类名 */
    itemsCls?: string;
    /** 事件源标识，自动注入子组件并作为事件前缀 */
    eventKey?: string;
    /** 需要转发的事件类型，默认 ['click', 'close'] */
    events?: string[];
    /**
     * 从子项实例上提取哪些属性作为事件数据
     *
     * 转发事件时不传组件实例（避免 clone 遍历 getter 报错），
     * 而是从实例上提取指定属性，构建纯数据对象。
     * 例如 itemData: ['text', 'value', 'path'] → { text, value, path, index }
     * 默认不提取任何属性，只附带 index
     */
    itemData?: string[];
}

/**
 * ItemGroupComponent — 项组组件
 *
 * 继承 TemplateComponent + ITEMGROUP_TEMPLATE
 */
export let ItemGroupComponent = class extends TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        children: [
            { tag: 'div', name: 'itemgroup:default', className: 'q-itemgroup__items' },
        ]
    },
    body: {
        type: 'ItemGroup',
    },
}) {
    /** 子项实例池（含隐藏的复用实例） */
    private _pool: any[] = [];

    /** 当前可见数量 */
    private _visibleCount: number = 0;

    /** 排列方向 */
    private _direction: 'horizontal' | 'vertical' = 'horizontal';

    /** 子项组件类型 */
    private _itemType: string = '';

    /** 子项间距 */
    private _gap: string = '';

    /** 挂载区容器 */
    private _containerEl: HTMLElement | null = null;

    /** 事件源标识 */
    private _eventKey: string = '';

    /** 需要转发的事件类型 */
    private _forwardEvents: string[] = [...DEFAULT_FORWARD_EVENTS];

    /** 从子项实例上提取的属性名列表 */
    private _itemData: string[] = [];

    /** 子项事件解绑函数列表 */
    private _itemUnsubscribes: Map<any, Map<string, () => void>> = new Map();

    constructor(props?: ItemGroupProps) {
        super(props);

        this.el.classList.add('q-itemgroup');

        if (props?.direction) this._direction = props.direction;
        if (props?.itemType) this._itemType = props.itemType;
        if (props?.gap) this._gap = props.gap;
        if (props?.eventKey) this._eventKey = props.eventKey;
        if (props?.events) this._forwardEvents = props.events;
        if (props?.itemData) this._itemData = props.itemData;

        this.applyDirection();
        this.applyGap();

        // 应用额外 CSS 类名
        if (props?.cls) {
            this.el.classList.add(...props.cls.split(/\s+/).filter(Boolean));
        }

        // 获取挂载区容器
        this._containerEl = this.nodeMap?.default?.el ?? null;

        // 子项挂载区额外类名
        if (props?.itemsCls && this._containerEl) {
            this._containerEl.classList.add(...props.itemsCls.split(/\s+/).filter(Boolean));
        }

        // 初始子项（走池化逻辑）
        if (props?.items?.length) {
            this.setItems(props.items);
        }
    }

    /** 当前可见的子项实例数组（只读） */
    get items(): readonly any[] {
        return this._pool.slice(0, this._visibleCount);
    }

    /** 完整实例池（含隐藏的复用实例，只读） */
    get pool(): readonly any[] {
        return this._pool;
    }

    /** 当前可见数量 */
    get count(): number {
        return this._visibleCount;
    }

    /** 排列方向 */
    get direction(): 'horizontal' | 'vertical' {
        return this._direction;
    }
    set direction(value: 'horizontal' | 'vertical') {
        this._direction = value;
        this.applyDirection();
    }

    /** 子项组件类型 */
    get itemType(): string {
        return this._itemType;
    }
    set itemType(value: string) {
        this._itemType = value;
    }

    /** 子项间距 */
    get gap(): string {
        return this._gap;
    }
    set gap(value: string) {
        this._gap = value;
        this.applyGap();
    }

    /** 事件源标识 */
    get eventKey(): string {
        return this._eventKey;
    }
    set eventKey(value: string) {
        this._eventKey = value;
    }

    /** 需要转发的事件类型 */
    get forwardEvents(): readonly string[] {
        return this._forwardEvents;
    }

    // ─── 池化核心 ──

    /**
     * 批量设置子项（池化复用）
     *
     * - 复用已有实例，只调用 update 更新属性
     * - 不够才新增
     * - 多余的隐藏，不销毁（下次可复用）
     *
     * 适用于菜单、标签页、行模式等频繁切换数据的场景。
     *
     * @param datas - 子项数据数组
     */
    setItems(datas: Record<string, any>[]): void {
        for (let i = 0; i < datas.length; i++) {
            if (i < this._pool.length) {
                // 复用：只更新属性
                const item = this._pool[i];
                if (typeof item.update === 'function') {
                    item.update(datas[i]);
                }
                item.el.hidden = false;
            } else {
                // 不够：新增
                const instance = this.createItemInstance(datas[i]);
                if (instance) {
                    this._pool.push(instance);
                    this.mountItem(instance);
                    this.bindItemEvents(instance);
                }
            }
        }

        // 多余：隐藏
        for (let i = datas.length; i < this._pool.length; i++) {
            this._pool[i].el.hidden = true;
        }

        this._visibleCount = datas.length;
    }

    // ─── 单项操作 ──

    /**
     * 添加子项
     *
     * 根据 itemType 从 ComponentRegistrar 查找组件类并创建实例，
     * 挂载到容器末尾。
     *
     * @param data - 子项数据，作为 props 传入组件构造函数
     * @returns 创建的子项实例
     */
    add(data: Record<string, any>): any {
        const instance = this.createItemInstance(data);
        if (!instance) return null;

        this._pool.push(instance);
        this._visibleCount = this._pool.length;
        this.mountItem(instance);
        this.bindItemEvents(instance);
        return instance;
    }

    /**
     * 按索引插入子项
     *
     * @param index - 插入位置（基于可见项的索引）
     * @param data - 子项数据
     * @returns 创建的子项实例
     */
    insert(index: number, data: Record<string, any>): any {
        const instance = this.createItemInstance(data);
        if (!instance) return null;

        const clampedIndex = Math.min(Math.max(0, index), this._visibleCount);
        this._pool.splice(clampedIndex, 0, instance);
        this._visibleCount++;

        // DOM 插入
        if (this._containerEl) {
            const refNode = this._containerEl.children[clampedIndex];
            if (refNode) {
                this._containerEl.insertBefore(instance.el, refNode);
            } else {
                this._containerEl.appendChild(instance.el);
            }
        }

        this.bindItemEvents(instance);
        return instance;
    }

    /**
     * 按索引移除子项
     *
     * @param index - 移除位置（基于可见项的索引）
     * @param destroy - 是否销毁实例（默认 true），false 时只隐藏保留在池中
     * @returns 被移除的子项实例，或 undefined
     */
    removeAt(index: number, destroy: boolean = true): any {
        if (index < 0 || index >= this._visibleCount) return undefined;

        const instance = this._pool[index];

        if (destroy) {
            this._pool.splice(index, 1);
            this._visibleCount--;
            this.unbindItemEvents(instance);
            this.unmountItem(instance);
        } else {
            // 不销毁，只隐藏，保留在池中供 setItems 复用
            instance.el.hidden = true;
            // 从可见位置移到池末尾
            this._pool.splice(index, 1);
            this._pool.push(instance);
            this._visibleCount--;
        }

        return instance;
    }

    /**
     * 按索引更新子项
     *
     * @param index - 可见项索引
     * @param data - 要更新的属性
     */
    updateAt(index: number, data: Record<string, any>): void {
        if (index < 0 || index >= this._visibleCount) return;
        const item = this._pool[index];
        if (typeof item.update === 'function') {
            item.update(data);
        }
    }

    /**
     * 移除所有子项（销毁所有池中实例）
     */
    clear(): void {
        for (const instance of this._pool) {
            this.unbindItemEvents(instance);
            this.unmountItem(instance);
        }
        this._pool.length = 0;
        this._visibleCount = 0;
    }

    /**
     * 根据实例查找可见项索引
     */
    indexOf(instance: any): number {
        return this._pool.slice(0, this._visibleCount).indexOf(instance);
    }

    /**
     * 按可见索引获取子项实例
     */
    getAt(index: number): any {
        if (index < 0 || index >= this._visibleCount) return null;
        return this._pool[index];
    }

    // ─── 排序 ──

    /**
     * 按 order 属性排序并刷新 DOM 顺序
     *
     * 子项数据中可包含 order 字段（数字），调用此方法后：
     * 1. 按 order 升序重排池数组
     * 2. 一次性按新顺序重排容器内 DOM
     *
     * 拖拽排序场景：更新各实例的 order 值后调 sort() 即可。
     *
     * @param compareFn - 可选自定义排序函数，默认按 order 升序
     */
    sort(compareFn?: (a: any, b: any) => number): void {
        const defaultCompare = (a: any, b: any): number => {
            const orderA = a.order ?? a.props?.order ?? 0;
            const orderB = b.order ?? b.props?.order ?? 0;
            return orderA - orderB;
        };

        this._pool.sort(compareFn ?? defaultCompare);
        this.flushDOMOrder();
    }

    /**
     * 移动子项到新位置
     *
     * @param fromIndex - 原位置（可见项索引）
     * @param toIndex - 目标位置（可见项索引）
     */
    move(fromIndex: number, toIndex: number): void {
        if (fromIndex < 0 || fromIndex >= this._visibleCount) return;
        if (toIndex < 0 || toIndex >= this._visibleCount) return;
        if (fromIndex === toIndex) return;

        const [item] = this._pool.splice(fromIndex, 1);
        this._pool.splice(toIndex, 0, item);
        this.flushDOMOrder();
    }

    // ─── 事件转发 ──

    // ─── 内部方法 ──

    /**
     * 创建子项实例
     *
     * 自动注入 eventKey 到子组件 props，子组件通过 eventKey 触发事件。
     */
    private createItemInstance(data: Record<string, any>): any {
        if (!this._itemType) return null;

        const ItemClass = ComponentRegistrar.getInstance().get(this._itemType);
        if (!ItemClass) return null;

        // 注入 eventKey 到子组件
        const props = { ...data };
        if (this._eventKey) {
            props.eventKey = this._eventKey;
        }

        return new ItemClass(props);
    }

    /**
     * 绑定子组件事件转发
     *
     * 监听子组件的 click/close 等事件（组件级事件，非 DOM 事件），
     * 通过 onForwardEvent 方法处理转发逻辑。
     * DOM 事件有 dom: 前缀，组件 emit 的事件无前缀，不会冲突。
     */
    private bindItemEvents(instance: any): void {
        if (!this._eventKey || typeof instance.on !== 'function') return;

        this.logger.debug('[ItemGroup] bindItemEvents, eventKey =', this._eventKey, 'forwardEvents =', this._forwardEvents);

        const unsubMap = new Map<string, () => void>();
        // 记录子组件的 scopeId，用于过滤：只转发来自子组件的事件，忽略自身 emit 的
        const childScopeId = instance.eventScope?.getScopeId?.();

        for (const event of this._forwardEvents) {
            const unsub = instance.on(event, (data: any) => {
                // scopeId 过滤：只转发来自子组件 scopeId 的事件
                // 避免收到自身 emit 的同名事件导致循环
                if (childScopeId && data?.scopeId && data.scopeId !== childScopeId) {
                    return;
                }
                const index = this.indexOf(instance);
                this.logger.debug('[ItemGroup] forwarding event =', event, 'index =', index);
                this.onForwardEvent(event, {
                    ...data?.data,
                    ...this._extractItemData(instance, index),
                });
            });
            unsubMap.set(event, unsub);
        }

        this._itemUnsubscribes.set(instance, unsubMap);
    }

    /**
     * 子组件事件转发处理
     *
     * 当子组件触发转发事件时调用。默认行为是 emit 为自身的同名事件（source=eventKey）。
     * 子类可重写此方法，直接处理事件而不再 emit，避免全局 EventBus 上的事件名冲突。
     *
     * @param event - 事件类型（如 'click', 'close'）
     * @param data - 事件数据（含子项属性和 index）
     */
    protected onForwardEvent(event: string, data: Record<string, any>): void {
        this.emit(event, data, { source: this._eventKey || undefined });
    }

    /**
     * 解绑子组件事件转发
     */
    private unbindItemEvents(instance: any): void {
        const unsubMap = this._itemUnsubscribes.get(instance);
        if (!unsubMap) return;

        for (const unsub of unsubMap.values()) {
            if (typeof unsub === 'function') unsub();
        }

        this._itemUnsubscribes.delete(instance);
    }

    /**
     * 从子项实例提取事件数据
     *
     * 根据 itemData 配置从实例上提取指定属性，构建纯数据对象。
     * 始终附带 index，避免直接传组件实例（clone 会遍历 getter 报错）。
     */
    protected _extractItemData(instance: any, index: number): Record<string, any> {
        const result: Record<string, any> = { index };

        for (const key of this._itemData) {
            const value = instance[key];
            // 只提取原始值，跳过函数和组件实例
            if (value !== undefined && typeof value !== 'function' && !(value?.el)) {
                result[key] = value;
            }
        }

        return result;
    }

    /**
     * 挂载子项到容器
     */
    private mountItem(instance: any): void {
        if (this._containerEl && instance?.el) {
            this._containerEl.appendChild(instance.el);
        }
    }

    /**
     * 卸载子项并销毁
     */
    private unmountItem(instance: any): void {
        if (instance?.el) {
            instance.el.remove();
        }
        if (typeof instance?.dispose === 'function') {
            instance.dispose();
        }
    }

    /**
     * 应用排列方向
     */
    private applyDirection(): void {
        this.el.classList.remove('q-itemgroup--horizontal', 'q-itemgroup--vertical');
        this.el.classList.add(`q-itemgroup--${this._direction}`);
    }

    /**
     * 应用间距
     */
    private applyGap(): void {
        if (this._containerEl) {
            this._containerEl.style.gap = this._gap || '';
        }
    }

    /**
     * 按 DOM 顺序刷新容器内所有子元素
     *
     * 一次性按池数组顺序重排，避免多次 insertBefore 造成的性能问题。
     */
    private flushDOMOrder(): void {
        if (!this._containerEl) return;

        const fragment = document.createDocumentFragment();
        for (const instance of this._pool) {
            if (instance?.el) {
                fragment.appendChild(instance.el);
            }
        }
        this._containerEl.appendChild(fragment);
    }

    update(props?: Record<string, any>): void {
        if (props?.direction !== undefined) {
            this._direction = props.direction;
            this.applyDirection();
        }
        if (props?.gap !== undefined) {
            this._gap = props.gap;
            this.applyGap();
        }
        if (props?.itemType !== undefined) {
            this._itemType = props.itemType;
        }
        if (props?.eventKey !== undefined) {
            this._eventKey = props.eventKey;
        }
    }

    dispose(): void {
        this.clear();
        this._itemUnsubscribes.clear();
        super.dispose();
    }
};

export type ItemGroupComponent = InstanceType<typeof ItemGroupComponent>;
