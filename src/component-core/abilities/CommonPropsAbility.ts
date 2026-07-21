/**
 * CommonPropsAbility — 两层节点属性架构
 *
 * Layer 1 — root 属性 + 方法：
 *   属性：this.cls = 'xxx' / this.hidden = true
 *   方法：this.addCls('xxx') / this.removeCls('xxx') / this.toggleCls('xxx')
 *
 * Layer 2 — 子节点（nodeName 在末尾，可选）：
 *   方法重载：this.addCls('xxx', 'expand') / this.removeCls('xxx', 'expand')
 *   属性方法：this.setNodeCls('xxx', 'expand') / this.setNodeHidden(true, 'expand')
 *   通用方法：this.setNodeProp('tabIndex', 0, 'expand')
 *
 * 全部委托 NodePropAbility：
 *   _resolveNodeEl(nodeName) — 解析元素（含子组件）
 *   _markNodeDirty(nodeName, props) — 脏追踪写 DOM
 */

import type { AbilityDefinition } from '@/composable';

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

    addCls(value: string, nodeName?: string): void {
        const el = this._resolveNodeEl(nodeName ?? 'root');
        if (el) {
            const c = splitClasses(value);
            if (c.length) el.classList.add(...c);
        }
    },

    removeCls(value: string, nodeName?: string): void {
        const el = this._resolveNodeEl(nodeName ?? 'root');
        if (el) {
            const c = splitClasses(value);
            if (c.length) el.classList.remove(...c);
        }
    },

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
        const el = this._resolveNodeEl(actualNode);
        if (el) el.classList.toggle(cls, actualForce);
    },

    setAttr(key: string, value: string, nodeName?: string): void {
        const el = this._resolveNodeEl(nodeName ?? 'root');
        if (el) el.setAttribute(key, value);
    },

    removeAttr(key: string, nodeName?: string): void {
        const el = this._resolveNodeEl(nodeName ?? 'root');
        if (el) el.removeAttribute(key);
    },

    // ── Layer 2: 子节点属性方法（nodeName 在末尾，委托 _markNodeDirty）──

    setNodeProp(prop: string, value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { [prop]: value });
    },

    setNodeCls(value: string, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { cls: value });
    },

    setNodeStyle(value: any, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { style: value });
    },

    setNodeHidden(value: boolean, nodeName?: string): void {
        this._markNodeDirty(nodeName ?? 'root', { hidden: value });
    },

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
};
