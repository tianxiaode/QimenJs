/**
 * FloatAbility — 浮层工具能力
 *
 * 提供浮层操作的通用工具方法，两类使用者：
 *
 * 1. UI 能力（TooltipAbility、PopoverAbility、LoadingAbility、DialogAbility）
 *    使用底层工具 _createFloat / _disposeFloat / _bindFloatTrigger 自管实例。
 *
 * 2. 业务组件（DropdownComponent、NavItemComponent、ItemGroupBaseComponent）
 *    使用 attachFloat / showFloat / hideFloat / detachFloat 通用操作。
 *
 * 不再维护 _syncFloats diff 引擎和 floats 响应式 setter。
 */

import type { AbilityDefinition } from '@/composable';
import type { FloatDecl } from '../../types';
import { ComponentRegistrar } from '../../ComponentRegistrar';

export const FloatAbility: AbilityDefinition = {
    // ═══════════════════════════════════════════════
    // 底层工具
    // ═══════════════════════════════════════════════

    _resolveFloatType(type: string | { new (...args: any[]): any }): any {
        if (typeof type === 'function') return type;
        return ComponentRegistrar.getInstance().get(type);
    },

    _getFloatAnchor(key: string, decl: FloatDecl): HTMLElement {
        if (decl.anchor === 'self') {
            return this.el!;
        }
        if (decl.anchor) {
            return this.getNodeEl?.(decl.anchor) ?? this.el!;
        }
        return this.getNodeEl?.(key) ?? this.el!;
    },

    _createFloat(
        key: string,
        decl: FloatDecl
    ): { overlay: any; anchorEl: HTMLElement; decl: FloatDecl } | null {
        const OverlayClass = this._resolveFloatType(decl.type);
        if (!OverlayClass) {
            this.logger?.warn?.(`[FloatAbility] overlay type not found: ${decl.type}`);
            return null;
        }

        const data = typeof decl.data === 'function' ? decl.data() : decl.data;
        const overlay = new OverlayClass({ ...data });
        const anchorEl = this._getFloatAnchor(key, decl);

        overlay.show(anchorEl, decl.placement, decl.offset);

        if (decl.mask) {
            overlay._initMask?.({
                color: typeof decl.mask === 'string' ? decl.mask : undefined,
                scoped: decl.maskMode === 'scoped',
            });
        }

        return { overlay, anchorEl, decl };
    },

    _disposeFloat(inst: { overlay: any } | null): void {
        inst?.overlay?.dispose();
    },

    _bindFloatTrigger(
        key: string,
        decl: FloatDecl,
        handlers: {
            onShow: () => void;
            onHide: () => void;
            onToggle: () => void;
        }
    ): void {
        if (decl.trigger === 'manual') return;

        const anchorEl = this._getFloatAnchor(key, decl);

        if (decl.trigger === 'hover') {
            this.onCleanup(this.bind(anchorEl, 'enter'));
            this.onCleanup(this.bind(anchorEl, 'leave'));
            this.onCleanup(
                this.on('dom:enter', (ctx: any) => {
                    const event = ctx?.data?.originalEvent as MouseEvent;
                    if (event && anchorEl.contains(event.target as Node)) {
                        handlers.onShow();
                    }
                })
            );
            this.onCleanup(
                this.on('dom:leave', (ctx: any) => {
                    const event = ctx?.data?.originalEvent as MouseEvent;
                    if (event && anchorEl.contains(event.target as Node)) {
                        handlers.onHide();
                    }
                })
            );
        } else if (decl.trigger === 'click') {
            this.onCleanup(this.bind(anchorEl, 'click'));
            this.onCleanup(
                this.on('dom:click', (ctx: any) => {
                    const event = ctx?.data?.originalEvent as MouseEvent;
                    if (event && anchorEl.contains(event.target as Node)) {
                        handlers.onToggle();
                    }
                })
            );
        }
    },

    // ═══════════════════════════════════════════════
    // 通用操作（供业务组件使用）
    // ═══════════════════════════════════════════════

    attachFloat(key: string, decl: FloatDecl): void {
        this.abilityState(`float-decl:${key}`, () => decl);
        this._bindFloatTrigger(key, decl, {
            onShow: () => this.showFloat(key),
            onHide: () => this.hideFloat(key),
            onToggle: () => this.toggleFloat(key),
        });
    },

    showFloat(key: string): void {
        let inst = this.abilityState(`float-instance:${key}`) as any;
        if (!inst) {
            const decl = this.abilityState(`float-decl:${key}`) as any;
            if (!decl) return;
            inst = this._createFloat(key, decl);
            if (!inst) return;
            this.abilityState(`float-instance:${key}`, () => inst);
            this.onCleanup(() => this._disposeFloat(inst));
        } else {
            inst.overlay.show(inst.anchorEl, inst.decl.placement, inst.decl.offset);
        }
    },

    hideFloat(key: string): void {
        const inst = this.abilityState(`float-instance:${key}`) as any;
        if (inst) {
            inst.overlay.hide();
        }
    },

    toggleFloat(key: string): void {
        const inst = this.abilityState(`float-instance:${key}`) as any;
        if (inst && inst.overlay.isOpen) {
            inst.overlay.hide();
        } else {
            this.showFloat(key);
        }
    },

    updateFloat(key: string, data: Record<string, any>): void {
        const inst = this.abilityState(`float-instance:${key}`) as any;
        if (inst) {
            inst.overlay.update(data);
        }
    },

    detachFloat(key: string): void {
        const inst = this.abilityState(`float-instance:${key}`) as any;
        if (inst) {
            this._disposeFloat(inst);
            this.setAbilityState(`float-instance:${key}`, undefined);
        }
        this.setAbilityState(`float-decl:${key}`, undefined);
    },
} satisfies AbilityDefinition;