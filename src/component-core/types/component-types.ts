import { ILogger } from '@/logger';
import type { TplNode } from './tpl-node-types';
import { INodeMapManager } from './node-map-manager-types';

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
    /** 销毁前（组件清理的唯一入口，框架销毁不可覆写） */
    onBeforeDispose?: () => void;
    /** 语言变化 */
    onLocaleChange?(): void;
    /** 权限变化 */
    onPermissionChange?(data?: any): void;
}

/**
 * 标准化选项（内部使用）
 *
 * 系统保留字段用 $ 前缀
 */
export interface StructuredOptions {
    /** 父组件引用 */
    parent?: IComponentBase;
    /** 要挂载的容器节点 */
    container?: HTMLElement;
    /** 标准化后的 props */
    $props: Record<string, any>;
    /** 标准化后的 attrs */
    $attrs: Record<string, any>;
    /** 标准化后的 config */
    $config: Record<string, any>;
    /** 父组件插槽名称 */
    slotName: string;
    /** 业务字段（用户自定义） */
    [key: string]: any;
}

/**
 * 组件选项（平铺模式）
 *
 * 开发者直接 new 组件时使用
 */
export interface ComponentOptions {
    /** 组件 ID */
    id?: string;
    /** 父组件引用 */
    parent?: IComponentBase;
    /** 父组件插槽名称 */
    slotName?: string;
    /** 要挂载的容器节点 */
    container?: HTMLElement;
    /** 类名 */
    cls?: string;
    /** 样式 */
    style?: Record<string, any>;
    /** 语义动作 */
    action?: string;
    /** DOM 属性（data-*、aria-* 等） */
    attrs?: Record<string, any>;
    /** 组件属性（disabled、value 等） */
    props?: Record<string, any>;
    /** 其他自定义字段 */
    [key: string]: any;
}

/**
 * 组件选项（联合类型）
 */
export type ComponentOptionsUnion = ComponentOptions | StructuredOptions;

export interface IComponentBase extends LifecycleHooks {
    /** 组件 ID */
    id: string;
    /** 组件日志接口 */
    logger: ILogger;
    /** 组件类型 */
    type: string;
    /** 组件根节点 */
    el?: HTMLElement;
    /** 组件节点管理器 */
    nodeMapMgr: INodeMapManager;
    /**
     * 模板根节点定义
     *
     * 定义组件的 DOM 骨架结构，包括标签、类名、子节点等。
     * 编译时递归遍历生成 HTML，运行时克隆模板构建 nodeMap。
     */
    get tpl(): TplNode;

    /** 组件初始化选项（外部传入） */
    options: ComponentOptionsUnion;

    mountChild(el: HTMLElement, slotName: string): void;
}
