/**
 * FloatAbility — 浮层管理能力
 *
 * 提供浮层的完整生命周期管理，包括缓存管理、事件发射、diff/sync，
 * 以及通用的 show/hide/toggle/update/attach/detach API。
 * 各浮层类型（tooltip/dialog/popover/indicator/loading）的快捷方法
 * 由对应的独立能力提供。
 *
 * 通信链路：
 *   能力 → overlayEmit → OverlayDispatchCenter → 创建/管理浮层组件
 *
 * @see TooltipAbility 提示浮层能力
 * @see DialogAbility 对话框浮层能力
 * @see PopoverAbility 弹出层能力
 * @see IndicatorAbility 指示器浮层能力
 * @see LoadingAbility 加载浮层能力
 */

import type { AbilityDefinition } from '@/composable';
import { EventContextBuilder } from '@/context';
import { OVERLAY_ACTIONS } from '@/events';
import { getId } from '@/utils/string';
import { FLOAT_CACHE_KEY, FLOAT_AUTO_KEYS } from '../constants/float';
import type { FloatDecl } from '../types';

/** 浮层管理能力，提供 show/hide/toggle/update/attach/detach 等通用 API */
export const FloatAbility: AbilityDefinition = {
    // ── 缓存管理 ──

    get floats(): Record<string, FloatDecl> | undefined {
        const cache = this.abilityState(FLOAT_CACHE_KEY, () => ({})) ?? {};
        return Object.keys(cache).length > 0 ? cache : undefined;
    },

    set floats(val: Record<string, FloatDecl> | undefined) {
        const prev = this.abilityState(FLOAT_CACHE_KEY) ?? {};
        if (this._initializing) {
            const merged = val ? { ...prev, ...val } : prev;
            this.setAbilityState(FLOAT_CACHE_KEY, merged);
            return;
        }
        const next = val ?? {};
        this.setAbilityState(FLOAT_CACHE_KEY, next);
        this._syncFloats(prev, next);
    },

    // ── 事件发射 ──

    _ensureComponentId(): string {
        if (!this.id) {
            this.id = this.props?.id || getId('cmp');
        }
        return this.id;
    },

    _emitInit(key: string, decl: FloatDecl): void {
        const componentId = this._ensureComponentId();
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${componentId}:${OVERLAY_ACTIONS.INIT}`)
                .withType(OVERLAY_ACTIONS.INIT)
                .withSource(componentId)
                .withData({ component: this, floats: { [key]: decl } })
                .build()
        );
    },

    _emitAction(key: string, action: string): void {
        const overlayKey = `${this.id}:${key}`;
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${action}`)
                .withType(action)
                .withSource(overlayKey)
                .withData({ component: this })
                .build()
        );
    },

    _emitControl(action: string, key: string): void {
        const overlayKey = `${this.id}:${key}`;
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${action}`)
                .withType(action)
                .withSource(overlayKey)
                .withData({ component: this })
                .build()
        );
    },

    _emitChange(key: string, data: Record<string, any>): void {
        const overlayKey = `${this.id}:${key}`;
        this.overlayEmit(
            EventContextBuilder.create()
                .withEvent(`overlay:${overlayKey}:${OVERLAY_ACTIONS.CHANGE}`)
                .withType(OVERLAY_ACTIONS.CHANGE)
                .withSource(overlayKey)
                .withData({ component: { id: this.id }, data })
                .build()
        );
    },

    // ── Diff & Sync ──

    _syncFloats(prev: Record<string, FloatDecl>, next: Record<string, FloatDecl>): void {
        this._ensureComponentId();

        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);

        const removed = prevKeys.filter(k => !nextKeys.includes(k));
        const added = nextKeys.filter(k => !prevKeys.includes(k));
        const changed = nextKeys.filter(
            k => prevKeys.includes(k) && JSON.stringify(prev[k]) !== JSON.stringify(next[k])
        );

        for (const key of removed) {
            this._emitAction(key, OVERLAY_ACTIONS.DISPOSE);
        }
        for (const key of added) {
            this._emitInit(key, next[key]);
        }
        for (const key of changed) {
            this._emitAction(key, OVERLAY_ACTIONS.DISPOSE);
            this._emitInit(key, next[key]);
        }
    },

    // ── 提交 ──

    _commitFloats(): void {
        for (const key of FLOAT_AUTO_KEYS) {
            const getter = `_get${key.charAt(0).toUpperCase() + key.slice(1)}FloatDecl`;
            const fn = (this as any)[getter];
            if (typeof fn === 'function') {
                const decl = fn.call(this) as FloatDecl | undefined;
                if (decl) this.attachFloat(key, decl);
            }
        }

        const cache = this.abilityState(FLOAT_CACHE_KEY) ?? {};
        if (Object.keys(cache).length === 0) return;
        this._syncFloats({}, cache);
    },

    // ── 结构变更方法 ──

    attachFloat(key: string, decl: FloatDecl): void {
        const current = this.abilityState(FLOAT_CACHE_KEY) ?? {};
        const merged = { ...current, [key]: decl };

        if (this._initializing) {
            this.setAbilityState(FLOAT_CACHE_KEY, merged);
        } else {
            this.setAbilityState(FLOAT_CACHE_KEY, merged);
            this._syncFloats(current, merged);
        }
    },

    detachFloat(key: string): void {
        const current = this.abilityState(FLOAT_CACHE_KEY) ?? {};
        if (!(key in current)) return;

        const next = { ...current };
        delete next[key];
        const nextVal = Object.keys(next).length > 0 ? next : {};

        if (this._initializing) {
            this.setAbilityState(FLOAT_CACHE_KEY, nextVal);
        } else {
            this.setAbilityState(FLOAT_CACHE_KEY, nextVal);
            this._syncFloats(current, nextVal);
        }
    },

    // ── 懒加载辅助 ──

    /**
     * 确保浮层已注册，未注册则立即注册
     *
     * 供懒加载能力（tooltip/dialog/popover/loading）在 show 时调用。
     *
     * @param key - 浮层 key
     * @param decl - 浮层声明（未注册时使用）
     */
    _ensureFloat(key: string, decl: FloatDecl): void {
        const cache = this.abilityState(FLOAT_CACHE_KEY) ?? {};
        if (key in cache) return;
        this.attachFloat(key, decl);
    },

    // ── 控制操作 ──

    showFloat(key: string): void {
        this._emitControl(OVERLAY_ACTIONS.SHOW, key);
    },

    hideFloat(key: string): void {
        this._emitControl(OVERLAY_ACTIONS.HIDE, key);
    },

    toggleFloat(key: string): void {
        this._emitControl(OVERLAY_ACTIONS.TOGGLE, key);
    },

    // ── 数据更新 ──

    updateFloat(key: string, data: Record<string, any>): void {
        this._emitChange(key, data);
    },
};
