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
import { ALIGN_MAP, PACK_MAP } from '../constants/template-constants';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';

/** 节点属性统一读写能力，提供数据驱动的属性读写、脏追踪与子组件委托 */
export const NodePropAbility: AbilityDefinition = {
    /**

     * 获取节点的属性值
     *
     * 读取指定节点的属性值。优先从脏追踪缓存中读取，其次从子组件属性读取，最后从 DOM 读取。
     * 根据属性定义（NodePropDef）决定读取路径：cssProp、attr 或 domAttr。
     *
     * @param {string} nodeName - 节点名称
     * @param {string} prop - 属性名（如 'hidden', 'disabled', 'width'）
     * @returns {any} 属性值
     *
     * @example
     * const hidden = this._getNodeProp('root', 'hidden');
     * const width = this._getNodeProp('icon', 'width');
     */
    _getNodeProp(this: any, nodeName: string, prop: string): any {
        const pending = this._dirtyNodes?.[nodeName]?.[prop];
        if (pending !== undefined) return pending;

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

    /**
     * 设置节点的单个属性
     *
     * 立即设置指定节点的单个属性值。不经过脏追踪，直接写入。
     * 如果目标节点是子组件且该子组件有同名属性，则委托给子组件处理。
     *
     * @param {string} nodeName - 节点名称
     * @param {string} prop - 属性名
     * @param {any} value - 属性值
     * @returns {void}
     *
     * @example
     * this._setNodeProp('icon', 'hidden', true);
     * this._setNodeProp('root', 'width', '100px');
     */
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

    /**
     * 批量更新节点的属性
     *
     * 一次性更新指定节点的多个属性。支持 flex/grid 布局、hidden 动画等特殊处理。
     * 如果目标节点是子组件，逐属性委托；否则直接应用到 DOM。
     * 会触发 hiddenchange 生命周期事件（root 节点的 hidden 变化）。
     *
     * @param {string} nodeName - 节点名称
     * @param {Record<string, any>} props - 属性对象
     * @returns {void}
     *
     * @example
     * this._updateNode('root', { hidden: true, cls: 'active' });
     * this._updateNode('icon', { flex: { direction: 'column', gap: 10 } });
     */
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

    /**
     * 标记节点属性为脏
     *
     * 将节点属性变更记录到脏追踪缓存，并通过 debounce 延迟批量更新 DOM。
     * 这是 CommonPropsAbility 中属性 setter 的核心机制，避免频繁的 DOM 操作。
     *
     * @param {string} nodeName - 节点名称
     * @param {Record<string, any>} props - 属性对象
     * @returns {void}
     *
     * @example
     * this._markNodeDirty('icon', { hidden: true, cls: 'active' });
     * // 稍后会自动调用 _flushNodeProps 批量更新
     */
    _markNodeDirty(this: any, nodeName: string, props: Record<string, any>): void {
        if (!this._dirtyNodes) this._dirtyNodes = {};

        const existing = this._dirtyNodes[nodeName];
        if (existing) {
            Object.assign(existing, props);
        } else {
            this._dirtyNodes[nodeName] = { ...props };
        }

        this.debounce('NodePropAbility:flush', () => this._flushNodeProps(), 0)();
    },

    /**
     * 刷新脏节点属性
     *
     * 将脏追踪缓存中的所有节点属性批量应用到 DOM。
     * 清空脏追踪缓存后，逐个调用 _updateNode 更新节点。
     *
     * @returns {void}
     *
     * @example
     * // 通常由 debounce 自动调用，也可手动触发
     * this._flushNodeProps();
     */
    _flushNodeProps(this: any): void {
        if (!this._dirtyNodes) return;

        const dirty = this._dirtyNodes;
        this._dirtyNodes = {};

        for (const [nodeName, props] of Object.entries(dirty)) {
            this._updateNode(nodeName, props as Record<string, any>);
        }
    },
};

/**
 * 应用节点属性到 DOM 元素
 *
 * 根据属性类型执行不同的 DOM 操作。支持特殊属性（flex/grid/cls/style/role/attrs/hidden）
 * 和通用属性（通过 NodePropDef）。
 *
 * @param {HTMLElement} el - DOM 元素
 * @param {Record<string, any>} props - 属性对象
 * @returns {void}
 */
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
                if (value === false) {
                    el.removeAttribute('role');
                } else {
                    el.setAttribute('role', value);
                }
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

/**
 * 应用 flex/grid 布局属性
 *
 * 将 flex 或 grid 配置应用到元素的 style 属性。
 * flex 布局支持 direction、gap、align、pack、wrap 参数。
 * grid 布局会自动设置 flexWrap 和 gridTemplateColumns。
 *
 * @param {HTMLElement} el - DOM 元素
 * @param {string} prop - 属性名（'flex' 或 'grid'）
 * @param {any} value - 布局配置对象或布尔值
 * @returns {void}
 */
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

/**
 * 应用 hidden 属性
 *
 * 根据 hiddenMode 参数决定隐藏方式：默认（hidden 属性）、visibility 或 opacity。
 * 取消隐藏时恢复所有隐藏相关的样式。
 *
 * @param {HTMLElement} el - DOM 元素
 * @param {boolean} hidden - 是否隐藏
 * @param {string} [hiddenMode] - 隐藏模式（'visibility' | 'opacity' | 默认）
 * @returns {void}
 */
function applyHidden(el: HTMLElement, hidden: boolean, hiddenMode?: string): void {
    if (!hidden) {
        el.hidden = false;
        el.style.visibility = '';
        el.style.opacity = '';
        return;
    }

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

/**
 * 应用单个属性到 DOM 元素
 *
 * 根据 NodePropDef 定义决定应用方式：
 * - cssProp: 设置 el.style[cssProp]（支持 autoPx 自动加 px）
 * - attr: 设置 HTML 属性（支持 false/null/undefined 移除，true 设置为空字符串）
 * - domAttr: 直接设置 DOM 属性
 *
 * @param {HTMLElement} el - DOM 元素
 * @param {NodePropDef} def - 属性定义
 * @param {any} value - 属性值
 * @returns {void}
 */
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
