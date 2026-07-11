/**
 * InitAbility — 组件统一初始化流程
 *
 * 整合配置初始化、内容填充、i18n 初始化、事件绑定、tooltip 浮层、声明生命周期。
 * 作为 ComponentBase 的标准能力，通过 ComposableBase.with() 合并到原型。
 *
 * initialize() 执行期间 _initializing=true，setProp 只存值不触发 markDirty/flush。
 * 初始化结束后执行一次 flush 将所有属性统一写入 DOM。
 */

import type { AbilityDefinition } from '@/composable';
import type { LayoutNode, HandlerConfig, StateTrigger, LifecycleHooks } from '@/layout/LayoutNode';
import { ComponentManager } from '../ComponentManager';
import { mergePropAliases, applyPropAliases } from './PropAlias';
import type { AriaKey } from './AccessibilityAbility';
import type { AnimationKey } from './AnimationAbility';
import type { TooltipKey } from './OverlayAbility';

export const InitAbility: AbilityDefinition = {
    /**
     * 统一初始化入口
     *
     * 初始化期间 _initializing=true，setProp 只存值不触发 markDirty/flush。
     * 初始化结束后执行一次 flush 将所有属性统一写入 DOM。
     */
    initialize(layout: LayoutNode): void {
        this._initializing = true;

        try {
            // ── 1. 创建 el + 注入模板 + buildNodeMap ──
            if (layout.tag) this.tag = layout.tag;
            if (layout.template) this.template = layout.template;
            this.type = layout.type;
            this.initElement();

            // ── 2. 配置初始化 ──
            this.initConfig(layout);

            // ── 3. 内容填充 + i18n 初始化 ──
            this.initContent(layout.props ?? {});

            // ── 4. 赋值属性 ──
            this.assignProps(layout);

            // ── 5. 事件绑定 ──
            this.bindEvents(layout);

            // ── 6. Tooltip 浮层（配置驱动） ──
            if (layout.tooltip) {
                this.initTooltipOverlay(layout);
            }

            // ── 7. 调用能力的 __init__ 方法 ──
            this.callInitMethods();

            // ── 8. 生命周期钩子 ──
            this.callLifecycle(layout.lifecycle);

            // ── 注册到 ComponentManager ──
            if (layout.id) {
                this.id = layout.id;
            }
            ComponentManager.getInstance().register(this as any);
        } finally {
            this._initializing = false;
            this.flush();
        }
    },

    /**
     * 配置初始化 — abilities 注入、extraFns 绑定、entity 实例化、eventBridge 存储、meta 复制
     */
    initConfig(layout: LayoutNode): void {
        if (layout.abilities) {
            this.setupAbilities(layout.abilities);
        }

        if (layout.extraFns) {
            for (const [key, fn] of Object.entries(layout.extraFns)) {
                Object.defineProperty(this, key, {
                    value: fn.bind(this),
                    writable: true,
                    configurable: true,
                    enumerable: true,
                });
            }
        }

        if (layout.entity) {
            const manager = new layout.entity();
            this.mgr = manager;
            this.onCleanup(() => manager.dispose());
        }

        if ((layout as any).eventBridge) {
            this.setEventBridge((layout as any).eventBridge);
            queueMicrotask(() => {
                if (typeof this.initEventBridge === 'function') {
                    this.initEventBridge();
                }
            });
        }

        if (layout.meta) {
            this.meta = { ...layout.meta };
        }
    },

    /**
     * 内容填充 — 从 props 初始化内容属性 + 应用属性别名 + i18n 初始化
     */
    initContent(props: Record<string, any>): void {
        this.initContentFromProps(props);

        const ctor = this.constructor as any;
        if (ctor.abilities) {
            const aliasMap = mergePropAliases(ctor.abilities);
            if (Object.keys(aliasMap).length > 0) {
                applyPropAliases(this, props, aliasMap);
            }
        }

        // 初始化 data-i18n 节点的翻译 + 注册 localeChange 监听
        this.initI18nFromTemplate();
        this.setupI18nListener();
    },

    /**
     * 赋值属性 — Position/Style/Accessibility/Tooltip/Animation/Permission
     *
     * 常用属性（Position/Style）直接赋值到顶层，
     * 少用属性（Accessibility/Animation/Tooltip/Permission）通过方法设置。
     */
    assignProps(layout: LayoutNode): void {
        const c = this as any;

        // PositionProps — 常用，直接赋值到顶层
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

        // StyleProps — 常用，直接赋值到顶层
        if (layout.className !== undefined) c.className = layout.className;
        if (layout.style !== undefined) c.style = layout.style;

        // AccessibilityProps — 少用，通过 setAria 批量设置
        const ariaValues: Partial<Record<AriaKey, any>> = {};
        const ariaKeys: AriaKey[] = [
            'role', 'ariaLabel', 'ariaDescribedBy', 'ariaLabelledBy',
            'ariaHidden', 'ariaDisabled', 'ariaExpanded', 'ariaSelected',
            'ariaPressed', 'ariaRequired', 'ariaInvalid', 'ariaLive',
            'ariaControls', 'ariaOwns', 'ariaHasPopup', 'ariaCurrent',
            'ariaLevel', 'ariaValueText', 'ariaValueMin', 'ariaValueMax',
            'ariaValueNow', 'ariaModal', 'ariaReadOnly', 'ariaAutoComplete',
            'ariaErrorMessage', 'ariaRowCount', 'ariaColCount', 'ariaRowIndex',
            'ariaColIndex', 'ariaRowSpan', 'ariaColSpan', 'ariaSetSize', 'ariaPosInSet',
        ];
        let hasAria = false;
        for (const key of ariaKeys) {
            if ((layout as any)[key] !== undefined) {
                ariaValues[key] = (layout as any)[key];
                hasAria = true;
            }
        }
        if (hasAria) {
            this.setAriaBatch(ariaValues);
        }

        // TooltipProps — 少用，通过 setTooltip 设置
        const tooltipKeys: TooltipKey[] = [
            'tooltip', 'tooltipPlacement', 'tooltipOffset',
            'tooltipShowDelay', 'tooltipHideDelay', 'tooltipMaxWidth',
        ];
        for (const key of tooltipKeys) {
            if ((layout as any)[key] !== undefined) {
                this.setTooltip(key, (layout as any)[key]);
            }
        }

        // AnimationProps — 少用，通过 setAnimation 设置
        const animationKeys: AnimationKey[] = [
            'enterAnimation', 'enterAnimationOptions',
            'leaveAnimation', 'leaveAnimationOptions', 'animationEnabled',
        ];
        for (const key of animationKeys) {
            if ((layout as any)[key] !== undefined) {
                this.setAnimation(key, (layout as any)[key]);
            }
        }

        // PermissionProps — 少用，通过 setPermission 设置
        if (layout.permission !== undefined) {
            this.setPermission(layout.permission);
        }

        // 剩余 props
        if (layout.props) {
            for (const [key, value] of Object.entries(layout.props)) {
                this.setProp(key, value);
            }
        }
    },

    /**
     * 事件绑定 — 整合内部事件、外部事件、handlers、stateTriggers
     */
    bindEvents(layout: LayoutNode): void {
        this.bindInternalEvents();
        this.bindExternalEvents(layout);

        if (layout.handlers) {
            this.bindHandlers(layout.handlers);
        }

        if (layout.stateTriggers) {
            this.bindStateTriggers(layout.stateTriggers);
        }
    },

    /**
     * 绑定内部事件 — data-event 声明的模板事件
     *
     * 通过 this.bind 统一绑定，使用 event-dom 事件规范命名。
     */
    bindInternalEvents(): void {
        for (const binding of this.eventMap.internal) {
            const { event, handler, once, delegate, delegateTarget, node } = binding;

            if (delegate) {
                // 事件委托模式
                this.bind(node.el, event as any, { selector: delegateTarget });
                this.on(event, (gesture: any) => {
                    const domEvent = gesture?.domEvent ?? gesture;
                    const target = delegateTarget
                        ? (domEvent.target as HTMLElement).closest(delegateTarget)
                        : (domEvent.target as HTMLElement);
                    if (target) {
                        (this as any)[handler](domEvent, target);
                    }
                });
            } else if (once) {
                // 只触发一次
                this.bind(node.el, event as any);
                this.once(event, (gesture: any) => {
                    const domEvent = gesture?.domEvent ?? gesture;
                    (this as any)[handler](domEvent, node.el);
                });
            } else {
                // 常规绑定
                this.bind(node.el, event as any);
                this.on(event, (gesture: any) => {
                    const domEvent = gesture?.domEvent ?? gesture;
                    (this as any)[handler](domEvent, node.el);
                });
            }
        }
    },

    /**
     * 绑定外部事件 — data-emit 声明的模板事件
     *
     * 通过 this.bind 统一绑定，使用 event-dom 事件规范命名。
     *
     * 两种模式：
     * - handlers 里的 key → 绑定具体函数，直接执行
     * - 默认（bridges + 未配置）→ 走事件桥 emitUI 发布
     */
    bindExternalEvents(layout: LayoutNode): void {
        const handlerKeys = new Set<string>(layout.handlers ? Object.keys(layout.handlers) : []);

        for (const [emitKey, node] of Object.entries(this.eventMap.external) as [string, any][]) {
            const eventType = emitKey.split(':')[1] || emitKey;

            // handlers 模式：绑定具体函数
            if (handlerKeys.has(emitKey)) {
                const handlerDef = layout.handlers![emitKey];
                const resolved = this.resolveHandler(handlerDef);
                if (resolved) {
                    this.bind(node.el, eventType as any);
                    this.on(eventType, (gesture: any) => {
                        const domEvent = gesture?.domEvent ?? gesture;
                        resolved(domEvent);
                    });
                }
                continue;
            }

            // bridges 模式 + 默认模式：走事件桥 emitUI 发布
            this.bind(node.el, eventType as any);
            this.on(eventType, (gesture: any) => {
                const domEvent = gesture?.domEvent ?? gesture;
                if (typeof this.emitUI === 'function') {
                    this.emitUI(emitKey, undefined, domEvent);
                }
            });
        }
    },

    /**
     * 绑定 LayoutNode handlers — 声明式 DOM 事件绑定
     */
    bindHandlers(handlers: NonNullable<LayoutNode['handlers']>): void {
        for (const [semantic, handlerDef] of Object.entries(handlers)) {
            const resolved = this.resolveHandler(handlerDef);
            if (!resolved) continue;

            this.bind(this.el, semantic as any, { handler: resolved });
        }
    },

    /**
     * 解析 handler：字符串 → 组件方法，函数 → 直接使用
     */
    resolveHandler(handler: any): EventListener | null {
        if (typeof handler === 'function') {
            return handler.bind(this) as EventListener;
        }
        if (typeof handler === 'string') {
            const method = (this as any)[handler];
            if (typeof method === 'function') {
                return method.bind(this) as EventListener;
            }
            return null;
        }
        if (handler && typeof handler === 'object' && 'handler' in handler) {
            const config = handler as HandlerConfig;
            const resolved = this.resolveHandler(config.handler);
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
                .map((h: any) => this.resolveHandler(h))
                .filter(Boolean) as EventListener[];
            if (resolved.length === 0) return null;
            return ((e: Event) => resolved.forEach(fn => fn(e))) as EventListener;
        }
        return null;
    },

    /**
     * 绑定 StateTrigger — 声明式事件绑定到全局 EventBus
     */
    bindStateTriggers(triggers: StateTrigger[]): void {
        for (const trigger of triggers) {
            for (const [eventType, methodName] of Object.entries(trigger.events)) {
                const eventKey = trigger.source ? `${trigger.source}:${eventType}` : eventType;
                const off = this.on(eventKey, (e: any) => {
                    (this as any)[methodName]?.(e);
                });
                if (typeof off === 'function') {
                    this.onCleanup(off);
                }
            }
        }
    },

    /**
     * 调用能力的 __init__ 方法
     */
    callInitMethods(): void {
        const ctor = this.constructor as any;
        const initMethods = new Set<string>();

        if (ctor.abilities) {
            for (const def of ctor.abilities) {
                if (def?.__init__) {
                    initMethods.add(def.__init__);
                }
            }
        }

        for (const methodName of initMethods) {
            if (typeof (this as any)[methodName] === 'function') {
                (this as any)[methodName]();
            }
        }
    },

    /**
     * 调用生命周期钩子
     */
    callLifecycle(lifecycle?: LifecycleHooks): void {
        if (!lifecycle) return;

        if (lifecycle.onMounted) {
            lifecycle.onMounted.call(this);
        }
    },
};
