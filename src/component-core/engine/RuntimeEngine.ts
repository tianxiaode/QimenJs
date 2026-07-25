/**
 * RuntimeEngine — 运行时引擎
 *
 * 统一编排组件实例的运行时初始化管线。
 * 将原 templateComponentConstructor + initFromTemplate 的散落步骤整合为一条固定管线。
 *
 * 管线步骤（固定顺序）：
 *   1. initInstanceData         — 实例数据初始化
 *   2. executeOverrideQueue     — onInitState（实例状态合并）
 *   3. executeOverrideQueue     — onBeforeInit（初始化前钩子）
 *   4. buildNodeMap             — 创建 NodeMapManager + DOM 构建
 *   5. applyNodeConfigs         — 应用节点配置（原 BodyManager.applyTo）
 *   6. initContentFromProps     — 属性内容填充
 *   7. initI18n                 — i18n 初始化
 *   8. renderChildComponents    — 渲染子组件
 *   9. initFloats               — floats 初始化
 *  10. bindDomEvents             — DOM 事件绑定
 *  11. initDrags                 — 拖拽初始化
 *  12. callInitMethods           — 能力初始化
 *  13. setupListens              — 事件订阅
 *  14. executeOverrideQueue      — onAfterInit（初始化后钩子）
 *  15. emitLifecycle             — 发射生命周期事件
 *
 * 设计原则：
 *   - 同步执行（组件初始化是同步的，不需要 async）
 *   - 固定步骤（不需要动态排序/熔断）
 *   - 轻量（可选开启 debug 追踪）
 */

import type { NodeMetadata } from '../types/compiled-types';
import { NodeMapManager } from '../NodeMapManager';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';
import { SYSTEM_EVENTS } from '@/events';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';
import { dragDispatchCenter } from '@/drag';
import { EventContextBuilder } from '@/context';
import { resolveI18nValue } from '@qimenjs/i18n';
import type { ListenItem, EventMapping } from '../types/tpl-body';
import { Logger } from '@/logger';
import { DelegatedEventEngine } from './DelegatedEventEngine';
import { getId } from '@/utils/string/id';

// ══════════════════════════════════════════════════════════════
// 上下文
// ══════════════════════════════════════════════════════════════

interface RuntimeContext {
    instance: any;
    props?: Record<string, any>;
    ctor: any;
    steps: string[];
    debug: boolean;
}

// ══════════════════════════════════════════════════════════════
// 工具函数
// ══════════════════════════════════════════════════════════════

function logStep(ctx: RuntimeContext, name: string): void {
    if (ctx.debug) {
        ctx.steps.push(name);
    }
}

export function executeOverrideQueue(instance: any, methodName: string, ...args: any[]): any {
    const ctor = instance.constructor as any;
    const queues = ctor._overrideQueues;
    if (!queues || !queues[methodName]) return;

    const hooks = queues[methodName];
    if (methodName === 'onInitState') {
        const mergedState: Record<string, any> = {};
        for (const hook of hooks) {
            const state = hook.apply(instance, args);
            if (state && typeof state === 'object') {
                Object.assign(mergedState, state);
            }
        }
        Object.assign(instance, mergedState);
        return mergedState;
    } else {
        let lastResult: any;
        for (const hook of hooks) {
            lastResult = hook.apply(instance, args);
        }
        return lastResult;
    }
}

// ══════════════════════════════════════════════════════════════
// 管线步骤实现
// ══════════════════════════════════════════════════════════════

function step_initInstanceData(ctx: RuntimeContext): void {
    const { instance, props } = ctx;
    instance.meta = {};
    instance.props = props ? { ...instance.props, ...props } : {};
    instance.dirtySet = new Set();
    instance._initializing = false;
    instance._templateInitialized = false;
    logStep(ctx, 'initInstanceData');
}

function step_onInitState(ctx: RuntimeContext): void {
    executeOverrideQueue(ctx.instance, 'onInitState');
    logStep(ctx, 'onInitState');
}

function step_onBeforeInit(ctx: RuntimeContext): void {
    executeOverrideQueue(ctx.instance, 'onBeforeInit', ctx.props);
    logStep(ctx, 'onBeforeInit');
}

function step_buildNodeMap(ctx: RuntimeContext): void {
    const { instance, ctor } = ctx;

    if (ctor._cache && ctor._nodeMetas) {
        instance.nodeMapMgr = new NodeMapManager(ctor._cache, ctor._nodeMetas, instance);
    }

    instance.el = instance.nodeMapMgr.buildDOM(instance.tag);
    instance.nodeMap = instance.nodeMapMgr.getAll();
    logStep(ctx, 'buildNodeMap');
}

function step_applyNodeConfigs(ctx: RuntimeContext): void {
    const { instance, ctor } = ctx;
    const nodeMapMgr = instance.nodeMapMgr;
    const nodesConfig: Record<string, any> = ctor._nodes || {};
    const nodeOverrides: Record<string, any> = ctor._nodeOverrides || {};
    const allNodes = nodeMapMgr.getAll();

    for (const [name, node] of Object.entries(allNodes) as [string, NodeMetadata][]) {
        if (!node.el || node.componentClass) continue;

        const nodeProps = RuntimeEngine._buildNodePropsFromMeta(node);

        if (nodesConfig[name]) {
            RuntimeEngine._applyNodeConfig(nodeProps, nodesConfig[name], node);
        }

        if (nodeOverrides[name]) {
            const override = nodeOverrides[name];
            Object.assign(nodeProps, override);
        }

        if (Object.keys(nodeProps).length > 0) {
            instance._updateNode(name, nodeProps);
        }
    }
    logStep(ctx, 'applyNodeConfigs');
}

function step_initContent(ctx: RuntimeContext): void {
    const { instance } = ctx;
    const props = instance.props;
    if (!props) return;

    for (const [name, node] of Object.entries(instance.nodeMap as Record<string, NodeMetadata>)) {
        if (!node.el || node.componentClass) continue;

        const nodeProps: Record<string, any> = {};
        const value = props[name];
        if (value !== undefined) {
            nodeProps[
                node.contentMode === 'value' ? 'value' : node.contentMode === 'src' ? 'src' : 'text'
            ] = value;
        }

        if (node.contentMode === 'link') {
            const srcKey = `${name}Src`;
            if (props[srcKey] !== undefined) {
                nodeProps.href = props[srcKey];
            }
        }

        if (Object.keys(nodeProps).length > 0) {
            instance._updateNode(name, nodeProps);
        }
    }
    logStep(ctx, 'initContent');
}

function step_initI18n(ctx: RuntimeContext): void {
    const { instance } = ctx;
    const i18nNodes = instance.nodeMapMgr.i18nNodes;
    if (!i18nNodes || i18nNodes.length === 0) return;

    RuntimeEngine._applyI18nTranslations(instance, i18nNodes);

    if (typeof instance.systemOn === 'function') {
        instance.systemOn(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, () => {
            RuntimeEngine._applyI18nTranslations(instance, i18nNodes);
            if (typeof instance.onLocaleChange === 'function') {
                instance.onLocaleChange();
            }
        });
        instance.systemOn(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, () => {
            RuntimeEngine._applyI18nTranslations(instance, i18nNodes);
            if (typeof instance.onLocaleChange === 'function') {
                instance.onLocaleChange();
            }
        });
    }
    logStep(ctx, 'initI18n');
}

function step_renderChildren(ctx: RuntimeContext): void {
    const { instance, ctor } = ctx;
    const nodesConfig: Record<string, any> = ctor._nodes || {};
    const nodeOverrides: Record<string, any> = ctor._nodeOverrides || {};

    for (const [name, node] of Object.entries(instance.nodeMap as Record<string, NodeMetadata>)) {
        if (!node.componentClass) continue;

        const nodeConfig = nodesConfig[name];
        const override = nodeOverrides[name];
        let ComponentClass = node.componentClass;

        if (nodeConfig?.type) {
            if (typeof nodeConfig.type === 'function') {
                ComponentClass = nodeConfig.type;
            } else if (typeof nodeConfig.type === 'string') {
                const resolved = (window as any)[nodeConfig.type];
                if (resolved) ComponentClass = resolved;
            }
            node.componentClass = ComponentClass;
        }

        if (override?.type) {
            if (typeof override.type === 'function') {
                ComponentClass = override.type;
            } else if (typeof override.type === 'string') {
                const resolved = (window as any)[override.type];
                if (resolved) ComponentClass = resolved;
            }
            node.componentClass = ComponentClass;
        }

        const initConfig = override?.initConfig
            ? { ...(node.initConfig ?? {}), ...override.initConfig }
            : (node.initConfig ?? {});

        const child = new ComponentClass(initConfig);
        (child as any).parent = instance;

        instance.nodeMapMgr.mountChildComponent(node, child);
        instance.nodeMap = instance.nodeMapMgr.getAll();
    }
    logStep(ctx, 'renderChildren');
}

function step_initFloats(ctx: RuntimeContext): void {
    const { instance, ctor } = ctx;
    const floats = ctor._floats;
    if (!floats || Object.keys(floats).length === 0) return;

    const overlayEventBus = OverlayEventBus.getInstance();
    overlayEventBus.overlayEmit(
        EventContextBuilder.create()
            .withEvent(`overlay:${instance.id}:${OVERLAY_ACTIONS.INIT}`)
            .withType(OVERLAY_ACTIONS.INIT)
            .withSource(instance.id)
            .withData({ component: instance, floats })
            .build()
    );
    logStep(ctx, 'initFloats');
}

function step_bindDomEvents(ctx: RuntimeContext): void {
    const { instance } = ctx;
    DelegatedEventEngine.bindDelegatedEvents(instance);
    logStep(ctx, 'bindDomEvents');
}

function step_initDrags(ctx: RuntimeContext): void {
    const { instance, ctor } = ctx;
    const drags = ctor._drags;
    if (!drags || Object.keys(drags).length === 0) return;

    dragDispatchCenter.handleInit(instance.id, { component: instance, drags });
    logStep(ctx, 'initDrags');
}

function step_callInitMethods(ctx: RuntimeContext): void {
    const { instance } = ctx;
    if (typeof instance.callInitMethods === 'function') {
        instance.callInitMethods();
    }
    logStep(ctx, 'callInitMethods');
}

function step_setupListens(ctx: RuntimeContext): void {
    const { instance, ctor } = ctx;
    const listens: ListenItem[] | undefined = ctor.listens;
    if (!listens || listens.length === 0) return;

    for (const item of listens) {
        if ('source' in item) {
            RuntimeEngine._bindBridgeListens(
                instance,
                item as Extract<ListenItem, { source: string }>
            );
        } else if ('entity' in item) {
            RuntimeEngine._bindEntityListens(
                instance,
                item as Extract<ListenItem, { entity: string }>
            );
        } else if ('float' in item) {
            RuntimeEngine._bindFloatListens(
                instance,
                item as Extract<ListenItem, { float: string }>
            );
        } else if ('drag' in item) {
            RuntimeEngine._bindDragListens(instance, item as Extract<ListenItem, { drag: string }>);
        } else if ('system' in item) {
            RuntimeEngine._bindSystemListens(
                instance,
                item as Extract<ListenItem, { system: true }>
            );
        } else if ('route' in item) {
            RuntimeEngine._bindRouteListens(
                instance,
                item as Extract<ListenItem, { route: string }>
            );
        }
    }
    logStep(ctx, 'setupListens');
}

function step_onAfterInit(ctx: RuntimeContext): void {
    const { instance, props, ctor } = ctx;
    if (ctor.type) instance.type = ctor.type;
    instance._templateInitialized = true;
    executeOverrideQueue(instance, 'onAfterInit', props);
    logStep(ctx, 'onAfterInit');
}

function step_emitLifecycle(ctx: RuntimeContext): void {
    const { instance, props } = ctx;
    if (typeof instance._emitLifecycleEvent === 'function') {
        instance._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.INIT, { props });
    }
    logStep(ctx, 'emitLifecycle');
}

// ══════════════════════════════════════════════════════════════
// RuntimeEngine 类
// ══════════════════════════════════════════════════════════════

export class RuntimeEngine {
    private static readonly PIPELINE = [
        step_initInstanceData,
        step_onInitState,
        step_onBeforeInit,
        step_buildNodeMap,
        step_applyNodeConfigs,
        step_initContent,
        step_initI18n,
        step_renderChildren,
        step_initFloats,
        step_bindDomEvents,
        step_initDrags,
        step_callInitMethods,
        step_setupListens,
        step_onAfterInit,
        step_emitLifecycle,
    ];

    static init(instance: any, props?: Record<string, any>): void {
        const ctor = instance.constructor as any;
        const debug = ctor.__runtimeDebug === true;

        const ctx: RuntimeContext = {
            instance,
            props,
            ctor,
            steps: [],
            debug,
        };

        instance._initializing = true;

        try {
            for (const step of RuntimeEngine.PIPELINE) {
                step(ctx);
            }

            instance.id = props?.id || getId('cmp');
        } catch (err) {
            Logger.for(RuntimeEngine).error('RuntimeEngine.init failed:', err);
            throw err;
        } finally {
            instance._initializing = false;
            instance._flushNodeProps?.();

            if (debug) {
                Logger.for(RuntimeEngine).debug(
                    `[${ctor.name}] Pipeline: ${ctx.steps.join(' → ')}`
                );
            }
        }
    }

    // ══════════════════════════════════════════════════════════
    // 内部工具（替代原 BodyManager 方法）
    // ══════════════════════════════════════════════════════════

    static _buildNodePropsFromMeta(meta: NodeMetadata): Record<string, any> {
        const props: Record<string, any> = {};
        if (meta.cls) props.cls = meta.cls;
        if (meta.style) props.style = meta.style;
        if (meta.flex) props.flex = meta.flex;
        if (meta.grid) props.grid = meta.grid;
        if (meta.role) props.role = meta.role;
        if (meta.attrs) props.attrs = meta.attrs;
        if (meta.hidden) {
            props.hidden = meta.hidden;
            if (meta.hiddenMode) props.hiddenMode = meta.hiddenMode;
        }
        return props;
    }

    static _applyNodeConfig(
        nodeProps: Record<string, any>,
        config: Record<string, any>,
        node: NodeMetadata
    ): void {
        const resolved = { ...config };

        if (resolved.addCls !== undefined) {
            const existingCls = nodeProps.cls || '';
            nodeProps.cls = existingCls ? `${existingCls} ${resolved.addCls}` : resolved.addCls;
            delete resolved.addCls;
        }

        if (resolved.type !== undefined) {
            if (typeof resolved.type === 'function') {
                node.componentClass = resolved.type;
            } else if (typeof resolved.type === 'string') {
                node.componentClass = (window as any)[resolved.type];
            }
            delete resolved.type;
        }

        if (resolved.initConfig !== undefined) {
            node.initConfig = { ...(node.initConfig ?? {}), ...resolved.initConfig };
            delete resolved.initConfig;
        }

        Object.assign(nodeProps, resolved);
    }

    static _applyI18nTranslations(
        instance: any,
        i18nNodes: Array<{ name: string; i18nKey: string }>
    ): void {
        for (const { name, i18nKey } of i18nNodes) {
            const node: NodeMetadata = instance.nodeMap[name];
            if (!node) continue;

            const translated = resolveI18nValue(`i18n:${i18nKey}`);
            const contentProp =
                node.contentMode === 'value'
                    ? 'value'
                    : node.contentMode === 'src'
                      ? 'src'
                      : 'text';

            instance._markNodeDirty(name, { [contentProp]: translated });
        }
    }

    // ══════════════════════════════════════════════════════════
    // 事件绑定工具
    // ══════════════════════════════════════════════════════════

    static _resolveHandler(instance: any, mapping: EventMapping): (data: any) => void {
        if (typeof mapping === 'string') {
            const method = instance[mapping];
            if (typeof method === 'function') return method.bind(instance);
            return () => {};
        }
        const method = instance[mapping.handler];
        if (typeof method === 'function') return method.bind(instance);
        return () => {};
    }

    static _bindEventMappings(
        instance: any,
        events: Record<string, EventMapping>,
        binder: (eventName: string, handler: (data: any) => void, once?: boolean) => void
    ): void {
        for (const [eventName, mapping] of Object.entries(events)) {
            const handler = RuntimeEngine._resolveHandler(instance, mapping);
            const once = typeof mapping === 'object' ? mapping.once : false;
            binder(eventName, handler, once);
        }
    }

    static _bindBridgeListens(instance: any, item: Extract<ListenItem, { source: string }>): void {
        if (typeof instance.bridgeOn !== 'function') return;
        RuntimeEngine._bindEventMappings(instance, item.events, (eventName, handler, once) => {
            if (once && typeof instance.bridgeOnce === 'function') {
                instance.bridgeOnce(item.source, eventName, handler);
            } else {
                instance.bridgeOn(item.source, eventName, handler);
            }
        });
    }

    static _bindEntityListens(instance: any, item: Extract<ListenItem, { entity: string }>): void {
        if (typeof instance.entityOn !== 'function') return;
        RuntimeEngine._bindEventMappings(instance, item.events, (eventName, handler, once) => {
            if (once && typeof instance.entityOnce === 'function') {
                instance.entityOnce(item.entity, eventName, handler);
            } else {
                instance.entityOn(item.entity, eventName, handler);
            }
        });
    }

    static _bindFloatListens(instance: any, item: Extract<ListenItem, { float: string }>): void {
        if (typeof instance.overlayOn !== 'function') return;
        RuntimeEngine._bindEventMappings(instance, item.events, (eventName, handler, once) => {
            if (once && typeof instance.overlayOnce === 'function') {
                instance.overlayOnce(item.float, eventName, handler);
            } else {
                instance.overlayOn(item.float, eventName, handler);
            }
        });
    }

    static _bindDragListens(instance: any, item: Extract<ListenItem, { drag: string }>): void {
        if (typeof instance.dragOn !== 'function') return;
        RuntimeEngine._bindEventMappings(instance, item.events, (eventName, handler, once) => {
            if (once && typeof instance.dragOnce === 'function') {
                instance.dragOnce(item.drag, eventName, handler);
            } else {
                instance.dragOn(item.drag, eventName, handler);
            }
        });
    }

    static _bindSystemListens(instance: any, item: Extract<ListenItem, { system: true }>): void {
        if (typeof instance.systemOn !== 'function') return;
        RuntimeEngine._bindEventMappings(instance, item.events, (eventName, handler, once) => {
            if (once && typeof instance.systemOnce === 'function') {
                instance.systemOnce(eventName, handler);
            } else {
                instance.systemOn(eventName, handler);
            }
        });
    }

    static _bindRouteListens(instance: any, item: Extract<ListenItem, { route: string }>): void {
        if (typeof instance.routeOn !== 'function') return;
        RuntimeEngine._bindEventMappings(instance, item.events, (eventName, handler, once) => {
            if (once && typeof instance.routeOnce === 'function') {
                instance.routeOnce(item.route, eventName, handler);
            } else {
                instance.routeOn(item.route, eventName, handler);
            }
        });
    }
}
