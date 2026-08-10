// ============================================
// 基础声明（无泛型依赖）
// ============================================

import { IComponentCore } from './core';
import { IDragGhost } from './interfaces';

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

export type AttrDeclMap = Record<string, AttrDecl>;

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
export interface DragDecl {
    /**
     * 拖拽类型
     *
     * 仅在需要将组件伪装成其他类型时使用。
     *
     * @example
     * { axis: 'both' }  // type 自动使用 component.type
     * { type: 'item', axis: 'both' }  // 强制伪装为 'item' 类型
     */
    type?: IComponentCore | IComponentCore[];
    /** 拖拽影子组件类型（可选） */
    ghost?: IDragGhost;
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
 * i18n 声明
 */
export interface I18nDecl {
    text?: string;
    hint?: string;
    placeholder?: string;
    value?: string;
    [field: string]: string | undefined;
}

export type I18nDeclMap = Record<string, I18nDecl>;

/**
 * 权限声明
 */
export type PermissionDecl = string | string[];

export type PermissionDeclMap = Record<string, PermissionDecl>;

/** Loading 快捷配置，用于声明式创建加载浮层 */
export interface LoadingDecl {
    text?: string;
    spinner?: string;
    maskMode?: 'none' | 'scoped' | 'global';
    mask?: boolean | string;
}

export interface TplCoreDecl extends HiddenDecl {
    /** 节点名称（可选） */
    name?: string;
    /** 节点标签 */
    tag?: string;
    /* 子组件类型 */
    type?: IComponentCore;
    /** 节点文本 */
    text?: string;
    contentMode?: 'value' | 'src' | 'html' | 'link';
    action?: string;
    i18n?: I18nDecl;
    permission?: PermissionDecl;
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string;
    required?: boolean;
    title?: string;
    src?: string;
    value?: any;
    accept?: string[];
    multiple?: boolean;
    checked?: boolean;
    selected?: boolean | any[];
    for?: string;
    order?: number;
    zIndex?: number;
    role?: string;
}

/** 扩展字段定义 */
export interface NodeOptionsDecl {
    [key: string]: any;
}
