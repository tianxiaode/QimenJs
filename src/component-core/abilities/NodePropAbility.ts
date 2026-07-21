/**
 * NodePropAbility — 节点属性统一读写能力
 *
 * 数据驱动 + 统一分发：
 *   _getNodeProp(nodeName, prop)  → 查 NodePropMap → 读 DOM
 *   _setNodeProp(nodeName, prop, value) → 查 NodePropMap → 写 DOM
 *   _updateNode(nodeName, props)  → 批量写 DOM，一次性更新
 *
 * 三种操作路径（由 NodePropDef 字段决定）：
 * - cssProp 有值 → el.style[cssProp]
 * - attr 有值   → el.getAttribute(attr) / el.setAttribute(attr, value)
 * - 其他        → el[domAttr]
 *
 * flex/grid 布局也走 _updateNode，初始化和运行时共用同一路径。
 *
 * 脏追踪：
 *   _markNodeDirty(nodeName, props) → 收集脏属性，防抖
 *   _flushNodeProps()               → 一次性批量写 DOM
 */

import type { AbilityDefinition } from '@/composable';
import { DEFAULT_NODE_PROP_MAP } from '../types';
import type { NodePropDef } from '../types';
import { ALIGN_MAP, PACK_MAP } from '../utils/template-constants';
import { COMPONENT_LIFECYCLE_EVENTS, globalEventBus } from '@/events';
import { EventContextBuilder } from '@/context';

export const NodePropAbility: AbilityDefinition = {
    _resolveNodeEl(nodeName: string): HTMLElement | undefined {
        const node = this.nodeMap?.[nodeName];
        if (!node) return undefined;
        return node.component ? node.component.el : node.el;
    },

    _getNodeProp(nodeName: string, prop: string): any {
        const el = this._resolveNodeEl(nodeName);
        if (!el) return undefined;

        const def: NodePropDef | undefined = DEFAULT_NODE_PROP_MAP[prop];
        if (!def) return undefined;

        if (def.cssProp) {
            return el.style?.[def.cssProp] ?? '';
        }

        if (def.attr) {
            return el.getAttribute(def.attr);
        }

        return el[def.domAttr];
    },

    _setNodeProp(nodeName: string, prop: string, value: any): void {
        const el = this._resolveNodeEl(nodeName);
        if (!el) return;

        const def: NodePropDef | undefined = DEFAULT_NODE_PROP_MAP[prop];
        if (!def) return;

        applyPropToEl(el, def, value);
    },

    _updateNode(nodeName: string, props: Record<string, any>): void {
        const el = this._resolveNodeEl(nodeName);
        if (!el) return;

        const node = this.nodeMap?.[nodeName];
        if (!node) {
            applyNodeProps(el, props);
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
                        applyNodeProps(el, props);
                        node._state = { ...node._state, ...props };
                    });
                    return;
                }

                if (!willHidden && typeof (this as any).playEnter === 'function') {
                    applyNodeProps(el, props);
                    node._state = { ...node._state, ...props };
                    (this as any).playEnter();
                    return;
                }
            }
        }

        applyNodeProps(el, props);
        node._state = { ...node._state, ...props };
    },

    _markNodeDirty(nodeName: string, props: Record<string, any>): void {
        if (!this._dirtyNodes) this._dirtyNodes = {};

        const existing = this._dirtyNodes[nodeName];
        if (existing) {
            Object.assign(existing, props);
        } else {
            this._dirtyNodes[nodeName] = { ...props };
        }

        this.debounce('NodePropAbility:flush', () => this._flushNodeProps(), 0);
    },

    _flushNodeProps(): void {
        if (!this._dirtyNodes) return;

        const dirty = this._dirtyNodes;
        this._dirtyNodes = {};

        for (const [nodeName, props] of Object.entries(dirty)) {
            const el = this._resolveNodeEl(nodeName);
            if (!el) continue;
            applyNodeProps(el, props as Record<string, any>);
        }
    },

    _emitLifecycleEvent(event: string, data?: any): void {
        if (typeof this.emit === 'function') {
            this.emit(event, data);
        }

        const eventKey = this.eventKey ?? (this.constructor as any).eventKey;
        if (eventKey && typeof this.bridgeEmit === 'function') {
            const ctx = EventContextBuilder.create()
                .withEvent(event)
                .withType(event)
                .withSource(eventKey)
                .withSourceType(this.constructor.name)
                .withData(data)
                .withBusId(globalEventBus.getBusId())
                .build();
            this.bridgeEmit(ctx);
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

function applyCls(el: HTMLElement, value: string | undefined, prevValue?: string): void {
    if (prevValue) {
        const oldSet = new Set(prevValue.split(/\s+/).filter(Boolean));
        for (const cls of oldSet) {
            el.classList.remove(cls);
        }
    }

    if (value) {
        const newSet = value.split(/\s+/).filter(Boolean);
        for (const cls of newSet) {
            el.classList.add(cls);
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
