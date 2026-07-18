/**
 * Layout 类型定义（从 @qimenjs/layout 迁移）
 *
 * 仅包含类型定义，运行时常量保留在 layout-types.ts。
 */

// ── 事件类型 ──

export interface HandlerConfig {
    handler: string | ((...args: any[]) => any);
    once?: boolean;
    params?: Record<string, any>;
}

export interface EventListen {
    entityKey?: string;
    dragKey?: string;
    source?: string;
    events: Record<string, string>;
    once?: boolean;
}

export type ListensConfig = EventListen[];

/** @deprecated 使用 ListensConfig 替代 */
export type BridgesConfig = (string | EventListen)[];

// ── 浮层配置 ──

export interface OverlayDecl {
    type: string;
    trigger?: 'hover' | 'click' | 'focus' | 'contextmenu' | 'manual' | 'always';
    placement?: string;
    offset?: number;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    data?: Record<string, any> | (() => Record<string, any>);
    update?: (overlay: any, data: any) => void;
}

export type OverlaysConfig = Record<string, OverlayDecl>;

export interface LifecycleHooks {
    onBeforeInit?: (props?: Record<string, any>) => void;
    onAfterInit?: (props?: Record<string, any>) => void;
    onMounted?: (...args: any[]) => any;
    onBeforeUnmount?: (...args: any[]) => any;
    onBeforeDispose?: (...args: any[]) => any;
    onDisposed?: (...args: any[]) => any;
    onUpdated?: (...args: any[]) => any;
}

// ── 元数据 ──

export interface LayoutMeta {
    [key: string]: any;
}

// ── 能力配置类型 ──

export interface TooltipProps {
    tooltip?: string;
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
    tooltipOffset?: number;
    tooltipShowDelay?: number;
    tooltipHideDelay?: number;
    tooltipMaxWidth?: number;
    tooltipType?: string;
    tooltipArrow?: boolean;
}

export interface AnimationProps {
    enterAnimation?: string;
    enterAnimationOptions?: {
        duration?: number;
        easing?: string;
        fill?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
    };
    leaveAnimation?: string;
    leaveAnimationOptions?: {
        duration?: number;
        easing?: string;
        fill?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
    };
    animationEnabled?: boolean;
}

export interface DragDecl {
    type?: string;
    data?: Record<string, any> | (() => Record<string, any>);
    axis?: 'x' | 'y' | 'both';
    handle?: string;
    bounds?: HTMLElement | { left?: number; top?: number; right?: number; bottom?: number };
    activeClass?: string;
    grid?: number;
}

export type DragsConfig = Record<string, DragDecl>;

export interface EntityProps {
    entity?: new (...args: any[]) => any;
}

export interface ArrowProps {
    arrow?: boolean;
    arrowVars?: Record<string, string>;
}

export interface ExpandableProps {
    expandable?: boolean | ExpandableConfig;
}

export interface ExpandableConfig {
    arrowState?: 'collapsed' | 'expanded';
    arrowEvent?: string;
    arrowName?: string;
}

// ── 域浮层配置 ──

export interface OverflowConfigDecl {
    type: 'scroll' | 'menu';
    direction?: 'horizontal' | 'vertical';
    scrollStep?: number;
    menuOffset?: number;
    maxVisibleItems?: number;
}

export interface SubmenuDecl {
    type?: string;
    trigger?: 'hover' | 'click' | 'manual';
    placement?: string;
    offset?: number;
    showDelay?: number;
    hideDelay?: number;
    data?: Record<string, any> | (() => Record<string, any>);
}

export interface ContextMenuDecl {
    type?: string;
    offset?: number;
    data?: Record<string, any> | (() => Record<string, any>);
}
