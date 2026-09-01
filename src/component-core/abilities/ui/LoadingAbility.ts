/**
 * LoadingAbility — 加载浮层能力
 *
 * 提供 loading 浮层的快捷操作方法，底层通过 FloatAbility 的 show/hide/updateFloat 发送事件。
 * 通过 `_initLoading` 在初始化阶段根据配置自动注册浮层，
 * 运行时通过 `showLoading` 懒加载（未配置时也可手动调用）。
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
        const delc = this._getLoadingFloatDecl();
        this.attachFloat('loading', delc);
    },

    showLoading(text?: string, maskMode?: 'none' | 'scoped' | 'global'): void {
        const decl = this._getLoadingFloatDecl();
        this._ensureFloat('loading', decl);
        if (text !== undefined || maskMode !== undefined) {
            const data: Record<string, any> = {};
            if (text !== undefined) data.text = text;
            if (maskMode !== undefined) data.maskMode = maskMode;
            this.updateFloat('loading', data);
        }
        this.showFloat('loading');
    },

    hideLoading(): void {
        this.hideFloat('loading');
    },

    updateLoading(data: Record<string, any>): void {
        this.updateFloat('loading', data);
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
