/**
 * OverlayAbility — 浮层管理能力
 *
 * 统一管理组件的浮层（tips/dropdown/popover），
 * 提供 createOverlay / openOverlay / closeOverlay / positionOverlay 方法。
 *
 * Tooltip 属性通过 getTooltip(key) / setTooltip(key, value) 方法访问，
 * 不再将 tooltip 系列属性暴露到组件顶层。
 *
 * 浮层创建流程：
 * 1. 从 TemplateRegistrar 获取模板
 * 2. 创建浮层 DOM（position: absolute, display: none）
 * 3. 扫描浮层内 data-content 元素
 * 4. 生成 open/close/position 控制方法
 * 5. 注册 onCleanup 自动清理
 *
 * Tooltip 特化：
 * - initTooltipOverlay(layout) — 配置驱动，LayoutNode 有 tooltip 字段时自动创建
 * - 自动注册 hover 事件（mouseenter/mouseleave + delay）
 * - 支持 i18n 内容 + localeChange 自动刷新
 */

import type { AbilityDefinition } from '@/composable';
import type { LayoutNode } from '@/layout/LayoutNode';
import { TemplateRegistrar } from '@qimenjs/template';
import { RegistryHub } from '@/registry/RegistryHub';
import { nextZIndex, releaseZIndex, ZIndexLevel } from '@/component/z-index';
import { OverlayRoot } from '@/component/OverlayRoot';
import { positionOverlay, type Placement } from './positionOverlay';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';

/**
 * 浮层配置
 */
export interface OverlayConfig {
    /** 浮层类型前缀，如 'tips'、'dropdown'、'popover' */
    prefix: string;
    /** 弹出方向，默认 'bottom' */
    placement?: Placement;
    /** 浮层与锚点的间距，单位 px，默认 4 */
    offset?: number;
    /** z-index 层级，默认根据 prefix 从 ZIndexLevel 取 */
    zIndexLevel?: number;
    /** 是否启用自动翻转，默认 true */
    flip?: boolean;
}

/**
 * 浮层创建结果
 */
export interface OverlayResult {
    /** 浮层 DOM 元素 */
    overlayEl: HTMLElement;
    /** 浮层内的 contentMap（key 为 "prefix:name"） */
    contentMap: Map<string, HTMLElement>;
}

/**
 * 支持的 tooltip key 类型
 */
export type TooltipKey = 'tooltip' | 'tooltipPlacement' | 'tooltipOffset' | 'tooltipShowDelay' | 'tooltipHideDelay' | 'tooltipMaxWidth';

/**
 * tooltip 默认值
 */
const TOOLTIP_DEFAULTS: Record<string, any> = {
    tooltipPlacement: 'top',
    tooltipOffset: 4,
    tooltipShowDelay: 0,
    tooltipHideDelay: 0,
};

/**
 * 前缀到 z-index 层级的默认映射
 */
const PREFIX_ZINDEX_MAP: Record<string, number> = {
    tips: ZIndexLevel.tooltip,
    dropdown: ZIndexLevel.dropdown,
    popover: ZIndexLevel.dropdown,
};

/**
 * 一次性查询容器中所有 data-content 元素
 */
function buildContentMap(container: HTMLElement): Map<string, HTMLElement> {
    const map = new Map<string, HTMLElement>();
    const elements = container.querySelectorAll('[data-content]');
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const key = el.dataset.content!;
        if (key) {
            map.set(key, el);
        }
    }
    return map;
}

export const OverlayAbility: AbilityDefinition = {
    // ─── Tooltip 属性访问方法 ───

    /**
     * 获取 Tooltip 属性值
     *
     * @param key - Tooltip 属性名
     */
    getTooltip(key: TooltipKey): any {
        if (key in TOOLTIP_DEFAULTS) {
            return this.props[key] ?? TOOLTIP_DEFAULTS[key];
        }
        return this.props[key];
    },

    /**
     * 设置 Tooltip 属性值
     *
     * @param key - Tooltip 属性名
     * @param value - 属性值
     */
    setTooltip(key: TooltipKey, value: any): void {
        this.setProp(key, value);
    },

    /**
     * 创建浮层
     *
     * 从 TemplateRegistrar 获取模板，创建浮层 DOM，
     * 生成 open/close/position 控制方法，注册 onCleanup 自动清理。
     *
     * @param config - 浮层配置
     * @returns 浮层 DOM 和 contentMap，模板未注册时返回 null
     */
    createOverlay(config: OverlayConfig): OverlayResult | null {
        const { prefix } = config;
        const capitalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        const placement: Placement = config.placement ?? 'bottom';
        const offset: number = config.offset ?? 4;
        const zIndexLevel: number = config.zIndexLevel ?? PREFIX_ZINDEX_MAP[prefix] ?? ZIndexLevel.dropdown;
        const flip: boolean = config.flip ?? true;

        // ── 1. 从模板注册表获取模板 ──

        const templateId = capitalPrefix;
        const registrar = RegistryHub.get<TemplateRegistrar>('template');
        if (!registrar) return null;

        let template: string;
        try {
            template = registrar.get(templateId);
        } catch {
            return null;
        }

        // ── 2. 创建浮层 DOM ──

        const overlayEl = document.createElement('div');
        overlayEl.innerHTML = template;
        overlayEl.classList.add(`q-${prefix}`);
        overlayEl.style.position = 'absolute';
        overlayEl.style.display = 'none';
        overlayEl.style.pointerEvents = 'auto';

        // ── 3. 扫描浮层内的 data-content 元素 ──

        const contentMap = buildContentMap(overlayEl);

        // ── 4. 状态管理 ──

        this.setAbilityState(`Overlay:${prefix}:isOpen`, false);
        this.setAbilityState(`Overlay:${prefix}:placement`, placement);
        this.setAbilityState(`Overlay:${prefix}:zIndexLevel`, zIndexLevel);

        // ── 5. 定位更新回调 ──

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

        // ── 6. 生成控制方法 ──

        const generatedProps: string[] = [];

        // open 方法
        const openOverlay = () => {
            const isOpen: boolean = this.abilityState(`Overlay:${prefix}:isOpen`, () => false);
            const currentPlacement = this.abilityState(`Overlay:${prefix}:placement`, () => placement);

            const zIdx = nextZIndex(zIndexLevel);
            overlayEl.style.zIndex = String(zIdx);
            this.setAbilityState(`Overlay:${prefix}:zIndex`, zIdx);

            if (this.el) {
                positionOverlay(overlayEl, this.el, currentPlacement, offset, flip);
            }

            const root = OverlayRoot.getInstance().getRoot();
            root.appendChild(overlayEl);

            overlayEl.style.display = '';

            if (!isOpen) {
                window.addEventListener('resize', onReposition);
                window.addEventListener('scroll', onReposition, true);
            }

            this.setAbilityState(`Overlay:${prefix}:isOpen`, true);
        };

        // close 方法
        const closeOverlay = () => {
            const isOpen: boolean = this.abilityState(`Overlay:${prefix}:isOpen`, () => false);
            if (!isOpen) return;

            overlayEl.style.display = 'none';

            if (overlayEl.parentNode) {
                overlayEl.parentNode.removeChild(overlayEl);
            }

            releaseZIndex(zIndexLevel);

            window.removeEventListener('resize', onReposition);
            window.removeEventListener('scroll', onReposition, true);

            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }

            this.setAbilityState(`Overlay:${prefix}:isOpen`, false);
        };

        // position 方法
        const positionOverlayMethod = () => {
            const currentPlacement = this.abilityState(`Overlay:${prefix}:placement`, () => placement);
            if (this.el && overlayEl) {
                positionOverlay(overlayEl, this.el, currentPlacement, offset, flip);
            }
        };

        // 绑定方法到 this
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

        // ── 7. 注册 onCleanup 清理回调 ──

        this.onCleanup(() => {
            const isOpen: boolean = this.abilityState(`Overlay:${prefix}:isOpen`, () => false);

            if (overlayEl.parentNode) {
                overlayEl.parentNode.removeChild(overlayEl);
            }

            if (isOpen) {
                releaseZIndex(zIndexLevel);
            }

            window.removeEventListener('resize', onReposition);
            window.removeEventListener('scroll', onReposition, true);

            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }

            overlayEl.innerHTML = '';

            for (const prop of generatedProps) {
                delete (this as any)[prop];
            }
        });

        // ── 8. 返回结果 ──

        return { overlayEl, contentMap };
    },

    /**
     * 初始化 Tooltip 浮层 — 配置驱动
     *
     * 当 LayoutNode 有 tooltip 字段时自动创建 tips 浮层，
     * 不需要组件声明 contentSlots: { tips: ['default'] }。
     *
     * 生成的属性/方法：
     * - openTips / closeTips / positionTips：浮层控制
     * - tipsPlacement：弹出方向
     */
    initTooltipOverlay(layout: LayoutNode): void {
        const result = this.createOverlay({
            prefix: 'tips',
            placement: layout.tooltipPlacement ?? 'top',
            offset: layout.tooltipOffset ?? 4,
            zIndexLevel: ZIndexLevel.tooltip,
        });

        if (!result) return;

        // 设置 tooltip 内容
        const tooltipText = layout.tooltip ?? '';
        const resolved = tooltipText.startsWith(I18N_PREFIX)
            ? (getI18nManager()?.t(tooltipText.slice(I18N_PREFIX.length)) ?? tooltipText)
            : tooltipText;

        const contentEl = result.contentMap.get('tips:default');
        if (contentEl) {
            contentEl.textContent = resolved;
        }

        // 注册 hover 事件：mouseenter → openTips, mouseleave → closeTips
        const showDelay = layout.tooltipShowDelay ?? 0;
        const hideDelay = layout.tooltipHideDelay ?? 0;
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

        // 如果 tooltip 内容是 i18n，注册 localeChange 刷新
        if (tooltipText.startsWith(I18N_PREFIX)) {
            const i18nKey = tooltipText.slice(I18N_PREFIX.length);
            const off = (this as any).on?.('localeChange', () => {
                const translated = getI18nManager()?.t(i18nKey) ?? tooltipText;
                if (contentEl) contentEl.textContent = translated;
            });
            if (typeof off === 'function') {
                this.onCleanup(off);
            }
        }
    },
};
