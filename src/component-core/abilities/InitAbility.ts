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
import type {
    HandlerConfig,
    EventListen,
    BridgesConfig,
    ListensConfig,
    LifecycleHooks,
} from '../layout-types';
import { ANIMATION_KEYS } from '../layout-types';
import type { DragDecl } from '../layout-types';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { mergePropAliases, applyPropAliases } from './PropAlias';
import { EventBridge } from '@/events/EventBridge';
import { EntityEventBus } from '@/events/EntityEventBus';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { DragEventBus } from '@/events/DragEventBus';
import { validateEntityEvent } from '@/entity/dispatch';
import { overlayDispatchCenter, validateOverlayDecl } from '@/overlay/dispatch';
import type { AnimationKey } from './AnimationAbility';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import { ElementEventAbility } from './ElementEventAbility';

export const InitAbility: AbilityDefinition = {
    /**
     * 统一初始化入口
     *
     * 初始化期间 _initializing=true，setProp 只存值不触发 markDirty/flush。
     * 初始化结束后执行一次 flush 将所有属性统一写入 DOM。
     */
    initialize(layout: Record<string, any>): void {
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

            // ── 6. Tooltip 浮层（配置驱动） ──
            if (layout.tooltip) {
                this.initTooltipOverlay(layout);
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
    initConfig(layout: Record<string, any>): void {
        if (layout.abilities) {
            this.setupAbilities(layout.abilities);
        }

        if (layout.extraFns) {
            for (const [key, fn] of Object.entries(layout.extraFns)) {
                if (typeof fn !== 'function') continue;
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

        if (layout.overlays) {
            this._initOverlays(layout.overlays);
        }

        if (layout.drags) {
            this._initDrags(layout.drags);
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
     * 赋值属性 — 只处理有行为逻辑的能力（Animation）
     *
     * 纯赋值属性（Position/Style/Accessibility/Tooltip/Badge/Permission/ColorVariant）
     * 已移除，v2 由 props/content 直接驱动。
     * Drag/Drop 已改为声明式（body.drags + body.listens.dragKey），不再走 assignProps。
     */
    assignProps(layout: Record<string, any>): void {
        // AnimationProps — 有行为，通过 setAnimation 设置
        for (const key of ANIMATION_KEYS) {
            if ((layout as any)[key] !== undefined) {
                this.setAnimation(key as AnimationKey, (layout as any)[key]);
            }
        }

        // 剩余 props
        if (layout.props) {
            for (const [key, value] of Object.entries(layout.props)) {
                this.setProp(key, value);
            }
        }
    },

    /**
     * 事件绑定 — 整合内部事件、外部事件、handlers、bridges
     */
    bindEvents(layout: Record<string, any>): void {
        this.bindInternalEvents();
        this.bindExternalEvents(layout);

        if (layout.handlers) {
            this.bindHandlers(layout.handlers);
        }

        // 从 listens 中提取监听配置
        const listenConfig = this._extractListensOn(layout.listens);
        if (listenConfig) {
            this.bindEventListen(listenConfig);
        }
    },

    /**
     * 从事件回调参数中提取原始 DOM 事件
     *
     * EventBus.on 回调收到的是 EventContext { event, data, source, ... }，
     * data 是 GestureEmit { semantic, originalEvent } 或 InputSignal 的标准化输入。
     * 需要穿透两层才能拿到原始 DOM Event。
     */
    _extractDomEvent(ctx: any): Event | undefined {
        // ctx 是 EventContext，data 才是手势/输入数据
        const data = ctx?.data;
        // GestureEmit / GestureInput 的 originalEvent 字段
        if (data?.originalEvent) return data.originalEvent;
        // 兜底：data 本身可能是 Event
        if (data instanceof Event) return data;
        // 再兜底：ctx 本身可能是 Event（非 EventBus 路径）
        if (ctx instanceof Event) return ctx;
        return undefined;
    },

    /**
     * 绑定内部事件 — data-event 声明的模板事件
     *
     * 通过 this.bind 统一绑定，使用 event-dom 事件规范命名。
     */
    bindInternalEvents(): void {
        // 如果 ElementEventAbility 已注册，由其 __initProps 接管内部事件绑定
        const ctor = this.constructor as any;
        const elementEventAbility = ctor.abilities?.find((a: any) => a === ElementEventAbility);
        if (elementEventAbility) {
            this.logger?.debug?.(
                '[Init] bindInternalEvents delegated to ElementEventAbility.__initProps'
            );
            elementEventAbility.__initProps.call(this, this.props || {});
            return;
        }

        this.logger?.debug?.(
            '[Init] bindInternalEvents, count =',
            this.eventMap.internal.length,
            'type =',
            ctor.type,
            'scopeId =',
            this.eventScope?.getScopeId?.()
        );
        for (const binding of this.eventMap.internal) {
            const { event, handler, once, delegate, delegateTarget, debounce, throttle, node } =
                binding;
            // DOM 事件加前缀，避免与组件 emit 的同名事件冲突
            const domEvent = `${DOM_EVENT_PREFIX}${event}`;

            this.logger?.debug?.(
                '[Init] bindInternal, event =',
                event,
                'domEvent =',
                domEvent,
                'handler =',
                handler,
                'delegate =',
                delegate,
                'debounce =',
                debounce,
                'throttle =',
                throttle,
                'node.el =',
                node.el?.tagName,
                'inDOM =',
                document.contains(node.el)
            );

            // 构建 bind 选项
            const bindOptions: any = {};
            if (debounce && debounce > 0) bindOptions.debounce = debounce;
            if (throttle && throttle > 0) bindOptions.throttle = throttle;

            if (delegate) {
                // 事件委托模式
                this.bind(node.el, event as any, { ...bindOptions, selector: delegateTarget });
                this.on(domEvent, (ctx: any) => {
                    const domEvt = this._extractDomEvent(ctx);
                    const target = delegateTarget
                        ? (domEvt?.target as HTMLElement)?.closest(delegateTarget)
                        : (domEvt?.target as HTMLElement);
                    if (target && typeof (this as any)[handler] === 'function') {
                        (this as any)[handler](domEvt, target);
                    }
                });
            } else if (once) {
                // 只触发一次
                this.bind(node.el, event as any, bindOptions);
                this.once(domEvent, (ctx: any) => {
                    const domEvt = this._extractDomEvent(ctx);
                    if (typeof (this as any)[handler] === 'function') {
                        (this as any)[handler](domEvt, node.el);
                    }
                });
            } else {
                // 常规绑定
                this.bind(node.el, event as any, bindOptions);
                this.on(domEvent, (ctx: any) => {
                    const domEvt = this._extractDomEvent(ctx);
                    if (typeof (this as any)[handler] === 'function') {
                        (this as any)[handler](domEvt, node.el);
                    }
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
    bindExternalEvents(layout: Record<string, any>): void {
        const bridges = new Set<string>(this._extractBridgesEmit(layout.listens || layout.bridges));

        this.logger?.debug?.(
            '[Init] bindExternalEvents, count =',
            Object.keys(this.eventMap.external).length,
            'bridgeEmits =',
            [...bridges]
        );

        for (const [emitKey, node] of Object.entries(this.eventMap.external) as [string, any][]) {
            const eventType = emitKey.split(':')[1] || emitKey;
            // DOM 事件加前缀，避免与组件 emit 的同名事件冲突
            const domEventType = `${DOM_EVENT_PREFIX}${eventType}`;

            // bridges 模式：走事件桥 emit 发布
            if (bridges.has(emitKey)) {
                this.bind(node.el, eventType as any);
                this.on(domEventType, (ctx: any) => {
                    const domEvent = this._extractDomEvent(ctx);
                    if (typeof this.emit === 'function') {
                        this.emit(eventType, undefined, { domEvent });
                    }
                });
                continue;
            }

            // 方法自动绑定：emitKey → onXxx 方法名
            const handlerName = this._emitKeyToHandlerName(emitKey);
            if (typeof (this as any)[handlerName] === 'function') {
                const handler = (this as any)[handlerName].bind(this);
                this.bind(node.el, eventType as any);
                this.on(domEventType, (ctx: any) => {
                    const domEvent = this._extractDomEvent(ctx);
                    handler(domEvent, node.el);
                });
                continue;
            }

            // 默认模式：走事件桥 emit 发布
            this.bind(node.el, eventType as any);
            this.on(domEventType, (ctx: any) => {
                const domEvent = this._extractDomEvent(ctx);
                if (typeof this.emit === 'function') {
                    this.emit(eventType, undefined, { domEvent });
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
        return (
            'on' +
            emitKey
                .split(':')
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join('')
        );
    },

    /**
     * 绑定 handlers — 声明式 DOM 事件绑定
     */
    bindHandlers(handlers: Record<string, any>): void {
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
     * 绑定事件监听（listens）
     *
     * 监听其他组件或实体发出的事件，自动绑定到 extraFns 中的方法。
     * 四路分流（优先级从高到低）：
     * - entityKey → 走 EntityDispatchCenter
     * - dragKey → 走 DragEventBus
     * - source → 走 EventBridge
     * - 默认 → 走组件 scope
     */
    bindEventListen(listens: EventListen[]): void {
        for (const listen of listens) {
            for (const [eventType, methodName] of Object.entries(listen.events)) {
                if (listen.entityKey) {
                    validateEntityEvent(eventType);
                    const bus = EntityEventBus.getInstance();
                    const off = bus.entityOn(listen.entityKey, eventType, (data: any) => {
                        (this as any)[methodName]?.(data);
                    });
                    if (typeof off === 'function') {
                        this.onCleanup(off);
                    }
                } else if (listen.dragKey) {
                    const bus = DragEventBus.getInstance();
                    const off = bus.dragOn(listen.dragKey, eventType as any, (data: any) => {
                        (this as any)[methodName]?.(data);
                    });
                    if (typeof off === 'function') {
                        this.onCleanup(off);
                    }
                } else if (listen.source) {
                    const bridge = EventBridge.getInstance();
                    const off = bridge.bridgeOn(listen.source, eventType, (data: any) => {
                        (this as any)[methodName]?.(data);
                    });
                    if (typeof off === 'function') {
                        this.onCleanup(off);
                    }
                } else {
                    const off = this.on(eventType, (e: any) => {
                        (this as any)[methodName]?.(e);
                    });
                    if (typeof off === 'function') {
                        this.onCleanup(off);
                    }
                }
            }
        }
    },

    /**
     * 从 bridges 配置中提取 emit 列表（string 项）
     */
    _extractBridgesEmit(bridges?: BridgesConfig): string[] {
        if (!bridges) return [];
        return bridges.filter((item): item is string => typeof item === 'string');
    },

    _extractListensOn(listens?: ListensConfig | BridgesConfig): EventListen[] | null {
        if (!listens) return null;
        const items = (Array.isArray(listens) ? listens : []).filter(
            (item): item is EventListen => typeof item !== 'string'
        );
        return items.length > 0 ? items : null;
    },

    _initOverlays(overlays: Record<string, any>): void {
        const bus = OverlayEventBus.getInstance();

        for (const [overlayKey, decl] of Object.entries(overlays)) {
            validateOverlayDecl(overlayKey, decl);
            overlayDispatchCenter.register(overlayKey, decl);

            const trigger = decl.trigger ?? 'manual';
            if (trigger === 'manual') continue;

            const overlayType = decl.type;
            const createOverlay = () => {
                const capitalType = overlayType.charAt(0).toUpperCase() + overlayType.slice(1);
                const OverlayClass = ComponentRegistrar.getInstance().get(capitalType);
                if (!OverlayClass) return null;

                const overlayData =
                    typeof decl.data === 'function' ? decl.data.call(this) : decl.data;
                return new OverlayClass({ anchor: this.el, ...overlayData });
            };

            if (trigger === 'always') {
                const overlay = createOverlay();
                if (overlay) {
                    bus.overlayEmit(overlayKey, 'show', {
                        component: this,
                        anchor: this.el,
                        overlay,
                    });
                }
            } else if (trigger === 'hover') {
                const el = this.el;
                if (!el) continue;

                const showHandler = () => {
                    const overlay = createOverlay();
                    if (overlay)
                        bus.overlayEmit(overlayKey, 'show', {
                            component: this,
                            anchor: el,
                            overlay,
                        });
                };
                const hideHandler = () => {
                    bus.overlayEmit(overlayKey, 'hide', { component: this, anchor: el });
                };

                el.addEventListener('mouseenter', showHandler);
                el.addEventListener('mouseleave', hideHandler);
                this.onCleanup(() => {
                    el.removeEventListener('mouseenter', showHandler);
                    el.removeEventListener('mouseleave', hideHandler);
                });
            } else if (trigger === 'click') {
                const el = this.el;
                if (!el) continue;

                const clickHandler = () => {
                    const existing = overlayDispatchCenter.getOverlay(this.id, overlayKey);
                    if (existing) {
                        bus.overlayEmit(overlayKey, 'toggle', { component: this, anchor: el });
                    } else {
                        const overlay = createOverlay();
                        if (overlay)
                            bus.overlayEmit(overlayKey, 'show', {
                                component: this,
                                anchor: el,
                                overlay,
                            });
                    }
                };

                el.addEventListener('click', clickHandler);
                this.onCleanup(() => {
                    el.removeEventListener('click', clickHandler);
                });
            } else if (trigger === 'focus') {
                const el = this.el;
                if (!el) continue;

                const focusHandler = () => {
                    const overlay = createOverlay();
                    if (overlay)
                        bus.overlayEmit(overlayKey, 'show', {
                            component: this,
                            anchor: el,
                            overlay,
                        });
                };
                const blurHandler = () => {
                    bus.overlayEmit(overlayKey, 'hide', { component: this, anchor: el });
                };

                el.addEventListener('focus', focusHandler);
                el.addEventListener('blur', blurHandler);
                this.onCleanup(() => {
                    el.removeEventListener('focus', focusHandler);
                    el.removeEventListener('blur', blurHandler);
                });
            } else if (trigger === 'contextmenu') {
                const el = this.el;
                if (!el) continue;

                const contextHandler = (e: Event) => {
                    e.preventDefault();
                    const overlay = createOverlay();
                    if (overlay)
                        bus.overlayEmit(overlayKey, 'show', {
                            component: this,
                            anchor: el,
                            overlay,
                            x: (e as MouseEvent).clientX,
                            y: (e as MouseEvent).clientY,
                        });
                };

                el.addEventListener('contextmenu', contextHandler);
                this.onCleanup(() => {
                    el.removeEventListener('contextmenu', contextHandler);
                });
            }
        }

        this.onCleanup(() => {
            overlayDispatchCenter.disposeByComponent(this.id);
        });
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

        this.logger?.debug?.('[Init] callInitMethods, methods =', [...initMethods]);

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

    /**
     * 初始化拖拽源 — 声明式，类似 _initOverlays
     *
     * body.drags 声明拖拽源，框架自动：
     * 1. 绑定 DragProcessor 手势到元素
     * 2. start/end/cancel 走 DragEventBus 调度中心
     * 3. move 本地处理（视觉反馈）
     * 4. data 支持函数形式动态获取
     */
    _initDrags(drags: Record<string, DragDecl>): void {
        const bus = DragEventBus.getInstance();

        for (const [dragKey, decl] of Object.entries(drags)) {
            const axis = decl.axis ?? 'both';
            const handleSelector = decl.handle;
            const bounds = decl.bounds;
            const activeClass = decl.activeClass;
            const grid = decl.grid;
            const dragType = decl.type ?? null;

            const target = handleSelector
                ? (this.el.querySelector(handleSelector) as HTMLElement)
                : this.el;

            if (!target) continue;

            let originX = 0;
            let originY = 0;

            this.bind(target, 'drag');

            this.on('drag', (gesture: any) => {
                const phase = gesture?.phase;

                if (phase === 'start') {
                    const rect = this.el.getBoundingClientRect();
                    originX = rect.left;
                    originY = rect.top;

                    this.el.style.position = 'absolute';
                    if (activeClass) {
                        this.el.classList.add(activeClass);
                    }

                    const dragData =
                        typeof decl.data === 'function'
                            ? (decl.data as () => Record<string, any>).call(this)
                            : decl.data;
                    bus.dragStart(dragKey, {
                        dragType,
                        dragData: dragData ?? null,
                        dragEl: this.el,
                        dragSource: this,
                    });

                    this.emit('dragstart', { originX, originY });
                } else if (phase === 'move') {
                    let dx = gesture.dx ?? 0;
                    let dy = gesture.dy ?? 0;

                    if (axis === 'x') dy = 0;
                    if (axis === 'y') dx = 0;

                    let newX = originX + dx;
                    let newY = originY + dy;

                    if (bounds) {
                        const boundRect =
                            bounds instanceof HTMLElement ? bounds.getBoundingClientRect() : bounds;

                        const elWidth = this.el.offsetWidth;
                        const elHeight = this.el.offsetHeight;

                        if (boundRect.left !== undefined) newX = Math.max(boundRect.left, newX);
                        if (boundRect.top !== undefined) newY = Math.max(boundRect.top, newY);
                        if (boundRect.right !== undefined)
                            newX = Math.min(boundRect.right - elWidth, newX);
                        if (boundRect.bottom !== undefined)
                            newY = Math.min(boundRect.bottom - elHeight, newY);
                    }

                    if (grid && grid > 0) {
                        newX = Math.round(newX / grid) * grid;
                        newY = Math.round(newY / grid) * grid;
                    }

                    this.el.style.left = `${newX}px`;
                    this.el.style.top = `${newY}px`;

                    this.emit('dragmove', { dx, dy, newX, newY });
                } else if (phase === 'end') {
                    if (activeClass) {
                        this.el.classList.remove(activeClass);
                    }

                    bus.dragEnd(dragKey);
                    this.emit('dragend');
                } else if (phase === 'cancel') {
                    if (activeClass) {
                        this.el.classList.remove(activeClass);
                    }

                    bus.dragCancel(dragKey);
                    this.emit('dragcancel');
                }
            });

            target.style.touchAction = 'none';
            target.style.userSelect = 'none';

            this.onCleanup(() => {
                target.style.touchAction = '';
                target.style.userSelect = '';
            });
        }
    },
};
