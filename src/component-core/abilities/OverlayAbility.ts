/**
 * OverlayAbility — 浮层管理能力
 *
 * 统一管理组件的浮层（tips/dropdown/popover），
 * 通过 ComponentRegistrar 查找浮层组件类，创建实例并挂载。
 *
 * 模式与 ChildrenAbility.add 一致：
 * - 浮层是完整的 withTemplate 强类，有自己的模板和逻辑
 * - 位置计算在浮层组件内部实现
 * - 想换浮层样式？注册新的 withTemplate 强类覆盖对应 type
 * - LayoutNode 可通过 tooltipType 指定不同的浮层注册名称
 *
 * Tooltip 属性通过 getTooltip(key) / setTooltip(key, value) 方法访问。
 */

import type { AbilityDefinition } from '@/composable';
import { ComponentRegistrar } from '../ComponentRegistrar';
import { ZIndexLevel } from '@/component/z-index';
import { OverlayRoot } from '@/component/OverlayRoot';
import { positionOverlay, type Placement } from './positionOverlay';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';

/**
 * 浮层配置
 */
export interface OverlayConfig {
    /** 浮层类型前缀，对应 ComponentRegistrar 中注册的组件类名，如 'Tips'、'Dropdown'、'Popover' */
    prefix: string;
    /** 弹出方向，默认 'bottom' */
    placement?: Placement;
    /** 浮层与锚点的间距，单位 px，默认 4 */
    offset?: number;
    /** z-index 层级，默认根据 prefix 从 ZIndexLevel 取 */
    zIndexLevel?: number;
    /** 是否启用自动翻转，默认 true */
    flip?: boolean;
    /** 传递给浮层组件的 props */
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

/**
 * 前缀到 z-index 层级的默认映射
 */
const PREFIX_ZINDEX_MAP: Record<string, number> = {
    Tips: ZIndexLevel.tooltip,
    Dropdown: ZIndexLevel.dropdown,
    Popover: ZIndexLevel.dropdown,
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
     * 从 ComponentRegistrar 查找浮层组件类，创建实例并挂载到 OverlayRoot。
     * 浮层组件是 withTemplate 强类，位置计算在组件内部实现。
     *
     * @param config - 浮层配置
     * @returns 浮层组件实例和 DOM 元素，组件类未注册时返回 null
     */
    createOverlay(config: OverlayConfig): OverlayResult | null {
        const { prefix } = config;
        const capitalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        const placement: Placement = config.placement ?? 'bottom';
        const offset: number = config.offset ?? 4;
        const zIndexLevel: number = config.zIndexLevel ?? PREFIX_ZINDEX_MAP[capitalPrefix] ?? ZIndexLevel.dropdown;
        const flip: boolean = config.flip ?? true;

        // ── 1. 从 ComponentRegistrar 查找浮层组件类 ──

        const OverlayClass = ComponentRegistrar.getInstance().get(capitalPrefix);
        if (!OverlayClass) return null;

        // ── 2. 创建浮层组件实例 ──

        const overlayInstance = new OverlayClass(config.overlayProps);
        const overlayEl = overlayInstance.el;
        if (!overlayEl) return null;

        // 设置浮层样式
        overlayEl.classList.add(`q-${prefix}`);
        overlayEl.style.position = 'absolute';
        overlayEl.style.display = 'none';
        overlayEl.style.pointerEvents = 'auto';

        // ── 3. 状态管理 ──

        this.setAbilityState(`Overlay:${prefix}:isOpen`, false);
        this.setAbilityState(`Overlay:${prefix}:placement`, placement);
        this.setAbilityState(`Overlay:${prefix}:zIndexLevel`, zIndexLevel);

        // ── 4. 定位更新回调 ──

        let rafId: number | null = null;

        const onReposition = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                const currentPlacement = this.abilityState(`Overlay:${prefix}:placement`, () => placement);
                if (this.el && overlayEl) {
                    positionOverlay(overlayEl, this.el, currentPlacement, offset, flip);
                }
            });
        };

        // ── 5. 生成控制方法 ──

        const generatedProps: string[] = [];

        const openOverlay = () => {
            const isOpen: boolean = this.abilityState(`Overlay:${prefix}:isOpen`, () => false);
            const currentPlacement = this.abilityState(`Overlay:${prefix}:placement`, () => placement);

            // z-index
            const { nextZIndex } = require('@/component/z-index');
            const zIdx = nextZIndex(zIndexLevel);
            overlayEl.style.zIndex = String(zIdx);
            this.setAbilityState(`Overlay:${prefix}:zIndex`, zIdx);

            // 定位
            if (this.el) {
                positionOverlay(overlayEl, this.el, currentPlacement, offset, flip);
            }

            // 挂载到 OverlayRoot
            const root = OverlayRoot.getInstance().getRoot();
            root.appendChild(overlayEl);

            overlayEl.style.display = '';

            if (!isOpen) {
                window.addEventListener('resize', onReposition);
                window.addEventListener('scroll', onReposition, true);
            }

            this.setAbilityState(`Overlay:${prefix}:isOpen`, true);
        };

        const closeOverlay = () => {
            const isOpen: boolean = this.abilityState(`Overlay:${prefix}:isOpen`, () => false);
            if (!isOpen) return;

            overlayEl.style.display = 'none';

            if (overlayEl.parentNode) {
                overlayEl.parentNode.removeChild(overlayEl);
            }

            const { releaseZIndex } = require('@/component/z-index');
            releaseZIndex(zIndexLevel);

            window.removeEventListener('resize', onReposition);
            window.removeEventListener('scroll', onReposition, true);

            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }

            this.setAbilityState(`Overlay:${prefix}:isOpen`, false);
        };

        const positionOverlayMethod = () => {
            const currentPlacement = this.abilityState(`Overlay:${prefix}:placement`, () => placement);
            if (this.el && overlayEl) {
                positionOverlay(overlayEl, this.el, currentPlacement, offset, flip);
            }
        };

        (this as any)[`open${capitalPrefix}`] = openOverlay;
        (this as any)[`close${capitalPrefix}`] = closeOverlay;
        (this as any)[`position${capitalPrefix}`] = positionOverlayMethod;

        generatedProps.push(`open${capitalPrefix}`, `close${capitalPrefix}`, `position${capitalPrefix}`);

        // placement getter/setter
        const placementPropName = `${prefix}Placement`;
        Object.defineProperty(this, placementPropName, {
            get: () => this.abilityState(`Overlay:${prefix}:placement`, () => placement),
            set: (v: Placement) => {
                this.setAbilityState(`Overlay:${prefix}:placement`, v);
            },
            configurable: true,
            enumerable: true,
        });

        generatedProps.push(placementPropName);

        // ── 6. 注册 onCleanup 清理回调 ──

        this.onCleanup(() => {
            const isOpen: boolean = this.abilityState(`Overlay:${prefix}:isOpen`, () => false);

            if (overlayEl.parentNode) {
                overlayEl.parentNode.removeChild(overlayEl);
            }

            if (isOpen) {
                const { releaseZIndex } = require('@/component/z-index');
                releaseZIndex(zIndexLevel);
            }

            window.removeEventListener('resize', onReposition);
            window.removeEventListener('scroll', onReposition, true);

            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }

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
     * 创建实例并注册 hover 事件。
     */
    initTooltipOverlay(config: TooltipOverlayConfig): void {
        const tooltipType = config.tooltipType ?? 'Tips';

        const result = this.createOverlay({
            prefix: 'tips',
            placement: config.tooltipPlacement ?? 'top',
            offset: config.tooltipOffset ?? 4,
            zIndexLevel: ZIndexLevel.tooltip,
            overlayProps: {
                tooltip: config.tooltip,
                tooltipPlacement: config.tooltipPlacement,
            },
        });

        if (!result) return;

        const { overlayInstance } = result;

        // 设置 tooltip 内容（如果浮层组件有内容属性）
        const tooltipText = config.tooltip ?? '';
        const resolved = tooltipText.startsWith(I18N_PREFIX)
            ? (getI18nManager()?.t(tooltipText.slice(I18N_PREFIX.length)) ?? tooltipText)
            : tooltipText;

        if (typeof overlayInstance.text === 'string' || typeof overlayInstance.text !== 'undefined') {
            overlayInstance.text = resolved;
        }

        // 注册 hover 事件
        const showDelay = config.tooltipShowDelay ?? 0;
        const hideDelay = config.tooltipHideDelay ?? 0;
        let showTimer: ReturnType<typeof setTimeout> | null = null;
        let hideTimer: ReturnType<typeof setTimeout> | null = null;

        const openTips = (this as any).openTips;
        const closeTips = (this as any).closeTips;

        if (typeof openTips === 'function' && typeof closeTips === 'function') {
            this.el.addEventListener('mouseenter', () => {
                if (hideTimer !== null) { clearTimeout(hideTimer); hideTimer = null; }
                showTimer = setTimeout(() => openTips(), showDelay);
            });
            this.el.addEventListener('mouseleave', () => {
                if (showTimer !== null) { clearTimeout(showTimer); showTimer = null; }
                hideTimer = setTimeout(() => closeTips(), hideDelay);
            });
            this.onCleanup(() => {
                if (showTimer !== null) clearTimeout(showTimer);
                if (hideTimer !== null) clearTimeout(hideTimer);
            });
        }

        // i18n 内容 → 注册 localeChange 刷新
        if (tooltipText.startsWith(I18N_PREFIX)) {
            const i18nKey = tooltipText.slice(I18N_PREFIX.length);
            const off = (this as any).on?.('localeChange', () => {
                const translated = getI18nManager()?.t(i18nKey) ?? tooltipText;
                if (typeof overlayInstance.text !== 'undefined') {
                    overlayInstance.text = translated;
                }
            });
            if (typeof off === 'function') {
                this.onCleanup(off);
            }
        }
    },
};
