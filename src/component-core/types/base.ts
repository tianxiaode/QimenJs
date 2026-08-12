// ============================================
// 基础声明（无泛型依赖）
// ============================================

/**
 * 节点位置索引 — 记录命名节点在模板 DOM 树中的位置路径
 *
 * key 为节点 name，value 为从根节点到该节点的子节点索引路径。
 * 用于运行时快速定位节点元素，避免每次查询。
 *
 * @example
 * ```ts
 * const indexPath: NodeIndexPath = {
 *     'root': [],                    // 根节点，路径为空
 *     'header': [0],                 // 第一个子节点
 *     'title': [0, 1],               // header 的第二个子节点
 *     'content': [1],                // 第二个子节点
 *     'footer': [2, 0, 1]            // footer 的第一个子节点的第二个子节点
 * };
 *
 * // 使用 indexPath 定位节点
 * function locateNode(template: HTMLTemplateElement, indexPath: number[]): HTMLElement {
 *     let current = template.content.firstChild;
 *     for (const index of indexPath) {
 *         current = current.childNodes[index];
 *     }
 *     return current as HTMLElement;
 * }
 * ```
 */
export type NodeIndexPath = Record<string, number[]>;

/**
 * 属性声明
 */
export interface Attributes {
    class?: string;
    [key: string]: any;
}

export type AttributesMap = Record<string, Attributes>;

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
     * 仅在需要将组件伪装成其他类型时使用。
     *
     * @example
     * { axis: 'both' }  // type 自动使用 component.type
     * { type: 'item', axis: 'both' }  // 强制伪装为 'item' 类型
     */
    /** 拖拽影子组件类型（可选） */
    //type?: string;
    /** 拖拽影子组件类型（可选） */
    //ghost?: IDragGhost;
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
}

/**
 * i18n 声明
 */
export interface I18nOptions {
    text?: string;
    hint?: string;
    placeholder?: string;
    value?: string;
    [field: string]: string | undefined;
}

export type I18nOptionsMap = Record<string, I18nOptions>;

/**
 * 权限声明
 */
export type PermissionOptions = string | string[];

export type PermissionOptionsMap = Record<string, PermissionOptions>;

/** Loading 快捷配置，用于声明式创建加载浮层 */
export interface LoadingOptions {
    text?: string;
    spinner?: string;
    maskMode?: 'none' | 'scoped' | 'global';
    mask?: boolean | string;
}

/** 组件配置 */
export interface NodeOptionsBase extends HiddenOptions {
    /** 放置配置 */
    drop?: true | DropOptions;
    /** 动画配置 */
    animation?: AnimationOptions;
    /** 角标配置 */
    bager?: BadgeOptions;
    /** 提示配置 */
    tooltip?: Tooltiptoptions;
    /** 加载配置 */
    loading?: LoadingOptions;

    [key: string]: any;
}

export interface NodeMetaBase {
    /** 节点名称（可选） */
    name?: string;
    /** 节点标签 */
    tag?: string;
    /** 节点文本 */
    text?: string;
    /** 节点文本模式 */
    contentMode?: 'value' | 'src' | 'html' | 'link';
    /** 节点行为 */
    action?: string;
    /** 节点DOM属性 */
    attributes?: Attributes;
}
