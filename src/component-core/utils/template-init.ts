/**
 * template-init.ts — 模板实例运行时初始化
 *
 * initFromTemplate: 编译后实例化流程
 *   1. 创建 el + 克隆模板 + buildNodeMap
 *   2. 应用节点属性（样式/布局/DOM属性/状态/内容）→ 统一走 _updateNode
 *   3. 渲染子组件
 *   4. 绑定 DOM 事件
 *   5. 能力初始化
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

export function initFromTemplate(instance: any, props?: Record<string, any>): void {
    instance._initializing = true;

    if (props) instance.props = { ...instance.props, ...props };

    try {
        initElementFromTemplate(instance);

        initNodeProps(instance);

        initContentFromProps(instance);

        renderChildComponents(instance);

        bindDomEventBindings(instance);

        callInitMethods(instance);

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

    if (compiled.rootMeta) {
        instance._updateNode('root', buildNodePropsFromMeta(compiled.rootMeta));
    }

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
    for (const [name, node] of Object.entries(instance.nodeMap as Record<string, NodeMetadata>)) {
        if (!node.el || node.componentClass) continue;

        const nodeProps = buildNodePropsFromMeta(node);
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
    for (const [name, node] of Object.entries(instance.nodeMap as Record<string, NodeMetadata>)) {
        if (!node.componentClass) continue;

        const ComponentClass = node.componentClass;
        const initConfig = node.initConfig ?? {};
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
// 6. 能力初始化
// ══════════════════════════════════════════════════════════════

function callInitMethods(instance: any): void {
    if (typeof instance.callInitMethods === 'function') {
        instance.callInitMethods();
    }
}
