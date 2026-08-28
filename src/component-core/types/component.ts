import { ILogger } from '@/logger';
import { DomEventsMap, ListenItem } from './events';
import {
    AnimationOptions,
    BadgeOptions,
    DragOptionsBase,
    DropOptions,
    I18nOptions,
    LoadingOptions,
    PermissionOptions,
    Tooltiptoptions,
} from './options';
import { NodeAttributes, NodeHTMLClass, NodeStyle } from './html';

/**
 * 指示器接口（从 IComponentCore 派生）
 */
export interface IIndicator extends IComponentCore {
    indicatorType: string;
    activeIndex: number;
    setActive(index: number): void;
    next(): void;
    prev(): void;
}

/**
 * 指示器类型
 */
export type IndicatorType = 'dot' | 'number' | 'dash' | 'button' | 'tab';

/**
 * 指示器配置
 */
export interface IndicatorOptions {
    type: IndicatorType;
    placement?: string;
    trigger?: string;
    activeIndex?: number;
    emits?: Record<string, string>;
    arrows?: boolean;
    defaultItemType?: string;
}

/**
 * 拖拽影子接口（从 IComponentCore 派生）
 */
export interface IDragGhost extends IComponentCore {
    update(x: number, y: number): void;
    onDragStart?(e: DragEvent): void;
    onDragEnd?(e: DragEvent): void;
}

/**
 * 对话框接口（从 IComponentCore 派生）
 */
export interface IDialog extends IComponentCore {
    open(): void;
    close(): void;
    onConfirm?(): void;
    onCancel?(): void;
}

/**
 * 弹出层接口（从 IComponentCore 派生）
 */
export interface IPopover extends IComponentCore {
    open(): void;
    close(): void;
}

export interface DragOptions extends DragOptionsBase {
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
    type?: IComponentCore;
    /** 拖拽影子组件类型（可选） */
    ghost?: IDragGhost;
}

export interface NodeOptions {
    /** 节点 ID */
    id?: string;
    /** 拖拽配置 */
    drag?: true | DragOptions;
    /** 指示器配置 */
    indicator?: IIndicator;
    /** 对话框配置 */
    dialog?: IDialog;
    /** 弹出层配置 */
    popover?: IPopover;
    /** 节点文本 */
    action?: string;
    /** 放置配置 */
    drop?: true | DropOptions;
    /** 动画配置 */
    animation?: AnimationOptions;
    /** 角标配置 */
    badge?: BadgeOptions | boolean;
    /** 提示配置 */
    tooltip?: Tooltiptoptions;
    /** 加载配置 */
    loading?: LoadingOptions;
    [key: string]: any;
}

export type NodeOptionsMap = Record<string, NodeOptions>;

export interface ComponentCoreOptions extends NodeOptions {
    /** 是否有父 */
    hasParent?: boolean;
    /** 要挂载的容器节点 */
    container?: HTMLElement;
    /** DOM 属性（data-*、aria-* 等） */
    attributes?: NodeAttributes;
    /** DOM 样式 */
    style?: NodeStyle;
    /** DOM 类 */
    classes?: NodeHTMLClass;
    /** 本地化设置 */
    i18n?: I18nOptions;
    /** DOM 样式 */
    [key: string]: any;
}

export interface NodeMeta {
    tag?: string;
    type?: IComponentCore | string;
    options?: NodeOptions;
    attributes?: NodeAttributes;
    i18n?: I18nOptions;
    permission?: PermissionOptions;
    classes?: NodeHTMLClass;
    style?: NodeStyle;
    isComponent: boolean;
}

export type NodeState = Omit<NodeMeta, 'tag' | 'type' | 'classes' | 'options'>;

export interface TemplateDecl {
    /** 节点标签 */
    tag?: string;
    /** 组件类型 */
    type?: IComponentCore | string;
    /** 节点名称 */
    name?: string;
    /** 子组件选项（仅 type 时有效） */
    options?: NodeOptions;
    /** DOM的attribute 属性 */
    attributes?: NodeAttributes;
    /** DOM的sytle 属性 */
    style?: NodeStyle;
    /** DOM的class 属性 */
    classes?: NodeHTMLClass;
    /** 本地化设置 */
    i18n?: I18nOptions;
    /** 权限设置 */
    permission?: PermissionOptions;
    /** 子节点 */
    children?: TemplateDecl[];
}

// ══════════════════════════════════════════════════════════════
// 生命周期钩子
// ══════════════════════════════════════════════════════════════

/**
 * 组件生命周期钩子 — 在 body 中定义，函数自动挂原型
 *
 * 调用顺序：
 *   onBeforeInit → 模板注入 → onAfterInit → onMounted → [运行中] → onBeforeUnmount → onBeforeDispose → [框架销毁]
 *
 * 注意：onDisposed 不暴露给组件，销毁由框架内部保证执行，不可覆写。
 * 组件清理逻辑统一放在 onBeforeDispose 中。
 */
export interface LifecycleHooks {
    /** 初始化前（模板注入前） */
    onBeforeInit?: () => void;
    /** 初始化后（模板注入、事件绑定、能力注入完成） */
    onAfterInit?: () => void;
    /** 挂载后（DOM 已渲染，可访问 el 和 nodeMap） */
    onMounted?: () => void;
    /** 元素尺寸变化（定义此方法才自动绑 ResizeObserver，否则不绑） */
    onResize?: (entry: ResizeObserverEntry) => void;
    /** 更新后（属性或内容变更后） */
    onUpdated?: () => void;
    /** 卸载前（组件即将从 DOM 移除） */
    onBeforeUnmount?: () => void;
    /** 语言变化 */
    onLocaleChange?(): void;
    /** 权限变化 */
    onPermissionChange?(data?: any): void;
}

/**
 * 组件核心接口（最底层）
 *
 * 不依赖任何其他类型，只定义组件最基本的身份和生命周期
 */
export interface IComponentCore extends LifecycleHooks {
    /** 组件 ID */
    id: string;
    /** 组件类型名 */
    type: string;
    /** 日志接口 */
    logger: ILogger;
    /** 禁用css */
    disabledCls: string;
    /** 委托事件定义 */
    domEvents?: DomEventsMap;
    /** 事件监听 */
    listens?: ListenItem[];
    /** 根 DOM 元素 */
    get el(): HTMLElement;
    /** 模板声明 */
    get tpl(): TemplateDecl;
    /** 更新方法 */
    update?: (...args: any[]) => void;
    /** 挂载 */
    mount(): Promise<void>;
    /** 检查是否是组件 */
    isComponent(nodeName: string): boolean;
    /** 卸载 */
    dispose(): void;
}

/**
 * 组件构造函数类型
 *
 * 任何实现了 IComponentCore 的类都可以用这个类型
 */
export type ComponentClass<T extends IComponentCore = IComponentCore> = new (
    options?: Partial<ComponentCoreOptions>
) => T;
