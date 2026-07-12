/**
 * ChildrenAbility 子组件管理能力
 *
 * 提供子组件的增删查改操作，参考 ExtJS 的 Container API。
 * 支持事件通知：childadd / childremove / childmove / childrenchange
 *
 * add(layout) 方法拆解 LayoutNode JSON 递归创建子组件，
 * 是内部递归渲染模型的核心入口。
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import type { LayoutNode, HandlerConfig, StateTrigger } from '@qimenjs/layout';
import { CHILDREN_EVENTS } from '@qimenjs/events';
import { ComponentRegistrar } from '@qimenjs/component-core';

/**
 * 子组件类型
 *
 * 使用 any 而非 ComponentLike 避免对 component 包的循环依赖。
 * 实际运行时 this 指向 ComponentLike 实例。
 */
type ComponentLike = any;

/**
 * PositionProps 中的 key 列表，用于从 LayoutNode 提取定位属性
 */
const POSITION_KEYS = [
    'x', 'y', 'top', 'left', 'bottom', 'right',
    'width', 'height',
    'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'margin', 'padding',
    'scrollable', 'center', 'hideMode', 'alwaysOnTop', 'fullscreen',
    'shadow', 'focused', 'tabIndex', 'zIndex',
] as const;

/**
 * 保留字 key 集合 — 这些字段不作为 props 传递
 */
const RESERVED_KEYS = new Set([
    'type', 'id', 'template', 'tag', 'field', 'children',
    'abilities', 'handlers', 'extraFns', 'meta', 'lifecycle',
    'stateTriggers', 'visible', 'repeat', 'responsive', 'props',
    'entity', 'permission',
    // StyleProps
    'className', 'style',
    // AccessibilityProps
    'role', 'ariaLabel', 'ariaDescribedBy', 'ariaLabelledBy', 'ariaHidden',
    'ariaDisabled', 'ariaExpanded', 'ariaSelected', 'ariaPressed', 'ariaRequired',
    'ariaInvalid', 'ariaLive', 'ariaControls', 'ariaOwns', 'ariaHasPopup',
    'ariaCurrent', 'ariaLevel', 'ariaValueText', 'ariaValueMin', 'ariaValueMax',
    'ariaValueNow', 'ariaModal', 'ariaReadOnly', 'ariaAutoComplete', 'ariaErrorMessage',
    'ariaRowCount', 'ariaColCount', 'ariaRowIndex', 'ariaColIndex', 'ariaRowSpan',
    'ariaColSpan', 'ariaSetSize', 'ariaPosInSet',
    // TooltipProps
    'tooltip', 'tooltipPlacement', 'tooltipOffset', 'tooltipShowDelay',
    'tooltipHideDelay', 'tooltipMaxWidth',
    // AnimationProps
    'enterAnimation', 'enterAnimationOptions', 'leaveAnimation',
    'leaveAnimationOptions', 'animationEnabled',
    // PositionProps
    ...POSITION_KEYS,
]);

export const ChildrenAbility: AbilityDefinition = {
    /**
     * 子组件列表
     */
    children: {
        get(): ComponentLike[] {
            return this.abilityState('ChildrenAbility:list', () => []);
        },
    },

    /**
     * 子组件数量
     */
    childCount: {
        get(): number {
            return this.children.length;
        },
    },

    // ============================================
    // Layout 渲染
    // ============================================

    /**
     * 从 LayoutNode JSON 创建并挂载子组件
     *
     * 解析 Layout 定义，递归创建组件树。
     * 每层只负责自己的直接子节点，子的子由子自己负责。
     *
     * 处理顺序：创建实例 → 挂载 → PositionProps → abilities →
     *           extraFns → meta → handlers → stateTriggers → children 递归
     *
     * @param layout - LayoutNode 定义
     * @returns 创建的子组件实例
     */
    add(layout: LayoutNode): ComponentLike {
        // 1. 从 ComponentRegistrar 查找组件类
        const ComponentClass = ComponentRegistrar.getInstance().get(layout.type);
        if (!ComponentClass) {
            console.warn(`ChildrenAbility.add: Component type "${layout.type}" not registered`);
            return null;
        }

        // 2. 合并 props（非保留字的顶层属性 + layout.props + id/type/template/tag）
        const props: Record<string, any> = { ...(layout as any).props };
        if (layout.id) props.id = layout.id;
        if (layout.type) props.type = layout.type;
        if (layout.template) props.template = layout.template;
        if (layout.tag) props.tag = layout.tag;
        if (layout.field) props.field = layout.field;

        // 收集非保留字的顶层属性作为 props
        for (const key of Object.keys(layout as any)) {
            if (!RESERVED_KEYS.has(key) && props[key] === undefined) {
                props[key] = (layout as any)[key];
            }
        }

        // 3. 创建组件实例（withTemplate 强类构造时已自动完成初始化）
        const child = new ComponentClass(props);

        // 4. 非 withTemplate 组件需要手动初始化
        if (!child.el) {
            if (layout.tag) child.tag = layout.tag;
            child.type = layout.type;
            child.initElement();
        }

        // 5. 挂载到父 el + addChild
        if (this.el && child.el) {
            this.el.appendChild(child.el);
        }
        this.addChild(child);

        // 6. 注入 abilities（展开后逐个注入组件实例）
        if (layout.abilities) {
            child.setupAbilities(layout.abilities);
        }

        // 7. 注入 extraFns（bind this 后挂到实例）
        if (layout.extraFns) {
            for (const [name, fn] of Object.entries(layout.extraFns)) {
                Object.defineProperty(child, name, {
                    value: fn.bind(child),
                    writable: true,
                    configurable: true,
                    enumerable: true,
                });
            }
        }

        // 8. 注入 meta（纯数据，this.meta.xxx 访问）
        if (layout.meta) {
            child.meta = { ...layout.meta };
        }

        // 9. 赋值 PositionProps（直接赋给 setter，触发 el.style 操作）
        const c = child as any;
        for (const key of POSITION_KEYS) {
            if ((layout as any)[key] !== undefined) {
                c[key] = (layout as any)[key];
            }
        }

        // StyleProps
        if (layout.className !== undefined) c.className = layout.className;
        if (layout.style !== undefined) c.style = layout.style;

        // AccessibilityProps
        if (layout.role !== undefined) c.role = layout.role;
        if (layout.ariaLabel !== undefined) c.ariaLabel = layout.ariaLabel;
        if (layout.ariaDescribedBy !== undefined) c.ariaDescribedBy = layout.ariaDescribedBy;
        if (layout.ariaLabelledBy !== undefined) c.ariaLabelledBy = layout.ariaLabelledBy;
        if (layout.ariaHidden !== undefined) c.ariaHidden = layout.ariaHidden;
        if (layout.ariaDisabled !== undefined) c.ariaDisabled = layout.ariaDisabled;
        if (layout.ariaExpanded !== undefined) c.ariaExpanded = layout.ariaExpanded;
        if (layout.ariaSelected !== undefined) c.ariaSelected = layout.ariaSelected;
        if (layout.ariaPressed !== undefined) c.ariaPressed = layout.ariaPressed;
        if (layout.ariaRequired !== undefined) c.ariaRequired = layout.ariaRequired;
        if (layout.ariaInvalid !== undefined) c.ariaInvalid = layout.ariaInvalid;
        if (layout.ariaLive !== undefined) c.ariaLive = layout.ariaLive;
        if (layout.ariaControls !== undefined) c.ariaControls = layout.ariaControls;
        if (layout.ariaOwns !== undefined) c.ariaOwns = layout.ariaOwns;
        if (layout.ariaHasPopup !== undefined) c.ariaHasPopup = layout.ariaHasPopup;
        if (layout.ariaCurrent !== undefined) c.ariaCurrent = layout.ariaCurrent;
        if (layout.ariaLevel !== undefined) c.ariaLevel = layout.ariaLevel;
        if (layout.ariaValueText !== undefined) c.ariaValueText = layout.ariaValueText;
        if (layout.ariaValueMin !== undefined) c.ariaValueMin = layout.ariaValueMin;
        if (layout.ariaValueMax !== undefined) c.ariaValueMax = layout.ariaValueMax;
        if (layout.ariaValueNow !== undefined) c.ariaValueNow = layout.ariaValueNow;
        if (layout.ariaModal !== undefined) c.ariaModal = layout.ariaModal;
        if (layout.ariaReadOnly !== undefined) c.ariaReadOnly = layout.ariaReadOnly;
        if (layout.ariaAutoComplete !== undefined) c.ariaAutoComplete = layout.ariaAutoComplete;
        if (layout.ariaErrorMessage !== undefined) c.ariaErrorMessage = layout.ariaErrorMessage;
        if (layout.ariaRowCount !== undefined) c.ariaRowCount = layout.ariaRowCount;
        if (layout.ariaColCount !== undefined) c.ariaColCount = layout.ariaColCount;
        if (layout.ariaRowIndex !== undefined) c.ariaRowIndex = layout.ariaRowIndex;
        if (layout.ariaColIndex !== undefined) c.ariaColIndex = layout.ariaColIndex;
        if (layout.ariaRowSpan !== undefined) c.ariaRowSpan = layout.ariaRowSpan;
        if (layout.ariaColSpan !== undefined) c.ariaColSpan = layout.ariaColSpan;
        if (layout.ariaSetSize !== undefined) c.ariaSetSize = layout.ariaSetSize;
        if (layout.ariaPosInSet !== undefined) c.ariaPosInSet = layout.ariaPosInSet;

        // TooltipProps
        if (layout.tooltip !== undefined) c.tooltip = layout.tooltip;
        if (layout.tooltipPlacement !== undefined) c.tooltipPlacement = layout.tooltipPlacement;
        if (layout.tooltipOffset !== undefined) c.tooltipOffset = layout.tooltipOffset;
        if (layout.tooltipShowDelay !== undefined) c.tooltipShowDelay = layout.tooltipShowDelay;
        if (layout.tooltipHideDelay !== undefined) c.tooltipHideDelay = layout.tooltipHideDelay;
        if (layout.tooltipMaxWidth !== undefined) c.tooltipMaxWidth = layout.tooltipMaxWidth;

        // AnimationProps
        if (layout.enterAnimation !== undefined) c.enterAnimation = layout.enterAnimation;
        if (layout.enterAnimationOptions !== undefined) c.enterAnimationOptions = layout.enterAnimationOptions;
        if (layout.leaveAnimation !== undefined) c.leaveAnimation = layout.leaveAnimation;
        if (layout.leaveAnimationOptions !== undefined) c.leaveAnimationOptions = layout.leaveAnimationOptions;
        if (layout.animationEnabled !== undefined) c.animationEnabled = layout.animationEnabled;

        // PermissionProps
        if (layout.permission !== undefined) c.permission = layout.permission;

        // EntityProps
        if (layout.entity) {
            const manager = new layout.entity();
            child.mgr = manager;
            child.onCleanup(() => manager.dispose());
        }

        // 剩余 props
        if (layout.props) {
            for (const [key, value] of Object.entries(layout.props)) {
                child.setProp(key, value);
            }
        }

        // 10. 绑定 handlers
        if (layout.handlers) {
            this._bindChildHandlers(child, layout.handlers);
        }

        // 11. 绑定 stateTriggers
        if (layout.stateTriggers) {
            this._bindChildStateTriggers(child, layout.stateTriggers);
        }

        // 12. 生命周期钩子
        if (layout.lifecycle) {
            if (layout.lifecycle.onMounted) {
                layout.lifecycle.onMounted.call(child);
            }
        }

        // 13. 注册到 ComponentRegistrar
        if (layout.id) {
            child.id = layout.id;
        }
        ComponentRegistrar.getInstance().registerInstance(child);

        // 14. 递归渲染子节点
        if (layout.children) {
            for (const childLayout of layout.children) {
                child.add(childLayout);
            }
        }

        return child;
    },

    /**
     * 绑定子组件的 handlers
     */
    _bindChildHandlers(child: ComponentLike, handlers: NonNullable<LayoutNode['handlers']>): void {
        for (const [semantic, handlerDef] of Object.entries(handlers)) {
            const resolved = this._resolveChildHandler(child, handlerDef);
            if (!resolved) continue;

            if (typeof child.bind === 'function') {
                child.bind(child.el, semantic as any, { handler: resolved });
            }
        }
    },

    /**
     * 解析子组件的 handler
     */
    _resolveChildHandler(child: ComponentLike, handler: any): EventListener | null {
        if (typeof handler === 'function') {
            return handler.bind(child) as EventListener;
        }
        if (typeof handler === 'string') {
            const method = (child as any)[handler];
            if (typeof method === 'function') {
                return method.bind(child) as EventListener;
            }
            return null;
        }
        if (handler && typeof handler === 'object' && 'handler' in handler) {
            const config = handler as HandlerConfig;
            const resolved = this._resolveChildHandler(child, config.handler);
            if (resolved && config.once) {
                let called = false;
                const onceHandler = ((e: Event) => {
                    if (called) return;
                    called = true;
                    resolved(e);
                }) as EventListener;
                return onceHandler;
            }
            return resolved;
        }
        if (Array.isArray(handler)) {
            const resolved = handler
                .map((h: any) => this._resolveChildHandler(child, h))
                .filter(Boolean) as EventListener[];
            if (resolved.length === 0) return null;
            return ((e: Event) => resolved.forEach(fn => fn(e))) as EventListener;
        }
        return null;
    },

    /**
     * 绑定子组件的 stateTriggers
     */
    _bindChildStateTriggers(child: ComponentLike, triggers: StateTrigger[]): void {
        for (const trigger of triggers) {
            for (const [eventType, methodName] of Object.entries(trigger.events)) {
                const eventKey = trigger.source ? `${trigger.source}:${eventType}` : eventType;
                const off = child.on?.(eventKey, (e: any) => {
                    (child as any)[methodName]?.(e);
                });
                if (typeof off === 'function') {
                    child.onCleanup?.(off);
                }
            }
        }
    },

    // ============================================
    // 添加
    // ============================================

    /**
     * 添加子组件
     *
     * @param child - 子组件实例
     * @param index - 可选的插入位置
     * @returns 组件自身，支持链式调用
     */
    addChild(child: ComponentLike, index?: number): any {
        const list = this.children;
        if (index !== undefined && index >= 0 && index <= list.length) {
            list.splice(index, 0, child);
        } else {
            list.push(child);
        }

        // 设置父引用
        child.parent = this as any;

        // 挂载到 DOM
        if (child.el && this.el) {
            if (index !== undefined && index < this.el.children.length) {
                this.el.insertBefore(child.el, this.el.children[index]);
            } else {
                this.el.appendChild(child.el);
            }
        }

        this.emit?.(CHILDREN_EVENTS.ADD, { child, index });
        this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'add', child, index });
        return this;
    },

    /**
     * 批量添加子组件
     *
     * @param children - 子组件数组
     * @param startIndex - 可选的起始插入位置
     * @returns 组件自身，支持链式调用
     */
    addChildren(children: ComponentLike[], startIndex?: number): any {
        let idx = startIndex ?? this.children.length;
        for (const child of children) {
            this.addChild(child, idx);
            idx++;
        }
        return this;
    },

    /**
     * 在指定子组件前插入
     *
     * @param child - 要插入的子组件
     * @param refChild - 参考子组件
     * @returns 组件自身，支持链式调用
     */
    insertBefore(child: ComponentLike, refChild: ComponentLike): any {
        const list = this.children;
        const refIdx = list.indexOf(refChild);
        if (refIdx !== -1) {
            list.splice(refIdx, 0, child);
            child.parent = this as any;
            if (child.el && refChild.el && this.el) {
                this.el.insertBefore(child.el, refChild.el);
            }
            this.emit?.(CHILDREN_EVENTS.ADD, { child, index: refIdx });
            this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'add', child, index: refIdx });
        }
        return this;
    },

    // ============================================
    // 移除
    // ============================================

    /**
     * 移除并销毁子组件
     *
     * @param child - 要移除的子组件
     * @returns 组件自身，支持链式调用
     */
    removeChild(child: ComponentLike): any {
        const list = this.children;
        const idx = list.indexOf(child);
        if (idx !== -1) {
            list.splice(idx, 1);
            child.parent = null;
            child.unmount();
            child.dispose();

            this.emit?.(CHILDREN_EVENTS.REMOVE, { child, index: idx });
            this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'remove', child, index: idx });
        }
        return this;
    },

    /**
     * 按索引移除子组件
     *
     * @param index - 子组件索引
     * @returns 被移除的子组件，或 undefined
     */
    removeChildAt(index: number): ComponentLike | undefined {
        const list = this.children;
        if (index < 0 || index >= list.length) return undefined;

        const child = list[index];
        list.splice(index, 1);
        child.parent = null;
        child.unmount();
        child.dispose();

        this.emit?.(CHILDREN_EVENTS.REMOVE, { child, index });
        this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'remove', child, index });
        return child;
    },

    /**
     * 移除所有子组件
     *
     * @returns 组件自身，支持链式调用
     */
    removeAll(): any {
        const list = [...this.children];
        for (const child of list) {
            child.parent = null;
            child.unmount();
            child.dispose();
        }
        this.children.length = 0;

        this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'removeall' });
        return this;
    },

    // ============================================
    // 替换与移动
    // ============================================

    /**
     * 替换子组件
     *
     * @param oldChild - 被替换的子组件
     * @param newChild - 新的子组件
     * @returns 组件自身，支持链式调用
     */
    replaceChild(oldChild: ComponentLike, newChild: ComponentLike): any {
        const list = this.children;
        const idx = list.indexOf(oldChild);
        if (idx === -1) return this;

        // 移除旧组件
        list.splice(idx, 1);
        oldChild.parent = null;
        oldChild.unmount();
        oldChild.dispose();

        // 插入新组件
        list.splice(idx, 0, newChild);
        newChild.parent = this as any;
        if (newChild.el && this.el) {
            if (idx < this.el.children.length) {
                this.el.insertBefore(newChild.el, this.el.children[idx]);
            } else {
                this.el.appendChild(newChild.el);
            }
        }

        this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'replace', oldChild, newChild, index: idx });
        return this;
    },

    /**
     * 移动子组件到新位置
     *
     * @param child - 要移动的子组件
     * @param newIndex - 新的索引位置
     * @returns 组件自身，支持链式调用
     */
    moveChild(child: ComponentLike, newIndex: number): any {
        const list = this.children;
        const oldIndex = list.indexOf(child);
        if (oldIndex === -1 || oldIndex === newIndex) return this;

        // 从旧位置移除
        list.splice(oldIndex, 1);

        // 插入新位置
        const targetIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;
        list.splice(targetIndex, 0, child);

        // 同步 DOM 顺序
        if (child.el && this.el) {
            this.el.removeChild(child.el);
            if (targetIndex < this.el.children.length) {
                this.el.insertBefore(child.el, this.el.children[targetIndex]);
            } else {
                this.el.appendChild(child.el);
            }
        }

        this.emit?.(CHILDREN_EVENTS.MOVE, { child, oldIndex, newIndex: targetIndex });
        this.emit?.(CHILDREN_EVENTS.CHANGE, { action: 'move', child, oldIndex, newIndex: targetIndex });
        return this;
    },

    // ============================================
    // 查询
    // ============================================

    /**
     * 按索引获取子组件
     *
     * @param index - 索引
     * @returns 子组件，或 undefined
     */
    getChildAt(index: number): ComponentLike | undefined {
        return this.children[index];
    },

    /**
     * 按 id 获取子组件
     *
     * @param id - 组件 id
     * @returns 子组件，或 undefined
     */
    getChild(id: string): ComponentLike | undefined {
        return this.children.find((c: any) => c.id === id);
    },

    /**
     * 按 type 查找第一个匹配的直接子组件
     *
     * @param type - 组件类型
     * @returns 子组件，或 undefined
     */
    queryChild(type: string): ComponentLike | undefined {
        return this.children.find((c: any) => c.type === type);
    },

    /**
     * 按 type 查找所有匹配的直接子组件
     *
     * @param type - 组件类型
     * @returns 子组件数组
     */
    queryChildren(type: string): ComponentLike[] {
        return this.children.filter((c: any) => c.type === type);
    },

    /**
     * 递归深度查找第一个匹配的子组件
     *
     * @param type - 组件类型
     * @returns 子组件，或 undefined
     */
    find(type: string): ComponentLike | undefined {
        for (const child of this.children) {
            if ((child as any).type === type) return child;
            if (typeof (child as any).find === 'function') {
                const found = (child as any).find(type);
                if (found) return found;
            }
        }
        return undefined;
    },

    /**
     * 递归深度查找所有匹配的子组件
     *
     * @param type - 组件类型
     * @returns 子组件数组
     */
    findAll(type: string): ComponentLike[] {
        const result: ComponentLike[] = [];
        for (const child of this.children) {
            if ((child as any).type === type) result.push(child);
            if (typeof (child as any).findAll === 'function') {
                result.push(...(child as any).findAll(type));
            }
        }
        return result;
    },

    /**
     * 获取子组件索引
     *
     * @param child - 子组件
     * @returns 索引，未找到返回 -1
     */
    indexOf(child: ComponentLike): number {
        return this.children.indexOf(child);
    },

    /**
     * 判断是否包含指定子组件（仅直接子组件）
     *
     * @param child - 子组件
     * @returns 是否包含
     */
    contains(child: ComponentLike): boolean {
        return this.children.indexOf(child) !== -1;
    },

    /**
     * 遍历子组件
     *
     * @param fn - 遍历回调，返回 false 可中断
     */
    eachChild(fn: (child: ComponentLike, index: number) => void | boolean): void {
        const list = this.children;
        for (let i = 0; i < list.length; i++) {
            if (fn(list[i], i) === false) break;
        }
    },
};
