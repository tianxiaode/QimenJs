/**
 * FloatAbility — 浮层管理能力
 *
 * 提供浮层的完整生命周期管理，包括缓存管理、直接创建/销毁，
 * 以及通用的 show/hide/toggle/update/attach/detach API。
 * 各浮层类型（tooltip/dialog/popover/indicator/loading）的快捷方法
 * 由对应的独立能力提供。
 *
 * 通信链路：
 *   能力 → 直接创建浮层组件实例 → 组件自己管理生命周期
 *
 * @see TooltipAbility 提示浮层能力
 * @see DialogAbility 对话框浮层能力
 * @see PopoverAbility 弹出层能力
 * @see IndicatorAbility 指示器浮层能力
 * @see LoadingAbility 加载浮层能力
 */

import type { AbilityDefinition } from '@/composable';
import { getId } from '@/utils/string';
import { FLOAT_CACHE_KEY } from '../../constants';
import type { FloatDecl } from '../../types';
import { ComponentRegistrar } from '../../ComponentRegistrar';

interface FloatInstance {
    overlay: any;
    anchor: HTMLElement;
    decl: FloatDecl;
}

export const FloatAbility: AbilityDefinition = {
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

    _ensureComponentId(): string {
        if (!this.id) {
            this.id = this.props?.id || getId('cmp');
        }
        return this.id;
    },

    _resolveComponentType(type: string | { new (...args: any[]): any }): any {
        if (typeof type === 'function') return type;
        return ComponentRegistrar.getInstance().getByType(type);
    },

    _getAnchor(key: string, decl: FloatDecl): HTMLElement {
        if (decl.anchor === 'self') {
            return this.el!;
        }
        if (decl.anchor) {
            return this.getNodeEl?.(decl.anchor) ?? this.el!;
        }
        return this.getNodeEl?.(key) ?? this.el!;
    },

    _createOverlay(key: string, decl: FloatDecl): FloatInstance | null {
        this._ensureComponentId();
        const OverlayClass = this._resolveComponentType(decl.type);
        if (!OverlayClass) {
            this.logger?.warn?.(`[FloatAbility] overlay type not found: ${decl.type}`);
            return null;
        }

        const overlayData = typeof decl.data === 'function' ? decl.data() : decl.data;
        const overlayInst = new OverlayClass({ ...overlayData });
        const anchorEl = this._getAnchor(key, decl);

        overlayInst.show(anchorEl, decl.placement, decl.offset);

        if (decl.mask) {
            overlayInst._initMask({
                color: typeof decl.mask === 'string' ? decl.mask : undefined,
                scoped: decl.maskMode === 'scoped',
            });
        }

        return { overlay: overlayInst, anchor: anchorEl, decl };
    },

    _disposeOverlay(key: string): void {
        const inst = this.abilityState(`float-instance:${key}`);
        if (inst) {
            inst.overlay.dispose();
            this.setAbilityState(`float-instance:${key}`, undefined);
        }
    },

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
            this._disposeOverlay(key);
        }
        for (const key of added) {
            const inst = this._createOverlay(key, next[key]);
            if (inst) {
                this.setAbilityState(`float-instance:${key}`, inst);
            }
        }
        for (const key of changed) {
            this._disposeOverlay(key);
            const inst = this._createOverlay(key, next[key]);
            if (inst) {
                this.setAbilityState(`float-instance:${key}`, inst);
            }
        }
    },

    attachFloat(key: string, decl: FloatDecl): void {
        const current = this.abilityState(FLOAT_CACHE_KEY) ?? {};
        const merged = { ...current, [key]: decl };

        if (this._initializing) {
            this.setAbilityState(FLOAT_CACHE_KEY, merged);
        } else {
            this.setAbilityState(FLOAT_CACHE_KEY, merged);
            this._syncFloats(current, merged);
        }

        this._setupFloatTrigger(key, decl);
    },

    detachFloat(key: string): void {
        const current = this.abilityState(FLOAT_CACHE_KEY) ?? {};
        if (!(key in current)) return;

        const bound = this.abilityState('float-trigger-bound');
        if (bound) bound.delete(key);

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

    _setupFloatTrigger(key: string, decl: FloatDecl): void {
        if (decl.trigger === 'manual') return;

        const bound = this.abilityState('float-trigger-bound', () => new Set<string>());
        if (bound.has(key)) return;
        bound.add(key);

        const anchorEl = this._getAnchor(key, decl);

        if (decl.trigger === 'hover') {
            this.onCleanup(this.bind(anchorEl, 'enter'));
            this.onCleanup(this.bind(anchorEl, 'leave'));
            this.onCleanup(
                this.on('dom:enter', (ctx: any) => {
                    const event = ctx?.data?.originalEvent as MouseEvent;
                    if (event && anchorEl.contains(event.target as Node)) {
                        this.showFloat(key);
                    }
                })
            );
            this.onCleanup(
                this.on('dom:leave', (ctx: any) => {
                    const event = ctx?.data?.originalEvent as MouseEvent;
                    if (event && anchorEl.contains(event.target as Node)) {
                        this.hideFloat(key);
                    }
                })
            );
        } else if (decl.trigger === 'click') {
            this.onCleanup(this.bind(anchorEl, 'click'));
            this.onCleanup(
                this.on('dom:click', (ctx: any) => {
                    const event = ctx?.data?.originalEvent as MouseEvent;
                    if (event && anchorEl.contains(event.target as Node)) {
                        this.toggleFloat(key);
                    }
                })
            );
        }
    },

    _ensureFloat(key: string, decl: FloatDecl): void {
        const cache = this.abilityState(FLOAT_CACHE_KEY) ?? {};
        if (key in cache) return;
        this.attachFloat(key, decl);
    },

    showFloat(key: string): void {
        let inst = this.abilityState(`float-instance:${key}`);
        if (!inst) {
            const cache = this.abilityState(FLOAT_CACHE_KEY) ?? {};
            if (key in cache) {
                inst = this._createOverlay(key, cache[key]);
                if (inst) {
                    this.setAbilityState(`float-instance:${key}`, inst);
                    return;
                }
            }
        }
        if (inst) {
            inst.overlay.show(inst.anchor, inst.decl.placement, inst.decl.offset);
        }
    },

    hideFloat(key: string): void {
        const inst = this.abilityState(`float-instance:${key}`);
        if (inst) {
            inst.overlay.hide();
        }
    },

    toggleFloat(key: string): void {
        let inst = this.abilityState(`float-instance:${key}`);
        if (inst) {
            if (inst.overlay.isOpen) {
                inst.overlay.hide();
            } else {
                inst.overlay.show(inst.anchor, inst.decl.placement, inst.decl.offset);
            }
        } else {
            const cache = this.abilityState(FLOAT_CACHE_KEY) ?? {};
            if (key in cache) {
                inst = this._createOverlay(key, cache[key]);
                if (inst) {
                    this.setAbilityState(`float-instance:${key}`, inst);
                }
            }
        }
    },

    updateFloat(key: string, data: Record<string, any>): void {
        const inst = this.abilityState(`float-instance:${key}`);
        if (inst) {
            inst.overlay.update(data);
        }
    },
} satisfies AbilityDefinition;
