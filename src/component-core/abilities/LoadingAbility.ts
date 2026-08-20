/**
 * LoadingAbility — 加载浮层能力
 *
 * 提供 loading 浮层的快捷操作方法，底层通过 FloatAbility 的 show/hide/updateFloat 发送事件。
 * 采用懒加载模式：首次调用 showLoading 时通过 `_getLoadingFloatDecl` 构建 FloatDecl 并注册，
 * 后续操作直接调用 FloatAbility 的通用方法。
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
import type { LoadingOptions } from '../types/options';
import type { FloatDecl } from '../types';

/** 加载浮层能力，提供 show/hide/update 快捷方法 */
export const LoadingAbility: AbilityDefinition = {
    /**
     * 获取 loading 浮层声明
     *
     * 供 showLoading 懒加载时使用。
     *
     * @returns FloatDecl 或 undefined（无配置时）
     */
    _getLoadingFloatDecl(): FloatDecl | undefined {
        const cfg: LoadingOptions | undefined = this.loading;
        if (!cfg) return;

        const { maskMode, mask, ...loadingData } = cfg;

        return {
            type: 'Loading',
            trigger: 'manual',
            anchor: 'self',
            placement: 'anchor-center',
            maskMode: maskMode ?? 'scoped',
            mask: mask ?? true,
            data: loadingData,
        };
    },

    /**
     * 显示加载浮层
     *
     * 首次调用时自动注册浮层声明。
     *
     * @param text - 加载文本（可选）
     * @param maskMode - 遮罩模式（可选）
     *
     * @example
     * this.showLoading();
     * this.showLoading('提交中...', 'global');
     */
    showLoading(text?: string, maskMode?: 'none' | 'scoped' | 'global'): void {
        this._ensureFloat('loading', this._getLoadingFloatDecl());
        if (text !== undefined || maskMode !== undefined) {
            const data: Record<string, any> = {};
            if (text !== undefined) data.text = text;
            if (maskMode !== undefined) data.maskMode = maskMode;
            this.updateFloat('loading', data);
        }
        this.showFloat('loading');
    },

    /**
     * 隐藏加载浮层
     *
     * @example
     * this.hideLoading();
     */
    hideLoading(): void {
        this.hideFloat('loading');
    },

    /**
     * 更新加载浮层数据
     *
     * @param data - 更新数据
     *
     * @example
     * this.updateLoading({ text: '处理中...' });
     */
    updateLoading(data: Record<string, any>): void {
        this.updateFloat('loading', data);
    },
};
