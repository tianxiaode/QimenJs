// types/declarations.ts

import { Extension } from 'typescript';

// ============================================
// 基础声明（无泛型依赖）
// ============================================

/**
 * 样式声明
 */
export interface StyleDecl {
    [key: string]: string | number | undefined;
}

/**
 * 属性声明
 */
export interface AttrDecl {
    className?: string;
    style?: StyleDecl;
    [key: string]: any;
}

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
export interface HiddenDecl {
    hidden?: boolean;
    hiddenMode?: HiddenMode;
}

/**
 * 拖拽声明
 */
export interface DragDecl<TDrag = any, TGhost = any> {
    /**
     * 拖拽类型
     *
     * 仅在需要将组件伪装成其他类型时使用。
     *
     * @example
     * { axis: 'both' }  // type 自动使用 component.type
     * { type: 'item', axis: 'both' }  // 强制伪装为 'item' 类型
     */
    type?: TDrag | TDrag[];
    /** 拖拽影子组件类型（可选） */
    ghost?: TGhost;
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
export interface DropDecl {
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
export interface AnimationDecl {
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
export interface BadgeDecl {
    text: string | number;
    visible?: boolean;
    color?: string;
    size?: 'small' | 'medium' | 'large';
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * 提示声明
 */
export interface TooltipDecl {
    content: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    theme?: string;
}

/**
 * 对话框声明
 */
export interface MsgboxDecl {
    type?: 'confirm' | 'alert' | 'prompt';
    title?: string;
    content?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: string;
    onCancel?: string;
}

/**
 * 指示器声明
 */
export interface IndicatorDecl<TIndicator = any> {
    type?: TIndicator;
    /** 弹出方向，默认 'bottom' */
    placement?: 'top' | 'bottom' | 'left' | 'right';
    /** 触发方式，默认 'always'（始终显示） */
    trigger?: 'always' | 'click' | 'hover';
    /** 是否显示 prev/next 箭头 */
    arrows?: boolean;
    /** 初始选中索引 */
    activeIndex?: number;
    /** 指示器子项类型（默认由 type 推导） */
    defaultItemType?: string;
    /** 浮层事件转发 */
    emits?: Record<string, string>;
}

/**
 * i18n 声明
 */
export interface I18nDecl {
    text?: string;
    hint?: string;
    placeholder?: string;
    value?: string;
    [field: string]: string | undefined;
}

/**
 * 权限声明
 */
export type PermissionDecl = string | string[];

/**
 * 节点扩展（所有功能模块）
 *
 * 通过组合模式，按需使用
 */
export interface TplExtensions<TDialog = any, TPopover = any> {
    /** i18n 配置 */
    i18n?: I18nDecl;

    /** 权限配置 */
    permission?: PermissionDecl;

    /** 拖拽配置（拖拽手柄） */
    drag?: DragDecl | boolean;

    /** 放置配置（放置目标） */
    drop?: DropDecl | boolean;

    /** 动画配置 */
    animation?: AnimationDecl;

    /** 角标配置 */
    badge?: BadgeDecl | string | number | null;

    /** 提示浮层 */
    tooltip?: TooltipDecl | string | null;

    /** 信息对话框 */
    msgbox?: MsgboxDecl | null;

    /** 对话框 */
    dialog?: TDialog | null;

    /** 弹出层 */
    popover?: TPopover | null;

    /** 指示器 */
    indicator?: IndicatorDecl | null;

    /**
     * 拖拽手柄标记（组件级快捷方式）
     *
     * 等价于在组件类声明 dragHandle = nodeName
     * 实际使用中，此字段会被编译到组件的 dragHandle 配置中
     */
    dragHandle?: boolean;

    /**
     * 放置区标记（组件级快捷方式）
     *
     * 等价于在组件类声明 dropZone = nodeName
     * 实际使用中，此字段会被编译到组件的 dropZone 配置中
     */
    dropZone?: boolean;
}

// ============================================
// 核心声明（使用扩展模式）
// ============================================

/**
 * 节点声明（核心）
 *
 * 所有功能通过扩展接口组合
 */
export interface TplDecl<TComponent = any, TDialog = any, TPopover = any>
    extends AttrDecl, HiddenDecl, TplExtensions<TDialog, TPopover> {
    // ─── 标识 ───
    name?: string;
    tag?: string;
    type?: TComponent;

    // ─── 内容 ───
    text?: string;

    // ─── 事件 ───
    action?: string;

    // ─── 子节点 ───
    children?: TplDecl[];

    // ─── 自定义 ───
    [key: string]: any;
}
