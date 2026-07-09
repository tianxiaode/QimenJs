/**
 * Renderer — 9 阶段渲染流程
 *
 * 根据渲染管线文档实现：
 * 1. 创建实例（不依赖 el）
 * 2. 创建 el + 注入模板
 * 3. 初始化能力（依赖 el）
 * 4. 赋值属性（依赖 el）
 * 5. 绑定事件（依赖 el + extraFns）
 * 6. 条件/循环/响应式
 * 7. 挂载 DOM
 * 8. 递归渲染 children
 * 9. 生命周期
 */

import type { LayoutNode, HandlerConfig, StateTrigger } from '../../layout/LayoutNode';
import type { ComposableBase } from '../ComposableBase';
import { ABILITY_INIT_PROPS } from '../ComposableBase';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { HtmlTemplateRegistrar } from '../../registry/registrars/HtmlTemplateRegistrar';

/** 全局事件总线接口 */
export interface GlobalEventBus {
    on(event: string, handler: (...args: any[]) => void): () => void;
    off(event: string, handler: (...args: any[]) => void): void;
}

/** 渲染器配置 */
export interface RendererConfig {
    componentRegistrar: ComponentRegistrar;
    templateRegistrar: HtmlTemplateRegistrar;
    eventBus: GlobalEventBus;
}

export class Renderer {
    private componentRegistrar: ComponentRegistrar;
    private templateRegistrar: HtmlTemplateRegistrar;
    private eventBus: GlobalEventBus;

    constructor(config: RendererConfig) {
        this.componentRegistrar = config.componentRegistrar;
        this.templateRegistrar = config.templateRegistrar;
        this.eventBus = config.eventBus;
    }

    /**
     * 渲染入口
     */
    render(layout: LayoutNode, parentEl?: HTMLElement): ComposableBase {
        // ── 阶段 1：创建实例（不依赖 el） ──
        const component = this.createInstance(layout);

        // ── 阶段 2：创建 el + 注入模板 ──
        this.createElement(component, layout);

        // ── 阶段 3：初始化能力（依赖 el） ──
        this.initAbilities(component, layout);

        // ── 阶段 4：赋值属性（依赖 el） ──
        this.assignProps(component, layout);

        // ── 阶段 5：绑定事件（依赖 el + extraFns） ──
        this.bindEvents(component, layout);

        // ── 阶段 6：条件/循环/响应式 ──
        this.applyConditional(component, layout);

        // ── 阶段 7：挂载 DOM ──
        if (parentEl) {
            parentEl.appendChild(component.el);
        }

        // ── 阶段 8：递归渲染 children ──
        if (layout.children) {
            for (const child of layout.children) {
                this.render(child, component.el);
            }
        }

        // ── 阶段 9：生命周期 ──
        this.callLifecycle(component, layout);

        return component;
    }

    // ─── 阶段 1：创建实例 ──────────────────────────────

    private createInstance(layout: LayoutNode): ComposableBase {
        // 1. 从 ComponentRegistrar 查找组件类
        const ComponentClass = this.componentRegistrar.get(layout.type);
        if (!ComponentClass) {
            throw new Error(`Component type "${layout.type}" not registered`);
        }

        // 2. new ComponentClass() → constructor 内自动 setupAbilities
        const component = new ComponentClass();

        // 3. 设置 type（initElement 需要用 type 获取模板）
        component.type = layout.type;

        // 4. 注入 LayoutNode.abilities
        if (layout.abilities) {
            for (const ability of layout.abilities) {
                component.setupAbilityDefinition(ability);
            }
        }

        // 4. 注入 extraFns（bind this → defineProperty）
        if (layout.extraFns) {
            for (const [key, fn] of Object.entries(layout.extraFns)) {
                Object.defineProperty(component, key, {
                    value: fn.bind(component),
                    writable: true,
                    configurable: true,
                    enumerable: true,
                });
            }
        }

        // 5. 设置 meta
        if (layout.meta) {
            component.meta = { ...layout.meta };
        }

        return component;
    }

    // ─── 阶段 2：创建 el + 注入模板 ────────────────────

    private createElement(component: ComposableBase, layout: LayoutNode): void {
        // tag 由 layout.tag 覆盖
        if (layout.tag) {
            component.tag = layout.tag;
        }

        component.initElement();
    }

    // ─── 阶段 3：初始化能力 ────────────────────────────

    private initAbilities(component: ComposableBase, layout: LayoutNode): void {
        // TODO: extractProps 需要实现，从 layout 提取 props 字段
        const props = layout.props ?? {};

        // 3a. 调用所有 Ability 的 __initProps
        this.callInitProps(component, props);

        // 3b. 调用所有 Ability 的 __init__ 标记方法
        this.callInitMethods(component);
    }

    /**
     * 遍历所有 Ability，调用 __initProps
     */
    private callInitProps(component: ComposableBase, props: Record<string, any>): void {
        for (const ability of component.collectAbilities()) {
            if (typeof ability[ABILITY_INIT_PROPS] === 'function') {
                ability[ABILITY_INIT_PROPS].call(component, props);
            }
        }
    }

    /**
     * 遍历所有 Ability，调用 __init__ 标记方法
     */
    private callInitMethods(component: ComposableBase): void {
        const ctor = component.constructor as any;
        // 收集所有 Ability 类的 __init__ 声明
        const initMethods = new Set<string>();

        // 从 static abilities 收集
        if (ctor.abilities) {
            for (const def of ctor.abilities) {
                if (def.type?.__init__) {
                    initMethods.add(def.type.__init__);
                }
            }
        }

        // 从 _abilityDefinitions 收集（包含动态注入的）
        for (const def of (component as any)._abilityDefinitions) {
            if (def.type?.__init__) {
                initMethods.add(def.type.__init__);
            }
        }

        // 调用所有初始化方法
        for (const methodName of initMethods) {
            if (typeof (component as any)[methodName] === 'function') {
                (component as any)[methodName]();
            }
        }
    }

    // ─── 阶段 4：赋值属性 ──────────────────────────────

    private assignProps(component: ComposableBase, layout: LayoutNode): void {
        const c = component as any;

        // PositionProps
        if (layout.x !== undefined) c.x = layout.x;
        if (layout.y !== undefined) c.y = layout.y;
        if (layout.top !== undefined) c.top = layout.top;
        if (layout.left !== undefined) c.left = layout.left;
        if (layout.bottom !== undefined) c.bottom = layout.bottom;
        if (layout.right !== undefined) c.right = layout.right;
        if (layout.width !== undefined) c.width = layout.width;
        if (layout.height !== undefined) c.height = layout.height;
        if (layout.minWidth !== undefined) c.minWidth = layout.minWidth;
        if (layout.maxWidth !== undefined) c.maxWidth = layout.maxWidth;
        if (layout.minHeight !== undefined) c.minHeight = layout.minHeight;
        if (layout.maxHeight !== undefined) c.maxHeight = layout.maxHeight;
        if (layout.margin !== undefined) c.margin = layout.margin;
        if (layout.padding !== undefined) c.padding = layout.padding;
        if (layout.scrollable !== undefined) c.scrollable = layout.scrollable;
        if (layout.center !== undefined) c.center = layout.center;
        if (layout.hideMode !== undefined) c.hideMode = layout.hideMode;
        if (layout.alwaysOnTop !== undefined) c.alwaysOnTop = layout.alwaysOnTop;
        if (layout.fullscreen !== undefined) c.fullscreen = layout.fullscreen;
        if (layout.shadow !== undefined) c.shadow = layout.shadow;
        if (layout.focused !== undefined) c.focused = layout.focused;
        if (layout.tabIndex !== undefined) c.tabIndex = layout.tabIndex;
        if (layout.zIndex !== undefined) c.zIndex = layout.zIndex;

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

        // EntityProps
        if (layout.entity !== undefined) c.entity = layout.entity;

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

        // 剩余 props
        if (layout.props) {
            for (const [key, value] of Object.entries(layout.props)) {
                component.setProp(key, value);
            }
        }
    }

    // ─── 阶段 5：绑定事件 ──────────────────────────────

    private bindEvents(component: ComposableBase, layout: LayoutNode): void {
        // handlers → component.onDom
        if (layout.handlers) {
            for (const [event, handler] of Object.entries(layout.handlers)) {
                const resolved = this.resolveHandler(component, handler);
                if (resolved) {
                    component.onDom(event, resolved);
                }
            }
        }

        // stateTriggers → globalEventBus.on
        if (layout.stateTriggers) {
            for (const trigger of layout.stateTriggers) {
                this.bindStateTrigger(component, trigger);
            }
        }
    }

    /**
     * 解析 handler：字符串 → 组件方法，函数 → 直接使用
     */
    private resolveHandler(component: ComposableBase, handler: any): EventListener | null {
        if (typeof handler === 'function') {
            return handler as EventListener;
        }
        if (typeof handler === 'string') {
            const method = (component as any)[handler];
            if (typeof method === 'function') {
                return method.bind(component) as EventListener;
            }
            return null;
        }
        if (handler && typeof handler === 'object' && 'handler' in handler) {
            const config = handler as HandlerConfig;
            const resolved = this.resolveHandler(component, config.handler);
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
            // 多个 handler 合并
            const resolved = handler
                .map(h => this.resolveHandler(component, h))
                .filter(Boolean) as EventListener[];
            if (resolved.length === 0) return null;
            return ((e: Event) => resolved.forEach(fn => fn(e))) as EventListener;
        }
        return null;
    }

    /**
     * 绑定 StateTrigger
     */
    private bindStateTrigger(component: ComposableBase, trigger: StateTrigger): void {
        for (const [eventType, methodName] of Object.entries(trigger.events)) {
            const eventKey = trigger.source ? `${trigger.source}:${eventType}` : eventType;
            const off = this.eventBus.on(eventKey, (e: any) => {
                (component as any)[methodName]?.(e);
            });
            component.onCleanup(off);
        }
    }

    // ─── 阶段 6：条件/循环/响应式 ──────────────────────

    private applyConditional(component: ComposableBase, layout: LayoutNode): void {
        // visible
        if (layout.visible !== undefined) {
            if (typeof layout.visible === 'boolean') {
                if (!layout.visible) {
                    component.hide();
                }
            } else {
                // string 表达式 — TODO: 运行时求值
            }
        }

        // repeat — TODO: 循环渲染
        if (layout.repeat) {
            // 占位
        }

        // responsive — TODO: 响应式配置
        if (layout.responsive) {
            // 占位
        }
    }

    // ─── 阶段 9：生命周期 ──────────────────────────────

    private callLifecycle(component: ComposableBase, layout: LayoutNode): void {
        if (layout.lifecycle?.onMounted) {
            layout.lifecycle.onMounted.call(component);
        }
    }
}
