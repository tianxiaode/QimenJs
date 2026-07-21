/**
 * CommonPropsAbility — 组件自身常用属性
 *
 * 组件根元素（this.el）的常用 getter/setter，
 * 通过 _getNodeProp / _markNodeDirty 读写，
 * 组件无需在 body 中手动定义。
 *
 * 这些是组件自身的属性，不是子节点的。
 * 子节点属性由各组件在 body 中按需声明。
 */

import type { AbilityDefinition } from '@/composable';

export const CommonPropsAbility: AbilityDefinition = {
    cls: {
        get() {
            return this._getNodeProp('root', 'cls');
        },
        set(v: any) {
            this._markNodeDirty('root', { cls: v });
        },
    },
    addCls(value: string): void {
        const el = this.el as HTMLElement | undefined;
        if (!el) return;
        const classes = value.split(/\s+/).filter(Boolean);
        if (classes.length) el.classList.add(...classes);
    },
    removeCls(value: string): void {
        const el = this.el as HTMLElement | undefined;
        if (!el) return;
        const classes = value.split(/\s+/).filter(Boolean);
        if (classes.length) el.classList.remove(...classes);
    },
    style: {
        get() {
            return this._getNodeProp('root', 'style');
        },
        set(v: any) {
            this._markNodeDirty('root', { style: v });
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
};
