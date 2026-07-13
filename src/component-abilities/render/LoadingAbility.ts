/**
 * LoadingAbility — 加载状态能力
 *
 * 在宿主元素上显示加载遮罩 + spinner，表示数据加载中。
 * 内部组合 OverlayMaskAbility 提供遮罩层，自身负责 spinner 内容。
 *
 * 能力状态管理：
 * - _loadingEl：加载容器 DOM 引用（包含遮罩 + spinner）
 * - _loadingVisible：加载显隐状态
 *
 * 使用方式：
 * 1. 组件声明 abilities 包含 LoadingAbility（需同时包含 OverlayMaskAbility）
 * 2. constructor 中调用 initLoading()
 * 3. 调用 showLoading() / hideLoading() 控制显隐
 */

import type { AbilityDefinition } from '@/composable';
import { OverlayMaskAbility, type OverlayMaskConfig } from './OverlayMaskAbility';

/**
 * 加载配置
 */
export interface LoadingConfig {
    /** 加载提示文字，默认 '' */
    loadingText?: string;
    /** 遮罩背景色，默认 'rgba(255, 255, 255, 0.7)'（Loading 遮罩偏白） */
    maskColor?: string;
    /** 是否全屏加载，默认 false */
    fullscreen?: boolean;
    /** 自定义 spinner HTML，默认使用 CSS 旋转圆环 */
    spinnerHtml?: string;
    /** 点击遮罩回调 */
    onMaskClick?: () => void;
}

/** 默认 spinner HTML */
const DEFAULT_SPINNER = '<div class="q-loading-spinner"><svg viewBox="0 0 50 50" class="q-loading-svg"><circle class="q-loading-path" cx="25" cy="25" r="20" fill="none" stroke-width="3"></circle></svg></div>';

export const LoadingAbility: AbilityDefinition = {
    // ─── 能力状态 ───

    _loadingEl: {
        get(): HTMLElement | null {
            return this.abilityState('LoadingAbility:el', null);
        },
        set(value: HTMLElement | null) {
            this.setAbilityState('LoadingAbility:el', value);
        },
    },

    _loadingVisible: {
        get(): boolean {
            return this.abilityState('LoadingAbility:visible', false);
        },
        set(value: boolean) {
            this.setAbilityState('LoadingAbility:visible', value);
        },
    },

    // ─── 初始化 ───

    /**
     * 初始化加载能力
     *
     * 创建遮罩层 + spinner，挂载到宿主元素。
     * 内部调用 initMask() 创建遮罩。
     */
    initLoading(config?: LoadingConfig): void {
        // 先初始化遮罩
        const maskConfig: OverlayMaskConfig = {
            maskColor: config?.maskColor ?? 'rgba(255, 255, 255, 0.7)',
            fullscreen: config?.fullscreen,
            onMaskClick: config?.onMaskClick,
        };
        this.initMask(maskConfig);

        // 创建加载内容容器（放在遮罩内部）
        const loadingContent = document.createElement('div');
        loadingContent.className = 'q-loading';
        loadingContent.innerHTML = config?.spinnerHtml ?? DEFAULT_SPINNER;

        // 加载文字
        if (config?.loadingText) {
            const textEl = document.createElement('div');
            textEl.className = 'q-loading-text';
            textEl.textContent = config.loadingText;
            loadingContent.appendChild(textEl);
        }

        // 将加载内容挂到遮罩上
        if (this._maskEl) {
            this._maskEl.appendChild(loadingContent);
        }

        this._loadingEl = loadingContent;
        this._loadingVisible = false;

        // 清理
        this.onCleanup(() => {
            loadingContent.remove();
            this._loadingEl = null;
            this._loadingVisible = false;
        });
    },

    // ─── 显隐控制 ───

    /**
     * 显示加载状态
     */
    showLoading(): void {
        this._loadingVisible = true;
        this.showMask();
    },

    /**
     * 隐藏加载状态
     */
    hideLoading(): void {
        this._loadingVisible = false;
        this.hideMask();
    },

    /**
     * 设置加载显隐
     */
    setLoadingVisible(visible: boolean): void {
        if (visible) {
            this.showLoading();
        } else {
            this.hideLoading();
        }
    },

    /**
     * 更新加载文字
     */
    setLoadingText(text: string): void {
        if (!this._loadingEl) return;
        let textEl = this._loadingEl.querySelector('.q-loading-text');
        if (!textEl) {
            textEl = document.createElement('div');
            textEl.className = 'q-loading-text';
            this._loadingEl.appendChild(textEl);
        }
        textEl.textContent = text;
    },
};
