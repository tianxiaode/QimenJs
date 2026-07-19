/**
 * NodePropAbility — 节点属性统一读写能力
 *
 * 数据驱动 + 统一分发：
 *   _getNodeProp(nodeName, prop)  → 查 NodePropMap → 读 DOM
 *   _setNodeProp(nodeName, prop, value) → 查 NodePropMap → 写 DOM
 *
 * 三种操作路径（由 NodePropDef 字段决定）：
 * - cssProp 有值 → el.style[cssProp]
 * - attr 有值   → el.getAttribute(attr) / el.setAttribute(attr, value)
 * - 其他        → el[domAttr]
 *
 * 原型 getter/setter 极简转发，不生成复杂闭包：
 *   get() { return this._getNodeProp('text', 'cls'); }
 *   set(v) { this._setNodeProp('text', 'cls', v); }
 */

import type { AbilityDefinition } from '@/composable';
import { DEFAULT_NODE_PROP_MAP } from '../types';
import type { NodePropMap, NodePropDef } from '../types';

export const NodePropAbility: AbilityDefinition = {
    static: {
        _nodePropMap: { ...DEFAULT_NODE_PROP_MAP },
    },

    _resolveNodeEl(nodeName: string): HTMLElement | undefined {
        if (nodeName === 'root') return this.el;
        const node = this.nodeMap?.[nodeName];
        if (!node) return undefined;
        return node.component ? node.component.el : node.el;
    },

    _getNodeProp(nodeName: string, prop: string): any {
        const el = this._resolveNodeEl(nodeName);
        if (!el) return undefined;

        const map: NodePropMap = (this.constructor as any)._nodePropMap || DEFAULT_NODE_PROP_MAP;
        const def: NodePropDef | undefined = map[prop];
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

        const map: NodePropMap = (this.constructor as any)._nodePropMap || DEFAULT_NODE_PROP_MAP;
        const def: NodePropDef | undefined = map[prop];
        if (!def) return;

        if (def.cssProp) {
            if (el.style) {
                el.style[def.cssProp] =
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

        el[def.domAttr] = value;
    },
};
