/**
 * NodePropAbility — 节点属性统一读写能力
 *
 * 数据驱动 + 统一分发：
 *   _getNodeProp(nodeName, prop)  → 查 NodePropMap → 读 DOM（子组件有同名属性时委托）
 *   _setNodeProp(nodeName, prop, value) → 查 NodePropMap → 写 DOM（子组件有同名属性时委托）
 *   _updateNode(nodeName, props)  → 批量写 DOM，一次性更新（子组件委托属性系统）
 *
 * 三种操作路径（由 NodePropDef 字段决定）：
 * - cssProp 有值 → el.style[cssProp]
 * - attr 有值   → el.getAttribute(attr) / el.setAttribute(attr, value)
 * - 其他        → el[domAttr]
 *
 * 子组件委托：
 *   _resolveNodeTarget(nodeName) → { el, component }
 *   子组件有同名属性时走 component[prop]，否则走 component.el 或 node.el
 *   _updateNode 对子组件逐属性委托，有同名属性走 setter，无则直接操作 el
 *
 * flex/grid 布局也走 _updateNode，初始化和运行时共用同一路径。
 *
 * 脏追踪：
 *   _markNodeDirty(nodeName, props) → 收集脏属性，防抖
 *   _flushNodeProps()               → 一次性批量写 DOM（子组件委托）
 */

import type { AbilityDefinition } from '@/composable';
import { DEFAULT_NODE_PROP_MAP } from '../types';
import type { NodePropDef } from '../types';
import { ALIGN_MAP, PACK_MAP } from '../utils/template-constants';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';

export const NodePropAbility: AbilityDefinition = {
    _resolveNodeEl(this: any, nodeName: string): HTMLElement | undefined {
        const node = this.nodeMap?.[nodeName];
        if (!node) return undefined;
        return node.component ? node.component.el : node.el;
    },

    _resolveNodeTarget(this: any, nodeName: string): { el?: HTMLElement; component?: any } {
        const node = this.nodeMap?.[nodeName];
        if (!node) return {};
        return { el: node.el, component: node.component };
    },

    _getNodeProp(this: any, nodeName: string, prop: string): any {
        const { el, component } = this._resolveNodeTarget(nodeName);
        if (!el && !component) return undefined;

        if (component && prop in component) {
            return component[prop];
        }

        const target = component?.el ?? el;
        if (!target) return undefined;

        const def: NodePropDef | undefined = DEFAULT_NODE_PROP_MAP[prop];
        if (!def) return undefined;

        if (def.cssProp) {
            return target.style?.[def.cssProp] ?? '';
        }

        if (def.attr) {
            return target.getAttribute(def.attr);
        }

        return (target as any)[def.domAttr];
    },

    _setNodeProp(this: any, nodeName: string, prop: string, value: any): void {
        const { el, component } = this._resolveNodeTarget(nodeName);
        if (!el && !component) return;

        if (component && prop in component) {
            component[prop] = value;
            return;
        }

        const target = component?.el ?? el;
        if (!target) return;

        const def: NodePropDef | undefined = DEFAULT_NODE_PROP_MAP[prop];
        if (!def) return;

        applyPropToEl(target, def, value);
    },

    _updateNode(this: any, nodeName: string, props: Record<string, any>): void {
        const { el, component } = this._resolveNodeTarget(nodeName);
        if (!el && !component) return;

        const node = this.nodeMap?.[nodeName];
        if (!node) {
            const target = component?.el ?? el;
            if (target) applyNodeProps(target, props);
            return;
        }

        if (component) {
            for (const [prop, value] of Object.entries(props)) {
                if (value === undefined) continue;
                if (prop in component) {
                    component[prop] = value;
                } else if (component.el) {
                    applyNodeProps(component.el, { [prop]: value });
                }
            }
            if (!node._state) node._state = {};
            node._state = { ...node._state, ...props };
            return;
        }

        if (!node._state) node._state = {};

        if ('hidden' in props && nodeName === 'root') {
            const wasHidden = node._state.hidden ?? false;
            const willHidden = !!props.hidden;

            if (wasHidden !== willHidden) {
                this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.HIDDEN_CHANGE, {
                    hidden: willHidden,
                    previous: wasHidden,
                });

                if (willHidden && typeof (this as any).playLeave === 'function') {
                    (this as any).playLeave().then(() => {
                        applyNodeProps(el!, props);
                        node._state = { ...node._state, ...props };
                    });
                    return;
                }

                if (!willHidden && typeof (this as any).playEnter === 'function') {
                    applyNodeProps(el!, props);
                    node._state = { ...node._state, ...props };
                    (this as any).playEnter();
                    return;
                }
            }
        }

        applyNodeProps(el!, props);
        node._state = { ...node._state, ...props };
    },

    _markNodeDirty(this: any, nodeName: string, props: Record<string, any>): void {
        if (!this._dirtyNodes) this._dirtyNodes = {};

        const existing = this._dirtyNodes[nodeName];
        if (existing) {
            Object.assign(existing, props);
        } else {
            this._dirtyNodes[nodeName] = { ...props };
        }

        this.debounce('NodePropAbility:flush', () => this._flushNodeProps(), 0);
    },

    _flushNodeProps(this: any): void {
        if (!this._dirtyNodes) return;

        const dirty = this._dirtyNodes;
        this._dirtyNodes = {};

        for (const [nodeName, props] of Object.entries(dirty)) {
            this._updateNode(nodeName, props as Record<string, any>);
        }
    },
};

function applyNodeProps(el: HTMLElement, props: Record<string, any>): void {
    for (const [prop, value] of Object.entries(props)) {
        if (value === undefined) continue;

        switch (prop) {
            case 'flex':
            case 'grid':
                applyFlexGrid(el, prop, value);
                break;
            case 'cls':
                el.className = value;
                break;
            case 'style':
                if (typeof value === 'string') {
                    el.setAttribute('style', value);
                } else {
                    Object.assign(el.style, value);
                }
                break;
            case 'role':
                el.setAttribute('role', value);
                break;
            case 'attrs':
                for (const [k, v] of Object.entries(value)) {
                    el.setAttribute(k, v as string);
                }
                break;
            case 'hidden':
                applyHidden(el, value, props.hiddenMode);
                break;
            default: {
                const def: NodePropDef | undefined = DEFAULT_NODE_PROP_MAP[prop];
                if (def) applyPropToEl(el, def, value);
                break;
            }
        }
    }
}

function applyFlexGrid(el: HTMLElement, prop: string, value: any): void {
    if (!value) return;

    el.style.display = 'flex';

    if (prop === 'flex') {
        if (typeof value === 'object') {
            if (value.direction)
                el.style.flexDirection = value.direction === 'column' ? 'column' : 'row';
            if (value.gap !== undefined)
                el.style.gap = typeof value.gap === 'number' ? `${value.gap}px` : value.gap;
            if (value.align) el.style.alignItems = ALIGN_MAP[value.align] ?? value.align;
            if (value.pack) el.style.justifyContent = PACK_MAP[value.pack] ?? value.pack;
            if (value.wrap !== undefined) el.style.flexWrap = value.wrap ? 'wrap' : 'nowrap';
        } else {
            el.style.flexDirection = 'row';
        }
    }

    if (prop === 'grid') {
        if (typeof value === 'object') {
            el.style.flexDirection = 'row';
            el.style.flexWrap = 'wrap';
            if (value.columns) el.style.gridTemplateColumns = `repeat(${value.columns}, 1fr)`;
            if (value.gap !== undefined)
                el.style.gap = typeof value.gap === 'number' ? `${value.gap}px` : value.gap;
        } else {
            el.style.flexDirection = 'row';
            el.style.flexWrap = 'wrap';
        }
    }
}

function applyHidden(el: HTMLElement, hidden: boolean, hiddenMode?: string): void {
    if (!hidden) return;

    switch (hiddenMode) {
        case 'visibility':
            el.style.visibility = 'hidden';
            break;
        case 'opacity':
            el.style.opacity = '0';
            break;
        default:
            el.hidden = true;
            break;
    }
}

function applyPropToEl(el: HTMLElement, def: NodePropDef, value: any): void {
    if (def.cssProp) {
        if (el.style) {
            (el.style as any)[def.cssProp] =
                def.autoPx && typeof value === 'number' ? `${value}px` : value;
        }
        return;
    }

    if (def.attr) {
        if (value === false || value === null || value === undefined) {
            el.removeAttribute(def.attr);
        } else {
            el.setAttribute(def.attr, value === true ? '' : String(value));
        }
        return;
    }

    (el as any)[def.domAttr] = value;
}
