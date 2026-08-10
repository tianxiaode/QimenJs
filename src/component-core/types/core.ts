import { ILogger } from '@/logger';

// ══════════════════════════════════════════════════════════════
// 生命周期钩子
// ══════════════════════════════════════════════════════════════

export interface ComponentCoreOptions {
    /** 组件 ID */
    id?: string;
    /** 父组件引用 */
    parent?: IComponentCore;
    /** 父组件插槽名称 */
    slotName?: string;
    /** 要挂载的容器节点 */
    container?: HTMLElement;
    /** DOM 属性（data-*、aria-* 等） */
    [key: string]: any;
}

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
    /** 根 DOM 元素 */
    el?: HTMLElement;
    update?: (...args: any[]) => void;
    /** 挂载 */
    mount(): Promise<void>;
    /** 销毁后钩子 */
    onDisposed(): void;
}

/**
 * 组件构造函数类型
 *
 * 任何实现了 IComponentCore 的类都可以用这个类型
 */
export type ComponentClass<T extends IComponentCore = IComponentCore> = new (
    options?: Partial<ComponentCoreOptions>
) => T;
