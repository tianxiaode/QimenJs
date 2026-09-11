/**
 * LoadingAbility — 加载浮层能力
 *
 * loading option 初始化前是配置对象，初始化后变成浮动组件实例。
 * this.loading 直接返回实例，外部代码可 this.loading.show() / this.loading.hide()。
 * 实例复用，trigger 为 manual，由 showLoading/hideLoading 手动控制。
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

export const LoadingAbility: AbilityDefinition = {
    _onLoadingOptionChange(value: any, old: any): void {
        if (value === old) return;
        if (!this._templateInitialized) return;

        if (old && typeof old.show === 'function') {
            if (!value) {
                old.dispose();
                return;
            }
            const cfg: LoadingOptions = this.loading || ({} as LoadingOptions);
            const { maskMode, mask, ...loadingData } = cfg;
            for (const [key, val] of Object.entries(loadingData)) {
                if (val !== undefined) {
                    old[key] = val;
                }
            }
            this._setRawData('loading', old);
            return;
        }

        if (value) {
            this._ensureLoading();
        }
    },

    showLoading(text?: string, maskMode?: 'none' | 'scoped' | 'global'): void {
        const inst = this._ensureLoading();
        if (!inst) return;
        if (text !== undefined || maskMode !== undefined) {
            if (text !== undefined) inst.text = text;
            if (maskMode !== undefined) inst.maskMode = maskMode;
        }
        inst.show();
    },

    hideLoading(): void {
        if (this.loading && typeof this.loading.show === 'function') {
            this.loading.hide();
        }
    },

    updateLoading(data: Record<string, any>): void {
        if (this.loading && typeof this.loading.show === 'function') {
            for (const [key, val] of Object.entries(data)) {
                this.loading[key] = val;
            }
        }
    },

    _ensureLoading(): any {
        if (this.loading && typeof this.loading.show === 'function') {
            return this.loading;
        }

        const cfg: LoadingOptions = this.loading || ({} as LoadingOptions);
        const { maskMode, mask, ...loadingData } = cfg;

        const decl: FloatDecl = {
            type: 'loading',
            trigger: 'manual',
            anchor: 'self',
            placement: 'anchor-center',
            maskMode: maskMode ?? 'scoped',
            mask: mask ?? true,
            data: loadingData,
        };

        const OverlayClass = this._resolveFloatType(decl.type);
        if (!OverlayClass) {
            this.logger?.warn?.(`[LoadingAbility] overlay type not found: ${decl.type}`);
            return null;
        }

        const data = typeof decl.data === 'function' ? decl.data() : decl.data;
        const anchorEl = this._getFloatAnchor('loading', decl);
        const overlay = new OverlayClass({
            ...data,
            anchor: anchorEl,
            placement: decl.placement,
            offset: decl.offset,
        });

        if (decl.mask) {
            overlay.mask = {
                scoped: decl.maskMode === 'scoped',
                color: typeof decl.mask === 'string' ? decl.mask : undefined,
            };
        }

        this.onCleanup(() => overlay.dispose());

        this._setRawData('loading', overlay);

        return overlay;
    },
} satisfies AbilityDefinition;
