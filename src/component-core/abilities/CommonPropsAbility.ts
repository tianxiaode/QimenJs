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

/**
 * 分割 CSS 类名字符串
 *
 * 将用空格分隔的类名字符串转换为数组，自动过滤空值。
 *
 * @param {string} value - CSS 类名字符串（如 'active hover focus'）
 * @returns {string[]} 类名数组（如 ['active', 'hover', 'focus']）
 *
 * @example
 * splitClasses('a b c'); // ['a', 'b', 'c']
 * splitClasses('  a   b  '); // ['a', 'b']
 */
function splitClasses(value: string): string[] {
    return value.split(/\s+/).filter(Boolean);
}

export const CommonPropsAbility: AbilityDefinition = {
    // ── Layer 1: root 属性（getter/setter）──

    cls: {
        get() {
            return this._getNodeProp('root', 'cls');
        },
        set(v: any) {
            this._markNodeDirty('root', { cls: v });
        },
    },
    style: {
        get() {
            return this._getNodeProp('root', 'style');
        },
        set(v: any) {
            this._markNodeDirty('root', { style: v });
        },
    },
    hidden: {
        get() {
            return this._getNodeProp('root', 'hidden');
        },
        set(v: any) {
            this._markNodeDirty('root', { hidden: v });
        },
    },
    disabled: {
        get() {
            return this._getNodeProp('root', 'disabled');
        },
        set(v: any) {
            this._markNodeDirty('root', { disabled: v });
        },
    },
    order: {
        get() {
            return this._getNodeProp('root', 'order') ?? 0;
        },
        set(v: any) {
            this._markNodeDirty('root', { order: v });
        },
    },
    role: {
        get() {
            return this._getNodeProp('root', 'role');
        },
        set(v: any) {
            this._markNodeDirty('root', { role: v });
        },
    },
    ariaLabel: {
        get() {
            return this._getNodeProp('root', 'ariaLabel');
        },
        set(v: any) {
            this._markNodeDirty('root', { ariaLabel: v });
        },
    },
    ariaChecked: {
        get() {
            return this._getNodeProp('root', 'ariaChecked');
        },
        set(v: any) {
            this._markNodeDirty('root', { ariaChecked: v });
        },
    },
    ariaDisabled: {
        get() {
            return this._getNodeProp('root', 'ariaDisabled');
        },
        set(v: any) {
            this._markNodeDirty('root', { ariaDisabled: v });
        },
    },
    ariaExpanded: {
        get() {
            return this._getNodeProp('root', 'ariaExpanded');
        },
        set(v: any) {
            this._markNodeDirty('root', { ariaExpanded: v });
        },
    },
    ariaSelected: {
        get() {
            return this._getNodeProp('root', 'ariaSelected');
        },
        set(v: any) {
            this._markNodeDirty('root', { ariaSelected: v });
        },
    },
    ariaHidden: {
        get() {
            return this._getNodeProp('root', 'ariaHidden');
        },
        set(v: any) {
            this._markNodeDirty('root', { ariaHidden: v });
        },
    },
    hint: {
        get() {
            return this._getNodeProp('root', 'hint');
        },
        set(v: any) {
            this._markNodeDirty('root', { hint: v });
        },
    },

    width: {
        get() {
            return this._getNodeProp('root', 'width');
        },
        set(v: any) {
            this._markNodeDirty('root', { width: v });
        },
    },
    height: {
        get() {
            return this._getNodeProp('root', 'height');
        },
        set(v: any) {
            this._markNodeDirty('root', { height: v });
        },
    },
    x: {
        get() {
            return this._getNodeProp('root', 'x');
        },
        set(v: any) {
            this._markNodeDirty('root', { x: v });
        },
    },
    y: {
        get() {
            return this._getNodeProp('root', 'y');
        },
        set(v: any) {
            this._markNodeDirty('root', { y: v });
        },
    },
    margin: {
        get() {
            return this._getNodeProp('root', 'margin');
        },
        set(v: any) {
            this._markNodeDirty('root', { margin: v });
        },
    },
    padding: {
        get() {
            return this._getNodeProp('root', 'padding');
        },
        set(v: any) {
            this._markNodeDirty('root', { padding: v });
        },
    },
    fontSize: {
        get() {
            return this._getNodeProp('root', 'fontSize');
        },
        set(v: any) {
            this._markNodeDirty('root', { fontSize: v });
        },
    },
    color: {
        get() {
            return this._getNodeProp('root', 'color');
        },
        set(v: any) {
            this._markNodeDirty('root', { color: v });
        },
    },
    bg: {
        get() {
            return this._getNodeProp('root', 'bg');
        },
        set(v: any) {
            this._markNodeDirty('root', { bg: v });
        },
    },
    cursor: {
        get() {
            return this._getNodeProp('root', 'cursor');
        },
        set(v: any) {
            this._markNodeDirty('root', { cursor: v });
        },
    },
    border: {
        get() {
            return this._getNodeProp('root', 'border');
        },
        set(v: any) {
            this._markNodeDirty('root', { border: v });
        },
    },

    // ── Layer 1+2: 方法（nodeName 在末尾，可选）──

    /**
     * 添加 CSS 类名
     *
     * 为指定节点添加 CSS 类名。支持同时添加多个类名（用空格分隔）。
     * 如果目标节点是子组件且该子组件有 addCls 方法，则委托给子组件处理。
     *
     * @param {string} value - CSS 类名（多个类名用空格分隔，如 'active hover'）
     * @param {string} [nodeName='root'] - 节点名称，默认为 'root'
     * @returns {void}
     *
     * @example
     * // 添加单个类名
     * this.addCls('active');
     *
     * @example
     * // 添加多个类名
     * this.addCls('active hover');
     *
     * @example
     * // 为子节点添加类名
     * this.addCls('active', 'icon');
     */
    addCls(value: string, nodeName?: string): void {
        const { el, component } = this._resolveNodeTarget(nodeName ?? 'root');
        if (component && typeof component.addCls === 'function') {
            component.addCls(value);
            return;
        }
        const target = component?.el ?? el;
        if (target) {
            const c = splitClasses(value);
            if (c.length) target.classList.add(...c);
        }
    },

    /**
     * 移除 CSS 类名
     *
     * 从指定节点移除 CSS 类名。支持同时移除多个类名（用空格分隔）。
     * 如果目标节点是子组件且该子组件有 removeCls 方法，则委托给子组件处理。
     *
     * @param {string} value - CSS 类名（多个类名用空格分隔，如 'active hover'）
     * @param {string} [nodeName='root'] - 节点名称，默认为 'root'
     * @returns {void}
     *
     * @example
     * // 移除单个类名
     * this.removeCls('active');
     *
     * @example
     * // 移除多个类名
     * this.removeCls('active hover');
     *
     * @example
     * // 为子节点移除类名
     * this.removeCls('active', 'icon');
     */
    removeCls(value: string, nodeName?: string): void {
        const { el, component } = this._resolveNodeTarget(nodeName ?? 'root');
        if (component && typeof component.removeCls === 'function') {
            component.removeCls(value);
            return;
        }
        const target = component?.el ?? el;
        if (target) {
            const c = splitClasses(value);
            if (c.length) target.classList.remove(...c);
        }
    },

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
    toggleCls(cls: string, force?: boolean | string, nodeName?: string): void {
        let actualForce: boolean | undefined;
        let actualNode: string;
        if (typeof force === 'string') {
            actualForce = undefined;
            actualNode = force;
        } else {
            actualForce = force;
            actualNode = nodeName ?? 'root';
        }
        const { el, component } = this._resolveNodeTarget(actualNode);
        if (component && typeof component.toggleCls === 'function') {
            component.toggleCls(cls, actualForce);
            return;
        }
        const target = component?.el ?? el;
        if (target) target.classList.toggle(cls, actualForce);
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
    containsCls(cls: string, nodeName?: string): boolean {
        const { el, component } = this._resolveNodeTarget(nodeName ?? 'root');
        if (component && typeof component.containsCls === 'function') {
            return component.containsCls(cls);
        }
        const target = component?.el ?? el;
        return target ? target.classList.contains(cls) : false;
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
        const { el, component } = this._resolveNodeTarget(nodeName ?? 'root');
        if (component && typeof component.setAttr === 'function') {
            component.setAttr(key, value);
            return;
        }
        const target = component?.el ?? el;
        if (target) target.setAttribute(key, value);
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
        const { el, component } = this._resolveNodeTarget(nodeName ?? 'root');
        if (component && typeof component.removeAttr === 'function') {
            component.removeAttr(key);
            return;
        }
        const target = component?.el ?? el;
        if (target) target.removeAttribute(key);
    },

    // ── Layer 2: 子节点属性方法（nodeName 在末尾，委托 _markNodeDirty）──

    /**
     * 设置节点属性（通用方法）
     *
     * 为指定节点设置任意属性的通用方法。内部调用 _markNodeDirty 进行脏追踪。
     *
     * @param {string} prop - 属性名
     * @param {any} value - 属性值
     * @param {string} [nodeName='root'] - 节点名称，默认为 'root'
     * @returns {void}
     *
     * @example
     * // 设置 root 节点的 tabIndex
     * this.setNodeProp('tabIndex', 0);
     *
     * @example
     * // 设置子节点的自定义属性
     * this.setNodeProp('customAttr', 'value', 'icon');
     */
    setNodeProp(prop: string, value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { [prop]: value });
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

    setNodeWidth(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { width: value });
    },

    setNodeHeight(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { height: value });
    },

    setNodeX(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { x: value });
    },

    setNodeY(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { y: value });
    },

    setNodeMargin(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { margin: value });
    },

    setNodePadding(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { padding: value });
    },

    setNodeFontSize(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { fontSize: value });
    },

    setNodeColor(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { color: value });
    },

    setNodeBg(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { bg: value });
    },

    setNodeCursor(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { cursor: value });
    },

    setNodeBorder(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { border: value });
    },

    setNodeHtml(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { html: value });
    },
} as AbilityDefinition;
