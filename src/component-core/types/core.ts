import { ILogger } from '@/logger';
import {
    NodeIndexPath,
    DragOptionsBase,
    I18nOptionsMap,
    NodeMetaBase,
    NodeOptionsBase,
    PermissionOptionsMap,
    Attributes,
    I18nOptions,
    PermissionOptions,
} from './base';
import { ComponentListen, ListenItem } from './events';

/**
 * 组件节点管理器
 */
export interface INodeManager {
    /** 获取节点索引路径映射 */
    get indexPath(): NodeIndexPath;
    /** 获取节点i18n配置映射  */
    get i18ns(): I18nOptionsMap;
    /** 获取节点权限配置映射 */
    get permissions(): PermissionOptionsMap;
    /**获取需要暴露的节点名列表 */
    get exposeNames(): string[];
    /** 获取根节点标签名 */
    get rootTag(): string;
    /** 获取组件el */
    get el(): HTMLElement;
    get map(): Record<string, NodeMeta>;
    /** 获取节点元数据 */
    get(nodeName: string): NodeMeta | undefined;
    /** 设置节点元数据 */
    set(nodeName: string, meta: NodeMeta): void;
    /** 更新节点元数据 */
    update(nodeName: string, meta: Partial<NodeMeta>): void;
    /** 获取节点元素 */
    getNodeEl(nodeName: string): HTMLElement;
    /** 获取节点组件实例 */
    getComponent(): IComponentCore;
    /** 获取节点配置 */
    getOptions(nodeName?: string): Record<string, NodeOptions> | NodeOptions;
    /** 判断节点是否组件 */
    isComponent(nodeName: string): boolean;
    /** 构建组件的 DOM 结构 */
    buildDOM(): void;
    /** 移除节点 */
    remove(nodeName: string): void;
    /** 替换组件节点 */
    replace(
        nodeName: string,
        componentClass: ComponentClass,
        options?: Partial<ComponentCoreOptions>
    ): void;
    /** 销毁 */
    disposeAll(): void;
    /** 在指定节点挂载子组件 */
    mountChildComponent(nodeName: string, child: IComponentCore): void;
}

/**
 * 组件属性管理
 */
export interface IAttributeManager {
    /** 获取节点HTML特性 */
    getAttribute(nodeName: string, attributeName: string): any;
    /** 设置单个节点HTML特性 */
    setAttribute(nodeName: string, attributeName: string, value: any): void;
    /** 设置多个节点HTML特性 */
    setAttributes(nodeName: string, attributes: Record<string, any>): void;
    /** 移除单个节点HTML特性 */
    removeAttribute(nodeName: string, attributeName: string): void;
    /** 移除多个节点HTML特性 */
    removeAttributes(nodeName: string, attributes: string[]): void;
    /** 节点是否包含某个class */
    hasCls(nodeName: string, cls: string): boolean;
    /** 添加class */
    addCls(nodeName: string, cls: string): void;
    /** 移除class */
    removeCls(nodeName: string, cls: string): void;
    /** 切换class */
    toggleCls(nodeName: string, cls: string, force?: boolean): void;
    /** 刷新特性 */
    flush(): void;
    /** 销毁 */
    dispose(): void;
}

/**
 * 组件事件管理
 */
export interface IEventManager {}

export interface IBadgeManager {}
export interface ITooltipManager {}
export interface IDragManager {}
export interface IDropManager {}
export interface IIndicatorManager {}
export interface IPopoverManager {}
export interface IDialogManager {}
export interface iAnimationManager {}

/** 组件配置 */

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

export interface NodeOptions extends NodeOptionsBase {
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
}

export interface NodeMeta extends NodeMetaBase {
    /** DOM 元素引用 */
    el?: HTMLElement;
    /** 子组件实例（渲染后填充） */
    instance?: IComponentCore;
    /** 子组件类引用（编译时从 TplNode.type 解析） */
    ctor?: ComponentClass;
    /** 父元素引用（replace 模式定位用） */
    parentNode?: HTMLElement | null;
    /** 在父元素子节点列表中的位置索引 */
    nodeIndex?: number[];
    /** 是否是组件节点 */
    isComponent: boolean;
    /** 子节点的配置 */
    options?: NodeOptions;
    /** 组件类型 */
    type?: IComponentCore;
    // /** 当前生效的属性快照，用于对比新旧值决定动画方向 */
    // _state?: Record<string, any>;
}

export type NodeMetaMap = Record<string, NodeMeta>;

export interface ComponentCoreOptions extends NodeOptions {
    /** 父组件引用 */
    parent?: IComponentCore;
    /** 父组件插槽名称 */
    slotName?: string;
    /** 要挂载的容器节点 */
    container?: HTMLElement;
    /** DOM 属性（data-*、aria-* 等） */
    [key: string]: any;
}

export interface TemplateDecl extends NodeOptions, Attributes {
    /** 节点标签 */
    tag?: string;
    /** 组件类型 */
    type?: IComponentCore;
    i18n: I18nOptions;
    permission: PermissionOptions;
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
    /** 组件原始配置 */
    _options: ComponentCoreOptions;
    /** 组件 ID */
    id: string;
    /** 组件类型名 */
    type: string;
    /** 日志接口 */
    logger: ILogger;
    /** 禁用css */
    disabledCls: string;
    /** 节点管理 */
    nodeManager: INodeManager;
    /** 节点属性管理 */
    nodeAttributeManager: IAttributeManager;
    /** 事件管理 */
    eventManager?: IEventManager;
    /** 指示器管理 */
    indicatorManager?: IIndicatorManager;
    /** 拖拽管理 */
    dragManager?: IDragManager;
    /** 弹出层管理 */
    popoverManager?: IPopoverManager;
    /** 对话框管理 */
    dialogManager?: IDialogManager;
    /** 动画管理 */
    animationManager?: iAnimationManager;
    /** 拖拽管理 */
    dropManager?: IDropManager;
    /** 角标管理 */
    badgeManager?: IBadgeManager;
    /** 提示管理 */
    tooltipManager?: ITooltipManager;
    /** 委托事件定义 */
    domEvents?: ComponentListen;
    /** 事件监听 */
    listens?: ListenItem[];
    /** 根 DOM 元素 */
    get el(): HTMLElement;
    /** 节点配置key */
    get optionKeys(): string[];
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
    /** NodeManager的get的语法糖 */
    getNode(nodeName: string): Node;
    /** NodeManager的set的语法糖 */
    setNode(nodeName: string, node: NodeMeta): void;
    /** NodeManager的update的语法糖 */
    updateNode(nodeName: string, node: Partial<NodeMeta>): void;
    /** NodeManager的getNodEl的语法糖 */
    getNodeEl(nodeName: string): HTMLElement;
    /** NodeManager的getComponent的语法糖 */
    getComponent(nodeName: string): IComponentCore;
    /** NodeManager的getOptions的语法糖 */
    getOptions(nodeName: string): NodeOptions;
}

/**
 * 组件构造函数类型
 *
 * 任何实现了 IComponentCore 的类都可以用这个类型
 */
export type ComponentClass<T extends IComponentCore = IComponentCore> = new (
    options?: Partial<ComponentCoreOptions>
) => T;
