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
import { POSITION_KEYS, ACCESSIBILITY_KEYS, TOOLTIP_KEYS, BADGE_KEYS, ANIMATION_KEYS, STYLE_KEYS } from '@/layout/layout-keys';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { mergePropAliases, applyPropAliases } from './PropAlias';
import type { AriaKey } from './AccessibilityAbility';
import type { AnimationKey } from './AnimationAbility';
import type { TooltipKey } from './OverlayAbility';
import type { BadgeKey } from './BadgeAbility';

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

            // ── 6. Tooltip 浮层 + Badge 角标（配置驱动） ──
            if (layout.tooltip) {
                this.initTooltipOverlay(layout);
            }
            if (layout.badge !== undefined) {
                this.initBadge(layout);
            }

            // ── 7. 调用能力的 __init__ 方法 ──
            this.callInitMethods();

            // ── 8. 生命周期钩子 ──
            this.callLifecycle(layout.lifecycle);

            // ── 注册到 ComponentRegistrar ──
            if (layout.id) {
                this.id = layout.id;
            }
            ComponentRegistrar.getInstance().registerInstance(this as any);
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
        for (const key of POSITION_KEYS) {
            if ((layout as any)[key] !== undefined) c[key] = (layout as any)[key];
        }

        // StyleProps — 常用，直接赋值到顶层
        for (const key of STYLE_KEYS) {
            if ((layout as any)[key] !== undefined) c[key] = (layout as any)[key];
        }

        // AccessibilityProps — 少用，通过 setAria 批量设置
        const ariaValues: Partial<Record<AriaKey, any>> = {};
        let hasAria = false;
        for (const key of ACCESSIBILITY_KEYS) {
            if ((layout as any)[key] !== undefined) {
                ariaValues[key as AriaKey] = (layout as any)[key];
                hasAria = true;
            }
        }
        if (hasAria) {
            this.setAriaBatch(ariaValues);
        }

        // TooltipProps — 少用，通过 setTooltip 设置
        for (const key of TOOLTIP_KEYS) {
            if ((layout as any)[key] !== undefined) {
                this.setTooltip(key as TooltipKey, (layout as any)[key]);
            }
        }

        // BadgeProps — 少用，通过 setBadge 设置
        for (const key of BADGE_KEYS) {
            if ((layout as any)[key] !== undefined) {
                this.setBadge(key as BadgeKey, (layout as any)[key]);
            }
        }

        // AnimationProps — 少用，通过 setAnimation 设置
        for (const key of ANIMATION_KEYS) {
            if ((layout as any)[key] !== undefined) {
                this.setAnimation(key as AnimationKey, (layout as any)[key]);
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
     * 三种模式（优先级从高到低）：
     * 1. bridges 声明的 → 走事件桥 emitUI 发布
     * 2. 实例有 onXxx 方法 → emitKey 驼峰化为方法名，自动绑定
     *    'saveBtn:tap' → 'onSaveBtnTap'
     * 3. 默认 → 走事件桥 emitUI 发布
     */
    bindExternalEvents(layout: LayoutNode): void {
        const bridges = new Set<string>(layout.bridges || []);

        for (const [emitKey, node] of Object.entries(this.eventMap.external) as [string, any][]) {
            const eventType = emitKey.split(':')[1] || emitKey;

            // bridges 模式：走事件桥 emit 发布
            if (bridges.has(emitKey)) {
                this.bind(node.el, eventType as any);
                this.on(eventType, (gesture: any) => {
                    const domEvent = gesture?.domEvent ?? gesture;
                    if (typeof this.emit === 'function') {
                        this.emit(emitKey, undefined, { domEvent });
                    }
                });
                continue;
            }

            // 方法自动绑定：emitKey → onXxx 方法名
            const handlerName = this._emitKeyToHandlerName(emitKey);
            if (typeof (this as any)[handlerName] === 'function') {
                const handler = (this as any)[handlerName].bind(this);
                this.bind(node.el, eventType as any);
                this.on(eventType, (gesture: any) => {
                    const domEvent = gesture?.domEvent ?? gesture;
                    handler(domEvent, node.el);
                });
                continue;
            }

            // 默认模式：走事件桥 emit 发布
            this.bind(node.el, eventType as any);
            this.on(eventType, (gesture: any) => {
                const domEvent = gesture?.domEvent ?? gesture;
                if (typeof this.emit === 'function') {
                    this.emit(emitKey, undefined, { domEvent });
                }
            });
        }
    },

    /**
     * emitKey 转方法名
     *
     * 'saveBtn:tap' → 'onSaveBtnTap'
     * 'cancelBtn:click' → 'onCancelBtnClick'
     * 'submit' → 'onSubmit'
     */
    _emitKeyToHandlerName(emitKey: string): string {
        return 'on' + emitKey
            .split(':')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
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
