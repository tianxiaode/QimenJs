/**
 * template-init.ts — 模板实例运行时初始化
 *
 * initFromTemplate: 编译后实例化流程
 *   1. 创建 el + 克隆模板 + buildNodeMap
 *   2. 应用节点属性（样式/布局/DOM属性/状态/内容）→ 统一走 _updateNode
 *   3. i18n 初始化 + 绑定 localeChange 事件
 *   4. 渲染子组件
 *   5. 绑定 DOM 事件
 *   6. 播放进入动画
 *   7. 能力初始化
 *
 * 与 template-compiler.ts（编译时）对称，
 * 本文件只处理运行时实例初始化。
 */

import type {
    NodeMetadata,
    NodeIndexPath,
    CompiledComponentTemplate,
} from '../types/compiled-types';
import { findByPath } from './template-compiler';
import { SYSTEM_EVENTS } from '@/events';
import { OverlayEventBus } from '@/events/OverlayEventBus';
import { OVERLAY_ACTIONS } from '@/events/overlay-events';
import { dragDispatchCenter } from '@/drag';
import { EventContextBuilder } from '@/context';
import { resolveI18nValue } from '@qimenjs/i18n';
import type { ListenItem, EventMapping } from '../types/tpl-body';

export function initFromTemplate(instance: any, props?: Record<string, any>): void {
    instance._initializing = true;

    if (props) instance.props = { ...instance.props, ...props };

    try {
        initElementFromTemplate(instance);

        initNodeProps(instance);

        initContentFromProps(instance);

        initI18nFromTemplate(instance);

        renderChildComponents(instance);

        initFloats(instance);

        bindDomEventBindings(instance);

        initDrags(instance);

        callInitMethods(instance);

        setupListens(instance);

        if (props?.id) instance.id = props.id;
    } finally {
        instance._initializing = false;
        instance._flushNodeProps?.();
    }
}

// ══════════════════════════════════════════════════════════════
// 1. 创建 el + 克隆模板 + buildNodeMap
// ══════════════════════════════════════════════════════════════

function initElementFromTemplate(instance: any): void {
    instance.el = document.createElement(instance.tag);

    const ctor = instance.constructor as any;
    const compiled: CompiledComponentTemplate = ctor._compiledTemplate;
    const fragment = compiled.templateCache.content.cloneNode(true);
    instance.el.appendChild(fragment);

    buildNodeMap(instance);
}

function buildNodeMap(instance: any): void {
    const ctor = instance.constructor as any;
    const compiled: CompiledComponentTemplate = ctor._compiledTemplate;
    const indexPath: NodeIndexPath = compiled.indexPath;
    const nodeMetas: Record<string, NodeMetadata> = ctor._nodeMetas;

    for (const [name, path] of Object.entries(indexPath)) {
        const meta = nodeMetas[name];
        if (!meta) continue;

        const el = findByPath(instance.el, path);
        if (!el) continue;

        instance.nodeMap[name] = { ...meta, el };
    }
}

// ══════════════════════════════════════════════════════════════
// 2. 应用节点属性（样式/布局/DOM属性/状态）
// ══════════════════════════════════════════════════════════════

function initNodeProps(instance: any): void {
    const ctor = instance.constructor as any;
    const nodeOverrides: Record<string, Record<string, any>> | undefined = ctor._nodeOverrides;

    for (const [name, node] of Object.entries(instance.nodeMap as Record<string, NodeMetadata>)) {
        if (!node.el || node.componentClass) continue;

        const nodeProps = buildNodePropsFromMeta(node);
        if (nodeOverrides?.[name]) {
            const override = nodeOverrides[name];
            Object.assign(nodeProps, override);
            if (override.events !== undefined) {
                node.events = override.events;
            }
        }
        if (Object.keys(nodeProps).length > 0) {
            instance._updateNode(name, nodeProps);
        }
    }
}

function buildNodePropsFromMeta(meta: NodeMetadata): Record<string, any> {
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

// ══════════════════════════════════════════════════════════════
// 3. 内容填充
// ══════════════════════════════════════════════════════════════

function initContentFromProps(instance: any): void {
    const props = instance.props;
    if (!props) return;

    for (const name of Object.keys(instance.nodeMap as Record<string, any>)) {
        const node: NodeMetadata = instance.nodeMap[name];
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
}

// ══════════════════════════════════════════════════════════════
// 4. 渲染子组件
// ══════════════════════════════════════════════════════════════

function renderChildComponents(instance: any): void {
    const ctor = instance.constructor as any;
    const nodeOverrides: Record<string, Record<string, any>> | undefined = ctor._nodeOverrides;

    for (const [name, node] of Object.entries(instance.nodeMap as Record<string, NodeMetadata>)) {
        if (!node.componentClass) continue;

        const override = nodeOverrides?.[name];
        let ComponentClass = node.componentClass;

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

        mountChildComponent(node, child);
    }
}

function mountChildComponent(node: NodeMetadata, child: any): void {
    const placeholder = node.el!;
    const parentEl = placeholder.parentElement;
    if (parentEl) {
        node.parentNode = parentEl;
        node.nodeIndex = Array.from(parentEl.childNodes).indexOf(placeholder as ChildNode);
    }
    placeholder.replaceWith(child.el);
    node.el = child.el;
    node.component = child;
}

// ══════════════════════════════════════════════════════════════
// 5. 绑定 DOM 事件
// ══════════════════════════════════════════════════════════════

function bindDomEventBindings(instance: any): void {
    if (typeof instance.bindDomEventBindings === 'function') {
        instance.bindDomEventBindings();
    }
}

// ══════════════════════════════════════════════════════════════

// 6.5 拖拽初始化
// ══════════════════════════════════════════════════════════════

function initDrags(instance: any): void {
    const ctor = instance.constructor as any;
    const drags = ctor._drags;
    if (!drags || Object.keys(drags).length === 0) return;

    dragDispatchCenter.handleInit(instance.id, { component: instance, drags });
}

// ══════════════════════════════════════════════════════════════
// 7. 能力初始化
// ══════════════════════════════════════════════════════════════

function callInitMethods(instance: any): void {
    if (typeof instance.callInitMethods === 'function') {
        instance.callInitMethods();
    }
}

// ══════════════════════════════════════════════════════════════
// 3.5 i18n 初始化 + localeChange 事件绑定
// ══════════════════════════════════════════════════════════════

function initI18nFromTemplate(instance: any): void {
    const ctor = instance.constructor as any;
    const i18nNodes: Array<{ name: string; i18nKey: string }> = ctor._i18nNodes;
    if (!i18nNodes || i18nNodes.length === 0) return;

    applyI18nTranslations(instance, i18nNodes);

    if (typeof instance.systemOn === 'function') {
        instance.systemOn(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, () => {
            applyI18nTranslations(instance, i18nNodes);
            if (typeof instance.onLocaleChange === 'function') {
                instance.onLocaleChange();
            }
        });
        instance.systemOn(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, () => {
            applyI18nTranslations(instance, i18nNodes);
            if (typeof instance.onLocaleChange === 'function') {
                instance.onLocaleChange();
            }
        });
    }
}

function applyI18nTranslations(
    instance: any,
    i18nNodes: Array<{ name: string; i18nKey: string }>
): void {
    for (const { name, i18nKey } of i18nNodes) {
        const node: NodeMetadata = instance.nodeMap[name];
        if (!node) continue;

        const translated = resolveI18nValue(`i18n:${i18nKey}`);
        const contentProp =
            node.contentMode === 'value' ? 'value' : node.contentMode === 'src' ? 'src' : 'text';

        instance._markNodeDirty(name, { [contentProp]: translated });
    }
}

function initFloats(instance: any): void {
    const ctor = instance.constructor as any;
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
}

// ══════════════════════════════════════════════════════════════
// 8. listens 统一事件订阅
// ══════════════════════════════════════════════════════════════

function setupListens(instance: any): void {
    const ctor = instance.constructor as any;
    const listens: ListenItem[] | undefined = ctor.listens;
    if (!listens || listens.length === 0) return;

    for (const item of listens) {
        if ('source' in item) {
            bindBridgeListens(instance, item as Extract<ListenItem, { source: string }>);
        } else if ('entity' in item) {
            bindEntityListens(instance, item as Extract<ListenItem, { entity: string }>);
        } else if ('float' in item) {
            bindFloatListens(instance, item as Extract<ListenItem, { float: string }>);
        } else if ('drag' in item) {
            bindDragListens(instance, item as Extract<ListenItem, { drag: string }>);
        } else if ('system' in item) {
            bindSystemListens(instance, item as Extract<ListenItem, { system: true }>);
        } else if ('route' in item) {
            bindRouteListens(instance, item as Extract<ListenItem, { route: string }>);
        }
    }
}

function resolveHandler(instance: any, mapping: EventMapping): (data: any) => void {
    if (typeof mapping === 'string') {
        const method = instance[mapping];
        if (typeof method === 'function') return method.bind(instance);
        return () => {};
    }
    const method = instance[mapping.handler];
    if (typeof method === 'function') return method.bind(instance);
    return () => {};
}

function bindEventMappings(
    instance: any,
    events: Record<string, EventMapping>,
    binder: (eventName: string, handler: (data: any) => void, once?: boolean) => void
): void {
    for (const [eventName, mapping] of Object.entries(events)) {
        const handler = resolveHandler(instance, mapping);
        const once = typeof mapping === 'object' ? mapping.once : false;
        binder(eventName, handler, once);
    }
}

function bindBridgeListens(instance: any, item: Extract<ListenItem, { source: string }>): void {
    if (typeof instance.bridgeOn !== 'function') return;
    bindEventMappings(instance, item.events, (eventName, handler, once) => {
        if (once && typeof instance.bridgeOnce === 'function') {
            instance.bridgeOnce(item.source, eventName, handler);
        } else {
            instance.bridgeOn(item.source, eventName, handler);
        }
    });
}

function bindEntityListens(instance: any, item: Extract<ListenItem, { entity: string }>): void {
    if (typeof instance.entityOn !== 'function') return;
    bindEventMappings(instance, item.events, (eventName, handler, once) => {
        if (once && typeof instance.entityOnce === 'function') {
            instance.entityOnce(item.entity, eventName, handler);
        } else {
            instance.entityOn(item.entity, eventName, handler);
        }
    });
}

function bindFloatListens(instance: any, item: Extract<ListenItem, { float: string }>): void {
    if (typeof instance.overlayOn !== 'function') return;
    bindEventMappings(instance, item.events, (eventName, handler, once) => {
        if (once && typeof instance.overlayOnce === 'function') {
            instance.overlayOnce(item.float, eventName, handler);
        } else {
            instance.overlayOn(item.float, eventName, handler);
        }
    });
}

function bindDragListens(instance: any, item: Extract<ListenItem, { drag: string }>): void {
    if (typeof instance.dragOn !== 'function') return;
    bindEventMappings(instance, item.events, (eventName, handler, once) => {
        if (once && typeof instance.dragOnce === 'function') {
            instance.dragOnce(item.drag, eventName, handler);
        } else {
            instance.dragOn(item.drag, eventName, handler);
        }
    });
}

function bindSystemListens(instance: any, item: Extract<ListenItem, { system: true }>): void {
    if (typeof instance.systemOn !== 'function') return;
    bindEventMappings(instance, item.events, (eventName, handler, once) => {
        if (once && typeof instance.systemOnce === 'function') {
            instance.systemOnce(eventName, handler);
        } else {
            instance.systemOn(eventName, handler);
        }
    });
}

function bindRouteListens(instance: any, item: Extract<ListenItem, { route: string }>): void {
    if (typeof instance.routeOn !== 'function') return;
    bindEventMappings(instance, item.events, (eventName, handler, once) => {
        if (once && typeof instance.routeOnce === 'function') {
            instance.routeOnce(item.route, eventName, handler);
        } else {
            instance.routeOn(item.route, eventName, handler);
        }
    });
}
