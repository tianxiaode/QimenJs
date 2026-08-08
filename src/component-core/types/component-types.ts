import type { TplNode } from './tpl-node-types';

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
}

/** 组件属性接口，定义组件初始化时可传入的所有属性 */
export interface ComponentOptions {
    /** 父传入的根节点属性 */
    props?: Record<string, any>;
    /** 父传入的根节点 attrs */
    attrs?: Record<string, any>;
    /** 父传入的组件初始配置 */
    config?: Record<string, any>;
}

export interface IComponentBase {
    /**
     * 模板根节点定义
     *
     * 定义组件的 DOM 骨架结构，包括标签、类名、子节点等。
     * 编译时递归遍历生成 HTML，运行时克隆模板构建 nodeMap。
     */
    get tpl(): TplNode;

    /** 组件初始化选项（外部传入） */
    options: ComponentOptions;
}
