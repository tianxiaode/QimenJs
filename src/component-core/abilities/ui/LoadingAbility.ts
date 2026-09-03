/**
 * LoadingAbility — 加载浮层能力
 *
 * 由能力自行创建 loading 浮层实例并管理生命周期，
 * 创建时不自动显示，由 showLoading 控制显示，实例纳入宿主 onCleanup 自动清理。
 *
 * @example
 * // 组件 options 中声明
 * loading: { text: '加载中...', maskMode: 'scoped' }
 *
 * // 运行时操作
 * this.showLoading();
 * this.showLoading('提交中...', 'global');
 * this.hideLoading();
 * this.updateLoading({ text: '处理中...' });
 */

import type { AbilityDefinition } from '@/composable';
import type { FloatDecl, LoadingOptions } from '../../types';

/** 加载浮层能力，提供 show/hide/update 快捷方法 */
export const LoadingAbility: AbilityDefinition = {
    _initLoading(): void {
        const cfg: LoadingOptions = this.loading;
        if (!cfg) return;
        this._ensureLoadingFloat();
    },

    showLoading(text?: string, maskMode?: 'none' | 'scoped' | 'global'): void {
        const inst = this._ensureLoadingFloat();
        if (!inst) return;
        if (text !== undefined || maskMode !== undefined) {
            const data: Record<string, any> = {};
            if (text !== undefined) data.text = text;
            if (maskMode !== undefined) data.maskMode = maskMode;
            inst.overlay.update(data);
        }
        inst.overlay.show(inst.anchorEl, inst.decl.placement, inst.decl.offset);
    },

    hideLoading(): void {
        const inst = this.abilityState('loading-instance') as
            | { overlay: any }
            | undefined;
        if (inst) {
            inst.overlay.hide();
        }
    },

    updateLoading(data: Record<string, any>): void {
        const inst = this.abilityState('loading-instance') as
            | { overlay: any }
            | undefined;
        if (inst) {
            inst.overlay.update(data);
        }
    },

    _ensureLoadingFloat() {
        const existing = this.abilityState('loading-instance') as any;
        if (existing) return existing;

        const decl = this._getLoadingFloatDecl();
        const OverlayClass = this._resolveFloatType(decl.type);
        if (!OverlayClass) {
            this.logger?.warn?.(`[LoadingAbility] overlay type not found: ${decl.type}`);
            return null;
        }

        const data = typeof decl.data === 'function' ? decl.data() : decl.data;
        const overlay = new OverlayClass({ ...data });
        const anchorEl = this._getFloatAnchor('loading', decl);
        const inst = { overlay, anchorEl, decl };

        if (decl.mask) {
            overlay._initMask?.({
                color: typeof decl.mask === 'string' ? decl.mask : undefined,
                scoped: decl.maskMode === 'scoped',
            });
        }

        this.abilityState('loading-instance', () => inst);
        this.onCleanup(() => this._disposeFloat(inst));
        return inst;
    },

    _getLoadingFloatDecl(): FloatDecl {
        const cfg: LoadingOptions = this.loading || ({} as LoadingOptions);
        const { maskMode, mask, ...loadingData } = cfg;
        return {
            type: 'loading',
            trigger: 'manual',
            anchor: 'self',
            placement: 'anchor-center',
            maskMode: maskMode ?? 'scoped',
            mask: mask ?? true,
            data: loadingData,
        } as FloatDecl;
    },
} satisfies AbilityDefinition;