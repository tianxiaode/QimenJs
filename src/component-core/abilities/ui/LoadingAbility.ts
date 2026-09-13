/**
 * LoadingAbility — 加载浮层能力
 *
 * loading option 始终是配置对象，惰性实例化：实例在 show 时才创建。
 * trigger 固定为 manual，由 showLoading() / hideLoading() 手动控制。
 * mask 回归子组件 MaskAbility 管理，父侧只透传 mask 控制字段。
 *
 * 配置结构（控制字段留顶层，子组件 options 放 options 子对象）：
 *   loading: { maskMode: 'scoped', options: { text: '加载中...', spinner: '…' } }
 *
 * @example
 * // 组件 options 中声明
 * loading: { maskMode: 'scoped', options: { text: '加载中...' } }
 *
 * // 运行时操作
 * this.showLoading();
 * this.showLoading('提交中...', 'global');
 * this.hideLoading();
 * this.updateLoading({ text: '处理中...' });
 */

import type { AbilityDefinition } from '@/composable';
import type { LoadingOptions } from '../../types';
import { disposeFloatInstance, resolveFloatMask } from './float-shared';

export const LoadingAbility: AbilityDefinition = {
    _onLoadingOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (value) {
            this._ensureLoading();
        } else {
            disposeFloatInstance(this, 'LoadingAbility:instance');
        }
    },

    _getLoadingDecl(): any {
        const cfg: LoadingOptions = this.loading || ({} as LoadingOptions);
        return {
            type: 'loading',
            trigger: 'manual',
            anchor: 'self',
            placement: 'anchor-center',
            maskMode: cfg.maskMode ?? 'scoped',
            options: { ...(cfg.options ?? {}) },
        };
    },

    _getLoadingInstance(): any {
        return this.abilityState('LoadingAbility:instance');
    },

    _ensureLoading(): any {
        const existing = this._getLoadingInstance();
        if (existing) return existing;

        const decl = this._getLoadingDecl();
        if (!decl) return null;
        const OverlayClass =
            typeof decl.type === 'function' ? decl.type : this.resolveComponent(decl.type);
        if (!OverlayClass) {
            this.logger?.warn?.(`[LoadingAbility] overlay type not found: ${decl.type}`);
            return null;
        }

        const anchorEl = this.el!;
        const constr: any = {
            ...decl.options,
            placement: decl.placement,
        };
        const mask = resolveFloatMask(decl);
        if (mask) constr.mask = mask;

        const overlay = new OverlayClass(constr);
        overlay.anchor = anchorEl;
        this.setAbilityState('LoadingAbility:instance', overlay);
        this.onCleanup(() => {
            overlay.dispose();
            this.setAbilityState('LoadingAbility:instance', undefined);
        });
        return overlay;
    },

    showLoading(text?: string, maskMode?: 'none' | 'scoped' | 'global'): void {
        const inst = this._ensureLoading();
        if (!inst) return;
        if (text !== undefined) {
            inst.text = text;
        }
        if (maskMode !== undefined) {
            inst.maskMode = maskMode;
            inst.mask = maskMode === 'scoped' ? 'scoped' : maskMode === 'global' ? true : false;
        }
        inst.show();
    },

    hideLoading(): void {
        const inst = this._getLoadingInstance();
        if (inst) {
            inst.hide();
        }
    },

    updateLoading(patch: Record<string, any>): void {
        const cfg = this.loading;
        if (!cfg) return;
        if (typeof cfg === 'object') {
            this.setData('loading', {
                ...cfg,
                options: { ...(cfg.options ?? {}), ...patch },
            });
        }
        const inst = this._getLoadingInstance();
        if (inst) {
            inst.update(patch);
        }
    },
} satisfies AbilityDefinition;
