/**
 * OverlayHostAbility — 浮层宿主能力
 *
 * 所有浮层组件（Tips/Dropdown/Popover/Dialog 等）的公共基础能力。
 * 提供浮层挂载、z-index 管理、定位计算、resize/scroll 重定位等通用逻辑。
 *
 * 浮层组件通过组合此能力 + 自身特有逻辑实现完整功能：
 * - Tips = OverlayHostAbility + hover 事件 + delay + i18n
 * - Dropdown = OverlayHostAbility + click 外部关闭
 * - Dialog = OverlayHostAbility + 动画 + OpenableAbility
 *
 * 事件绑定规范：
 * - 必须使用 DomEventsAbility.bind() 绑定 DOM 事件，禁止直接 addEventListener
 * - hover：this.bind(anchor, 'hover', { delay })
 * - scroll/resize：this.bind(window, 'scroll')
 * - bind 返回的 unbind 由 eventScope 自动管理，dispose 时统一清理
 */

import type { AbilityDefinition } from '@/composable';
import { OverlayRoot } from '@/component/OverlayRoot';
import { ZIndexLevel, nextZIndex, releaseZIndex } from '@/component/z-index';
import { positionOverlay, type Placement } from './positionOverlay';

/**
 * 浮层宿主配置
 */
export interface OverlayHostConfig {
    /** z-index 层级，默认 ZIndexLevel.dropdown */
    zIndexLevel?: number;
    /** 弹出方向，默认 'bottom' */
    placement?: Placement;
    /** 浮层与锚点间距（px），默认 4 */
    offset?: number;
    /** 是否启用自动翻转，默认 true */
    flip?: boolean;
}

export const OverlayHostAbility: AbilityDefinition = {
    // ─── OverlayRoot 容器访问 ───

    overlayRoot: {
        get(): HTMLElement | null {
            if (typeof document === 'undefined') return null;
            return OverlayRoot.getInstance().getRoot();
        },
    },

    // ─── z-index 管理 ───

    _zIndexLevel: {
        get(): number {
            return this.abilityState('OverlayHostAbility:zIndexLevel', () => ZIndexLevel.dropdown);
        },
        set(value: number) {
            this.setAbilityState('OverlayHostAbility:zIndexLevel', value);
        },
    },

    _currentZIndex: {
        get(): number {
            return this.abilityState('OverlayHostAbility:currentZIndex', 0);
        },
        set(value: number) {
            this.setAbilityState('OverlayHostAbility:currentZIndex', value);
        },
    },

    /**
     * 获取 z-index 并递增计数器
     */
    acquireZIndex(level?: number): number {
        const zLevel = level ?? this._zIndexLevel;
        const zIdx = nextZIndex(zLevel);
        this._currentZIndex = zIdx;
        this._zIndexLevel = zLevel;
        this.el.style.zIndex = String(zIdx);
        return zIdx;
    },

    /**
     * 释放 z-index
     */
    releaseZIndex(): void {
        releaseZIndex(this._zIndexLevel);
    },

    // ─── 定位 ───

    _placement: {
        get(): Placement {
            return this.abilityState('OverlayHostAbility:placement', () => 'bottom' as Placement);
        },
        set(value: Placement) {
            this.setAbilityState('OverlayHostAbility:placement', value);
        },
    },

    _offset: {
        get(): number {
            return this.abilityState('OverlayHostAbility:offset', 4);
        },
        set(value: number) {
            this.setAbilityState('OverlayHostAbility:offset', value);
        },
    },

    _flip: {
        get(): boolean {
            return this.abilityState('OverlayHostAbility:flip', true);
        },
        set(value: boolean) {
            this.setAbilityState('OverlayHostAbility:flip', value);
        },
    },

    _anchor: {
        get(): HTMLElement | null {
            return this.abilityState('OverlayHostAbility:anchor', null);
        },
        set(value: HTMLElement | null) {
            this.setAbilityState('OverlayHostAbility:anchor', value);
        },
    },

    /**
     * 初始化浮层宿主配置
     *
     * 从 props 中读取 anchor 和定位配置，设置初始样式。
     * 子类在 constructor 中调用。
     */
    initOverlayHost(config?: OverlayHostConfig): void {
        this._zIndexLevel = config?.zIndexLevel ?? ZIndexLevel.dropdown;
        this._placement = config?.placement ?? 'bottom';
        this._offset = config?.offset ?? 4;
        this._flip = config?.flip ?? true;

        // 初始样式
        this.el.style.position = 'absolute';
        this.el.style.display = 'none';
        this.el.style.pointerEvents = 'auto';
    },

    /**
     * 计算并应用浮层定位
     */
    positionOverlay(anchor?: HTMLElement, placement?: Placement, offset?: number, flip?: boolean): void {
        const anchorEl = anchor ?? this._anchor;
        if (!anchorEl) return;
        positionOverlay(
            this.el,
            anchorEl,
            placement ?? this._placement,
            offset ?? this._offset,
            flip ?? this._flip,
        );
    },

    /**
     * 重新定位（resize/scroll 触发）
     */
    reposition(): void {
        this.positionOverlay();
    },

    // ─── 挂载/卸载 ───

    /**
     * 打开浮层 — 挂载到 OverlayRoot
     */
    openOverlay(): void {
        const root = this.overlayRoot;
        if (root && this.el) {
            this.el.style.pointerEvents = 'auto';
            root.appendChild(this.el);
        }
    },

    /**
     * 关闭浮层 — 从 OverlayRoot 移除
     */
    closeOverlay(): void {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    },
};