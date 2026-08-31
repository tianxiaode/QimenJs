/**
 * 隐藏模式 — 控制 hidden 时的 DOM 表现
 *
 * - 'display': display: none（默认，不占空间）
 * - 'visibility': visibility: hidden（占空间但不可见）
 * - 'opacity': opacity: 0（不可见但可交互）
 */
export type HiddenMode = 'display' | 'visibility' | 'opacity';

/**
 * 隐藏声明
 */
export interface HiddenOptions {
    hidden?: boolean;
    hiddenMode?: HiddenMode;
}

/**
 * 拖拽声明
 */
export interface DragOptionsBase {
    /**
     * 拖拽类型
     *
     * 仅在需要将组件伪装成其他类型时使用，drop 侧 accept 匹配的就是它。
     *
     * @example
     * { axis: 'both' }  // type 自动使用 component.type
     * { type: 'item', axis: 'both' }  // 强制伪装为 'item' 类型
     */
    type?: string;
    /**
     * 拖拽影子组件类型名（可选）
     *
     * 注册表模式下按类型名从 ComponentRegistrar 解析组件类，
     * dragStart 时实例化影子跟随指针，dragEnd/cancel 时销毁。
     * 未指定时拖原元素本身。
     */
    ghost?: string;
    /**
     * 拖拽手柄（可选）
     *
     * 组件内发起拖拽的子节点名（nodeMap 键）。
     * 未指定时整个组件 root 可拖。
     */
    handle?: string;
    /** 拖拽轴向：'x' | 'y' | 'both' */
    axis?: 'x' | 'y' | 'both';
    /** 拖拽边界约束 */
    bounds?:
        | HTMLElement
        | { left?: number; top?: number; right?: number; bottom?: number }
        | string;
    /** 拖拽时添加的 CSS 类 */
    activeClass?: string;
    /** 网格吸附步长 */
    grid?: number;
}

/**
 * 放置声明
 */
export interface DropOptions {
    /** 接受的拖拽类型列表（为空表示接受所有） */
    accept?: string[];
    /** 拖拽悬停时添加的 CSS 类 */
    activeClass?: string;
    /** 放置时的回调方法名 */
    onDrop?: string;
}

/**
 * 动画声明
 */
export interface AnimationOptions {
    /** 进入动画预设名（如 fadeIn / slideInUp / scaleIn） */
    enter?: string;
    /** 进入动画自定义 Keyframe（与 enter 二选一） */
    enterKeyframes?: Keyframe[];
    /** 退出动画预设名（如 fadeOut / slideOutDown / scaleOut） */
    leave?: string;
    /** 退出动画自定义 Keyframe（与 leave 二选一） */
    leaveKeyframes?: Keyframe[];
    /** 动画时长（毫秒），默认 300 */
    duration?: number;
    /** 缓动函数，默认 'ease' */
    easing?: string;
    /** 是否启用动画，默认 true */
    enabled?: boolean;
}

/**
 * 角标声明
 */
export interface BadgeOptions {
    text: string | number;
    visible?: boolean;
    color?: string;
    size?: 'small' | 'medium' | 'large';
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * 提示声明
 */
export interface Tooltiptoptions {
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    theme?: string;
    trigger?: 'click' | 'hover' | 'focus' | 'manual' | 'always';
}

/** Loading 快捷配置，用于声明式创建加载浮层 */
export interface LoadingOptions {
    text?: string;
    spinner?: string;
    maskMode?: 'none' | 'scoped' | 'global';
    mask?: boolean | string;
}

/**
 * 箭头配置
 */
export interface ArrowOption {
    /** 是否显示箭头，默认 true */
    arrow?: boolean;
    /** CSS 变量覆盖，如 { '--q-arrow-color': '#fff', '--q-arrow-size': '6px' } */
    arrowVars?: Record<string, string>;
    /** 箭头节点名称，默认 'arrow'（对应模板中 name 的 name 部分） */
    arrowName?: string;
}
