/**
 * Layout 类型定义（从 @qimenjs/layout 迁移）
 *
 * 保留有行为逻辑的能力配置类型 + 通用事件类型 + key 常量。
 * 纯赋值能力的类型（PositionProps/StyleProps/AccessibilityProps/PermissionProps/ColorVariantProps/BadgeProps）已移除。
 *
 * 新模式下，这些配置通过 props 的子字段传入：
 * - tooltip: { ...TooltipProps } — 和 body/childProps 同层
 * - animation: { ...AnimationProps }
 * - drag: { ...DragProps }
 * - drop: { ...DropProps }
 * - entity: { ...EntityProps }
 * - arrow: { ...ArrowProps }
 * - expandable: { ...ExpandableProps }
 */

// ── 事件类型 ──

/**
 * 事件处理器配置
 *
 * 当 handler 需要附加选项（如 once、params）时使用。
 */
export interface HandlerConfig {
    /** 处理方式：字符串为 extraFns 中的方法名，函数为直接处理 */
    handler: string | ((...args: any[]) => any);
    /** 是否只执行一次，执行后自动解绑 */
    once?: boolean;
    /** 附加参数，传递给处理函数 */
    params?: Record<string, any>;
}

/**
 * 事件监听声明
 *
 * 接收方声明监听哪些事件源的哪些事件类型，框架自动绑定到对应总线：
 * - source：走 EventBridge（组件间桥接事件）
 * - entityKey：走 EntityDispatchCenter（实体数据事件）
 * - 两者互斥，同时指定时 entityKey 优先
 */
export interface EventListen {
    /** 监听的事件源（组件 id），走 EventBridge */
    source?: string;
    /** 监听的实体键，走 EntityDispatchCenter */
    entityKey?: string;
    /** 事件到 handler 的映射，key 为事件类型，value 为方法名 */
    events: Record<string, string>;
    /** 是否只执行一次 */
    once?: boolean;
}

/**
 * 监听事件配置
 *
 * 统一管理组件的所有事件监听声明
 */
export type ListensConfig = EventListen[];

/**
 * 桥接事件配置
 *
 * @deprecated 使用 ListensConfig 替代
 */
export type BridgesConfig = (string | EventListen)[];

// ── 生命周期 ──

/**
 * 生命周期钩子
 *
 * 在组件定义中声明式注册生命周期回调，渲染时 bind(component) 后注入。
 */
export interface LifecycleHooks {
    /** 组件挂载后回调（mount 完成后） */
    onMounted?: (...args: any[]) => any;
    /** 组件卸载前回调（unmount 前调用） */
    onBeforeUnmount?: (...args: any[]) => any;
    /** 组件销毁前回调（dispose 前调用） */
    onBeforeDispose?: (...args: any[]) => any;
    /** 组件销毁后回调（dispose 后调用） */
    onDisposed?: (...args: any[]) => any;
    /** 组件更新回调（update 后调用） */
    onUpdated?: (...args: any[]) => any;
}

// ── 元数据 ──

/**
 * Layout 元数据定义
 *
 * meta 是纯数据容器，复制到组件实例后通过 this.meta.xxx 访问。
 */
export interface LayoutMeta {
    /** 自定义属性 */
    [key: string]: any;
}

// ── 能力配置类型 ──

/**
 * Tooltip 提示框配置
 *
 * 新模式下通过 props.tooltip 传入，和 body/childProps 同层。
 */
export interface TooltipProps {
    /** 提示文本内容，支持 i18n 前缀（如 'i18n:tooltip.save'） */
    tooltip?: string;
    /** 提示框弹出方向，默认 'top' */
    tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
    /** 提示框与锚点的间距（px），默认 4 */
    tooltipOffset?: number;
    /** 提示框延迟显示时间（毫秒），默认 0 */
    tooltipShowDelay?: number;
    /** 提示框延迟隐藏时间（毫秒），默认 0 */
    tooltipHideDelay?: number;
    /** 提示框最大宽度（px） */
    tooltipMaxWidth?: number;
    /** 提示框组件类型名（对应 ComponentRegistrar 中注册的 type），默认 'Tips' */
    tooltipType?: string;
    /** 是否显示箭头，默认 true */
    tooltipArrow?: boolean;
}

/**
 * 动画配置
 *
 * 新模式下通过 props.animation 传入。
 */
export interface AnimationProps {
    /** 进入动画名称（CSS @keyframes 名称） */
    enterAnimation?: string;
    /** 进入动画选项 */
    enterAnimationOptions?: {
        /** 动画时长（毫秒），默认 250 */
        duration?: number;
        /** 缓动函数，默认 'ease' */
        easing?: string;
        /** 填充模式，默认 'forwards' */
        fill?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
    };
    /** 离开动画名称（CSS @keyframes 名称） */
    leaveAnimation?: string;
    /** 离开动画选项 */
    leaveAnimationOptions?: {
        /** 动画时长（毫秒），默认 250 */
        duration?: number;
        /** 缓动函数，默认 'ease' */
        easing?: string;
        /** 填充模式，默认 'forwards' */
        fill?: 'none' | 'forwards' | 'backwards' | 'both' | 'auto';
    };
    /** 是否启用动画，默认 true */
    animationEnabled?: boolean;
}

/**
 * 拖拽配置
 *
 * 新模式下通过 props.drag 传入。
 */
export interface DragProps {
    /** 是否可拖拽 */
    draggable?: boolean;
    /** 拖拽方向约束，默认 'both' */
    dragAxis?: 'x' | 'y' | 'both';
    /** 拖拽手柄选择器 */
    dragHandle?: string;
    /** 拖拽范围约束 */
    dragBounds?: HTMLElement | { left?: number; top?: number; right?: number; bottom?: number };
    /** 拖拽时的 CSS class */
    dragActiveClass?: string;
    /** 网格对齐步长 */
    dragGrid?: number;
}

/**
 * 放置配置
 *
 * 新模式下通过 props.drop 传入。
 */
export interface DropProps {
    /** 是否可接收放置 */
    droppable?: boolean;
    /** 接受的拖拽源类型（对应组件 type），空则接受所有 */
    dropAccept?: string | string[];
    /** 拖拽悬停时的 CSS class */
    dropActiveClass?: string;
}

/**
 * 实体管理配置
 *
 * 新模式下通过 props.entity 传入。
 */
export interface EntityProps {
    /** 实体管理器类引用 */
    entity?: new (...args: any[]) => any;
}

/**
 * 箭头指示器配置
 *
 * 新模式下通过 props.arrow 传入。
 */
export interface ArrowProps {
    /** 是否显示箭头，默认 true */
    arrow?: boolean;
    /** CSS 变量覆盖 */
    arrowVars?: Record<string, string>;
}

/**
 * 展开/折叠配置
 *
 * 新模式下通过 props.expandable 传入。
 */
export interface ExpandableProps {
    /** 是否启用折叠，或传入详细配置 */
    expandable?: boolean | ExpandableConfig;
}

/**
 * 展开/折叠详细配置
 */
export interface ExpandableConfig {
    /** 初始状态，默认 'collapsed' */
    arrowState?: 'collapsed' | 'expanded';
    /** 点击触发的内部事件名，默认 'toggle' */
    arrowEvent?: string;
    /** 箭头节点名称，默认 'expand' */
    arrowName?: string;
}

// ── Key 常量 ──

/**
 * AnimationProps 的 key 列表
 */
export const ANIMATION_KEYS = [
    'enterAnimation',
    'enterAnimationOptions',
    'leaveAnimation',
    'leaveAnimationOptions',
    'animationEnabled',
] as const;

/**
 * DragProps 的 key 列表
 */
export const DRAG_KEYS = [
    'draggable',
    'dragAxis',
    'dragHandle',
    'dragBounds',
    'dragActiveClass',
    'dragGrid',
] as const;

/**
 * DropProps 的 key 列表
 */
export const DROP_KEYS = ['droppable', 'dropAccept', 'dropActiveClass'] as const;

/**
 * TooltipProps 的 key 列表
 */
export const TOOLTIP_KEYS = [
    'tooltip',
    'tooltipPlacement',
    'tooltipOffset',
    'tooltipShowDelay',
    'tooltipHideDelay',
    'tooltipMaxWidth',
    'tooltipType',
] as const;

/**
 * ExpandableProps 的 key 列表
 */
export const EXPANDABLE_KEYS = ['expandable'] as const;
