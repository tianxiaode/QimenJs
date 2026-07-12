/**
 * OverlayAbility — 浮层管理能力
 *
 * 宿主只负责：
 * - 从 ComponentRegistrar 查找浮层组件类
 * - 创建浮层实例，传入 anchor（宿主 el）和配置
 * - 在宿主上生成委托方法（openXxx/closeXxx/positionXxx）
 *
 * 浮层组件自身负责：
 * - 定位计算、z-index 管理、OverlayRoot 挂载
 * - open/close 生命周期、resize/scroll 监听
 * - tooltip 的 hover 事件、delay、i18n 内容
 * - dispose 时清理所有资源
 *
 * 浮层组件事件绑定规范：
 * - 必须使用 DomEventsAbility.bind() 绑定 DOM 事件，禁止直接 addEventListener
 * - hover 事件：this.bind(anchor, 'hover', { delay }) — 走 HoverProcessor
 * - scroll/resize：this.bind(window, 'scroll') / this.bind(window, 'enter') — 走 InputSignal
 * - bind 返回的 unbind 函数由 eventScope 自动管理，dispose 时统一清理
 *
 * Tooltip 属性通过 getTooltip(key) / setTooltip(key, value) 方法访问。
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

/**
 * 支持的 tooltip key 类型
 */
export type TooltipKey = 'tooltip' | 'tooltipPlacement' | 'tooltipOffset' | 'tooltipShowDelay' | 'tooltipHideDelay' | 'tooltipMaxWidth' | 'tooltipType';

/**
 * Tooltip 初始化配置
 */
export interface TooltipOverlayConfig {
    /** Tooltip 文本内容 */
    tooltip?: string;
    /** 弹出方向，默认 'top' */
    tooltipPlacement?: Placement;
    /** 间距，默认 4 */
    tooltipOffset?: number;
    /** 显示延迟，默认 0 */
    tooltipShowDelay?: number;
    /** 隐藏延迟，默认 0 */
    tooltipHideDelay?: number;
    /** 浮层组件类型名，默认 'Tips' */
    tooltipType?: string;
}

/**
 * tooltip 默认值
 */
const TOOLTIP_DEFAULTS: Record<string, any> = {
    tooltipPlacement: 'top',
    tooltipOffset: 4,
    tooltipShowDelay: 0,
    tooltipHideDelay: 0,
    tooltipType: 'Tips',
};

export const OverlayAbility: AbilityDefinition = {
    // ─── Tooltip 属性访问方法 ───

    getTooltip(key: TooltipKey): any {
        if (key in TOOLTIP_DEFAULTS) {
            return this.props[key] ?? TOOLTIP_DEFAULTS[key];
        }
        return this.props[key];
    },

    setTooltip(key: TooltipKey, value: any): void {
        this.setProp(key, value);
    },

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

    /**
     * 初始化 Tooltip 浮层 — 配置驱动
     *
     * 从 ComponentRegistrar 查找 Tips 组件类（或 tooltipType 指定的类），
     * 创建实例并传入 anchor 和全部配置。
     * 浮层组件自身负责 hover 事件、delay、i18n 内容等。
     */
    initTooltipOverlay(config: TooltipOverlayConfig): void {
        const tooltipType = config.tooltipType ?? 'Tips';

        this.createOverlay({
            prefix: 'tips',
            typeOverride: tooltipType !== 'Tips' ? tooltipType : undefined,
            overlayProps: config,
        });
    },
};
