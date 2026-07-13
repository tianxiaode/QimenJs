/**
 * OverlayMaskAbility — 遮罩能力
 *
 * 在宿主元素上创建半透明遮罩层，阻止用户交互。
 * 适用于 Dialog 背景遮罩、引导层高亮遮罩、Loading 底层遮罩等场景。
 *
 * 能力状态管理：
 * - _maskEl：遮罩 DOM 引用
 * - _maskVisible：遮罩显隐状态
 *
 * 使用方式：
 * 1. 组件声明 abilities 包含 OverlayMaskAbility
 * 2. constructor 中调用 initMask()
 * 3. 调用 showMask() / hideMask() 控制显隐
 */

import type { AbilityDefinition } from '@/composable';

/**
 * 遮罩配置
 */
export interface OverlayMaskConfig {
    /** 遮罩背景色，默认 'rgba(0, 0, 0, 0.5)' */
    maskColor?: string;
    /** 遮罩 z-index，默认 ''（跟随宿主） */
    maskZIndex?: string;
    /** 是否全屏遮罩，默认 false（相对宿主定位） */
    fullscreen?: boolean;
    /** 点击遮罩是否触发回调 */
    onMaskClick?: () => void;
}

export const OverlayMaskAbility: AbilityDefinition = {
    // ─── 能力状态 ───

    _maskEl: {
        get(): HTMLElement | null {
            return this.abilityState('OverlayMaskAbility:el', null);
        },
        set(value: HTMLElement | null) {
            this.setAbilityState('OverlayMaskAbility:el', value);
        },
    },

    _maskVisible: {
        get(): boolean {
            return this.abilityState('OverlayMaskAbility:visible', false);
        },
        set(value: boolean) {
            this.setAbilityState('OverlayMaskAbility:visible', value);
        },
    },

    // ─── 初始化 ───

    /**
     * 初始化遮罩 — 创建 DOM 节点并挂载到宿主元素
     */
    initMask(config?: OverlayMaskConfig): void {
        const mask = document.createElement('div');
        mask.className = 'q-overlay-mask';
        mask.style.position = config?.fullscreen ? 'fixed' : 'absolute';
        mask.style.top = '0';
        mask.style.left = '0';
        mask.style.width = '100%';
        mask.style.height = '100%';
        mask.style.backgroundColor = config?.maskColor ?? 'rgba(0, 0, 0, 0.5)';
        mask.style.display = 'none';

        if (config?.maskZIndex) {
            mask.style.zIndex = config.maskZIndex;
        }

        // 点击回调
        if (config?.onMaskClick) {
            mask.addEventListener('click', config.onMaskClick);
        }

        this._maskEl = mask;
        this._maskVisible = false;

        // 确保宿主元素是定位上下文
        if (!config?.fullscreen) {
            const position = getComputedStyle(this.el).position;
            if (position === 'static') {
                this.el.style.position = 'relative';
            }
        }

        this.el.appendChild(mask);

        // 清理
        this.onCleanup(() => {
            mask.remove();
            this._maskEl = null;
            this._maskVisible = false;
        });
    },

    // ─── 显隐控制 ───

    /**
     * 显示遮罩
     */
    showMask(): void {
        if (!this._maskEl) return;
        this._maskVisible = true;
        this._maskEl.style.display = '';
    },

    /**
     * 隐藏遮罩
     */
    hideMask(): void {
        if (!this._maskEl) return;
        this._maskVisible = false;
        this._maskEl.style.display = 'none';
    },

    /**
     * 设置遮罩显隐
     */
    setMaskVisible(visible: boolean): void {
        if (visible) {
            this.showMask();
        } else {
            this.hideMask();
        }
    },
};
