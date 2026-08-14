/**
 * CommonPropsAbility — 两层节点属性架构
 *
 * Layer 1 — root 属性 + 方法：
 *   属性：this.cls = 'xxx' / this.hidden = true
 *   方法：this.addCls('xxx') / this.removeCls('xxx') / this.toggleCls('xxx') / this.containsCls('xxx')
 *
 * Layer 2 — 子节点（nodeName 在末尾，可选）：
 *   方法重载：this.addCls('xxx', 'expand') / this.removeCls('xxx', 'expand')
 *   属性方法：this.setNodeCls('xxx', 'expand') / this.setNodeHidden(true, 'expand')
 *   通用方法：this.setNodeProp('tabIndex', 0, 'expand')
 *
 * 子组件委托：
 *   addCls/removeCls/toggleCls — 子组件有同名方法时委托
 *   setAttr/removeAttr — 子组件有同名方法时委托
 *   setNodeXxx/setNodeProp — 通过 _markNodeDirty → _flushNodeProps 委托
 *
 * 全部委托 NodePropAbility：
 *   _resolveNodeTarget(nodeName) — 解析 { el, component }（含子组件）
 *   _resolveNodeEl(nodeName) — 便捷方法，只返回 el
 *   _markNodeDirty(nodeName, props) — 脏追踪写 DOM（子组件有同名属性时委托）
 */

import type { AbilityDefinition } from '@/composable';
import { CURSOR_TYPE, HiddenMode } from '../types';
import { HIDDEN_MODE_CSS_MAP } from '../constants';

/** 两层节点属性能力，提供 root 及子节点的 cls/style/hidden/aria 等属性操作 */
export const CommonPropsAbility: AbilityDefinition = {
    // ── Layer 1: root 属性（getter/setter）──

    cls: {
        get(): DOMTokenList {
            return this.getCls('root');
        },
        set(v: any) {
            this.addCls('root', v);
        },
    },
    style: {
        get() {
            return this.getNodeProp('root', 'style');
        },
        set(v: any) {
            this.setNodeProp('root', { style: v });
        },
    },
    hidden: {
        get() {
            return this.getNodeProp('root', 'hidden');
        },
        set(v: boolean) {
            const css = HIDDEN_MODE_CSS_MAP[this.hiddenMode];
            this.setOption('hidden', v);
            if (v) {
                this.addCls(css);
                this.setAttr('aria-hidden', 'true', 'root');
            } else {
                this.removeCls(css);
                this.removeAttr('aria-hidden', 'root');
            }
        },
    },
    hiddenMode: {
        get(): string {
            return this.getOption('hiddenMode');
        },
        set(v: HiddenMode) {
            this.setOption('hiddenMode', v);
        },
    },
    disabled: {
        get() {
            return this.getOption('disabled') ?? false;
        },
        set(v: boolean) {
            this.setOption('disabled', v);
            if (v) {
                this.addCls(this.disabledCls);
                this.setAttr('aria-disabled', 'true', 'root');
            } else {
                this.removeCls(this.disabledCls);
                this.removeAttr('aria-disabled', 'root');
            }
        },
    },
    order: {
        get() {
            return this.getOption('order') ?? 0;
        },
        set(v: any) {
            this.setOption('order', v);
            this.setNodeProp('root', { order: v });
        },
    },
    role: {
        get() {
            return this.getNodeProp('root', 'aria-role');
        },
        set(v: any) {
            this.setNodeProp('root', { 'aria-role': v });
        },
    },
    hint: {
        get() {
            return this.getNodeProp('root', 'title');
        },
        set(v: string) {
            this.setNodeProp('root', { title: v });
        },
    },
    cursor: {
        get() {
            return this.getNodeProp('root', 'cursor');
        },
        set(v: CURSOR_TYPE) {
            this.setNodeProp('root', { cursor: v });
        },
    },

    // ── Layer 1+2: 方法（nodeName 在末尾，可选）──

    /**
     * 切换 CSS 类名
     *
     * 切换指定节点的 CSS 类名。如果类名存在则移除，不存在则添加。
     * 可通过 force 参数强制添加或移除。
     * 如果目标节点是子组件且该子组件有 toggleCls 方法，则委托给子组件处理。
     *
     * 注意：force 参数为字符串时视为 nodeName 参数，支持重载调用。
     *
     * @param {string} cls - CSS 类名
     * @param {boolean | string} [force] - 强制添加（true）或移除（false），或节点名称
     * @param {string} [nodeName='root'] - 节点名称，默认为 'root'
     * @returns {void}
     *
     * @example
     * // 切换类名
     * this.toggleCls('active');
     *
     * @example
     * // 强制添加类名
     * this.toggleCls('active', true);
     *
     * @example
     * // 强制移除类名
     * this.toggleCls('active', false);
     *
     * @example
     * // 为子节点切换类名（第二个参数为 nodeName）
     * this.toggleCls('active', 'icon');
     *
     * @example
     * // 为子节点强制添加类名
     * this.toggleCls('active', true, 'icon');
     */
    toggleCls(value: string, force?: boolean | string, nodeName?: string): void {
        const cls = this.getCls(nodeName ?? 'root') as DOMTokenList;
        if (!cls) return;
        if (force) {
            cls.add(value);
        } else {
            cls.toggle(value);
        }
        this.setNodeProp('root', { class: cls });
    },

    /**
     * 检查 CSS 类名是否存在
     *
     * 判断指定节点是否包含某个 CSS 类名。
     * 如果目标节点是子组件且该子组件有 containsCls 方法，则委托给子组件处理。
     *
     * @param {string} cls - CSS 类名
     * @param {string} [nodeName='root'] - 节点名称，默认为 'root'
     * @returns {boolean} 类名是否存在
     *
     * @example
     * // 检查 root 节点是否包含类名
     * this.containsCls('active');
     *
     * @example
     * // 检查子节点是否包含类名
     * this.containsCls('active', 'icon');
     */
    containsCls(value: string, nodeName?: string): boolean {
        const cls = this.getCls(nodeName ?? 'root') as DOMTokenList;
        return cls ? cls.contains(value) : false;
    },

    /**
     * 设置 HTML 属性
     *
     * 为指定节点设置 HTML 属性。
     * 如果目标节点是子组件且该子组件有 setAttr 方法，则委托给子组件处理。
     *
     * @param {string} key - 属性名
     * @param {string} value - 属性值
     * @param {string} [nodeName='root'] - 节点名称，默认为 'root'
     * @returns {void}
     *
     * @example
     * // 设置属性
     * this.setAttr('data-id', '123');
     *
     * @example
     * // 为子节点设置属性
     * this.setAttr('data-id', '123', 'icon');
     */
    setAttr(key: string, value: string, nodeName?: string): void {
        this.setNodeProp(key, value, nodeName ?? 'root');
    },

    /**
     * 移除 HTML 属性
     *
     * 从指定节点移除 HTML 属性。
     * 如果目标节点是子组件且该子组件有 removeAttr 方法，则委托给子组件处理。
     *
     * @param {string} key - 属性名
     * @param {string} [nodeName='root'] - 节点名称，默认为 'root'
     * @returns {void}
     *
     * @example
     * // 移除属性
     * this.removeAttr('data-id');
     *
     * @example
     * // 为子节点移除属性
     * this.removeAttr('data-id', 'icon');
     */
    removeAttr(key: string, nodeName?: string): void {
        this.setNodeProp(key, undefined, nodeName ?? 'root');
    },

    /**
     * 设置节点的 CSS 类名
     *
     * @param {string} value - CSS 类名
     * @param {string} [nodeName='root'] - 节点名称
     * @returns {void}
     *
     * @example
     * this.setNodeCls('active', 'icon');
     */
    setNodeCls(value: string, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { cls: value });
    },

    /**
     * 设置节点的样式
     *
     * @param {any} value - 样式值（字符串或对象）
     * @param {string} [nodeName='root'] - 节点名称
     * @returns {void}
     *
     * @example
     * this.setNodeStyle('color: red', 'icon');
     * this.setNodeStyle({ color: 'red', fontSize: '14px' }, 'icon');
     */
    setNodeStyle(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { style: value });
    },

    /**
     * 设置节点的隐藏状态
     *
     * @param {boolean} value - 是否隐藏
     * @param {string} [nodeName='root'] - 节点名称
     * @returns {void}
     *
     * @example
     * this.setNodeHidden(true, 'icon');
     */
    setNodeHidden(value: boolean, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { hidden: value });
    },

    /**
     * 设置节点的禁用状态
     *
     * @param {boolean} value - 是否禁用
     * @param {string} [nodeName='root'] - 节点名称
     * @returns {void}
     *
     * @example
     * this.setNodeDisabled(true, 'icon');
     */
    setNodeDisabled(value: boolean, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { disabled: value });
    },

    setNodeRole(value: string, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { role: value });
    },

    setNodeAriaLabel(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { ariaLabel: value });
    },

    setNodeAriaChecked(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { ariaChecked: value });
    },

    setNodeAriaDisabled(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { ariaDisabled: value });
    },

    setNodeAriaExpanded(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { ariaExpanded: value });
    },

    setNodeAriaSelected(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { ariaSelected: value });
    },

    setNodeAriaHidden(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { ariaHidden: value });
    },

    setNodeHint(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { hint: value });
    },

    setNodeCursor(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { cursor: value });
    },
    setNodeHtml(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { html: value });
    },
} as AbilityDefinition;
