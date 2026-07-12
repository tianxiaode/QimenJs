/**
 * OverlayAbility — 浮层管理能力（宿主侧）
 *
 * 宿主只负责：
 * - 从 ComponentRegistrar 查找浮层组件类
 * - 创建浮层实例，传入 anchor（宿主 el）和配置
 * - 在宿主上生成委托方法（openXxx/closeXxx/positionXxx）
 *
 * 浮层组件自身负责：
 * - 定位计算、z-index 管理、OverlayRoot 挂载（由 OverlayHostAbility 提供）
 * - open/close 生命周期、resize/scroll 监听
 * - dispose 时清理所有资源
 *
 * Tooltip 专属逻辑已拆分到 TooltipAbility。
 */

import type { AbilityDefinition } from '@/composable';
import { ComponentRegistrar } from '../ComponentRegistrar';
import type { Placement } from './positionOverlay';

/**
 * 浮层配置
 */
export interface OverlayConfig {
    /** 浮层类型前缀，对应 ComponentRegistrar 中注册的组件类名，如 'Tips'、'Dropdown'、'Popover' */
    prefix: string;
    /** 覆盖从 prefix 推导的组件类查找名，用于差异化浮层组件 */
    typeOverride?: string;
    /** 传递给浮层组件的 props（anchor 会自动注入） */
    overlayProps?: Record<string, any>;
}

/**
 * 浮层创建结果
 */
export interface OverlayResult {
    /** 浮层组件实例 */
    overlayInstance: any;
    /** 浮层 DOM 元素 */
    overlayEl: HTMLElement;
}

export const OverlayAbility: AbilityDefinition = {
    /**
     * 创建浮层
     *
     * 从 ComponentRegistrar 查找浮层组件类，创建实例并传入 anchor。
     * 浮层组件自身负责定位、显隐、z-index、事件等全部逻辑。
     * 宿主上生成 openXxx/closeXxx/positionXxx 委托方法。
     *
     * @param config - 浮层配置
     * @returns 浮层组件实例和 DOM 元素，组件类未注册时返回 null
     */
    createOverlay(config: OverlayConfig): OverlayResult | null {
        const { prefix } = config;
        const capitalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);

        // ── 1. 从 ComponentRegistrar 查找浮层组件类 ──

        const lookupName = config.typeOverride ?? capitalPrefix;
        const OverlayClass = ComponentRegistrar.getInstance().get(lookupName);
        if (!OverlayClass) return null;

        // ── 2. 创建浮层组件实例，传入 anchor 和配置 ──

        const overlayInstance = new OverlayClass({
            anchor: this.el,
            ...config.overlayProps,
        });
        const overlayEl = overlayInstance.el;
        if (!overlayEl) return null;

        // ── 3. 在宿主上生成委托方法 ──

        const generatedProps: string[] = [];

        // openXxx → 浮层 overlay.open()
        (this as any)[`open${capitalPrefix}`] = () => {
            if (typeof overlayInstance.open === 'function') {
                overlayInstance.open();
            }
        };

        // closeXxx → 浮层 overlay.close()
        (this as any)[`close${capitalPrefix}`] = () => {
            if (typeof overlayInstance.close === 'function') {
                overlayInstance.close();
            }
        };

        // positionXxx → 浮层 overlay.reposition()
        (this as any)[`position${capitalPrefix}`] = () => {
            if (typeof overlayInstance.reposition === 'function') {
                overlayInstance.reposition();
            }
        };

        generatedProps.push(`open${capitalPrefix}`, `close${capitalPrefix}`, `position${capitalPrefix}`);

        // placement getter/setter → 委托给浮层
        const placementPropName = `${prefix}Placement`;
        Object.defineProperty(this, placementPropName, {
            get: () => overlayInstance.placement,
            set: (v: Placement) => { overlayInstance.placement = v; },
            configurable: true,
            enumerable: true,
        });

        generatedProps.push(placementPropName);

        // ── 4. 注册 onCleanup 清理回调 ──

        this.onCleanup(() => {
            // 销毁浮层组件实例
            if (typeof overlayInstance.dispose === 'function') {
                overlayInstance.dispose();
            }

            for (const prop of generatedProps) {
                delete (this as any)[prop];
            }
        });

        return { overlayInstance, overlayEl };
    },
};
