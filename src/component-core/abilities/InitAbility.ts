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
            ComponentManager.getInstance().register(this);
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
            this.eventBridge = (layout as any).eventBridge;
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
     */
    assignProps(layout: LayoutNode): void {
        const c = this as any;

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
     */
    bindInternalEvents(): void {
        for (const binding of this.eventMap.internal) {
            const { event, handler, once, delegate, delegateTarget, node } = binding;

            if (delegate) {
                const delegateHandler = (ev: Event) => {
                    const target = (ev.target as HTMLElement).closest(delegateTarget || '*');
                    if (target) {
                        (this as any)[handler](ev, target);
                    }
                };
                node.el.addEventListener(event, delegateHandler);
                this.onCleanup(() => node.el.removeEventListener(event, delegateHandler));
            } else if (once) {
                const boundHandler = (ev: Event) => (this as any)[handler](ev, node.el);
                node.el.addEventListener(event, boundHandler, { once: true });
            } else {
                const boundHandler = (ev: Event) => (this as any)[handler](ev, node.el);
                node.el.addEventListener(event, boundHandler);
                this.onCleanup(() => node.el.removeEventListener(event, boundHandler));
            }
        }
    },

    /**
     * 绑定外部事件 — data-emit 声明的模板事件
     *
     * 对照 handlers 和 eventBridge，只有配置了监听才绑定。
     */
    bindExternalEvents(layout: LayoutNode): void {
        const listenedEvents = new Set<string>();

        if (layout.handlers) {
            for (const key of Object.keys(layout.handlers)) {
                listenedEvents.add(key);
            }
        }

        if ((this as any).eventBridge) {
            const bridge = (this as any).eventBridge;
            for (const key of Object.keys(bridge)) {
                if (key === 'pagination') listenedEvents.add('pagechange');
                else if (key === 'crud') listenedEvents.add('crudaction');
                else if (key === 'selection') listenedEvents.add('selectionchange');
                else if (key === 'search') listenedEvents.add('searchchange');
                else listenedEvents.add(key);
            }
        }

        for (const [emitKey, node] of Object.entries(this.eventMap.external)) {
            const eventType = emitKey.split(':')[1] || emitKey;

            if (!listenedEvents.has(eventType) && !listenedEvents.has(emitKey)) continue;

            const handler = (ev: Event) => {
                if (typeof this.emit === 'function') {
                    this.emit(emitKey, ev);
                }
            };
            node.el.addEventListener(eventType, handler);
            this.onCleanup(() => node.el.removeEventListener(eventType, handler));
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
