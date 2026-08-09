/**
 * init-context.ts — 初始化管线上下文
 *
 * 管线中所有 step 函数共享的上下文对象。
 * nodeMapMgr 由 ensureNodeMap 步骤直接从 ComponentRegistrar 获取并绑定。
 *
 * ══════════════════════════════════════════════════════════════
 * 初始化管线架构
 * ══════════════════════════════════════════════════════════════
 *
 * 组件实例化时执行初始化管线，管线分 4 Phase：
 *
 * Phase 1 MOUNT: ensureNodeMap → selfMount → setupNodeProps → onBeforeInit
 * Phase 2 FILL: (预留)
 * Phase 3 INSTANTIATE: instantiateChildComponents
 * Phase 4 FINALIZE: bindListens → bindChildEvents → bindDomEvents → onAfterInit
 *
 * 每个 step 函数接收 InitContext，可访问：
 * - instance: 组件实例
 * - props: 传入参数
 * - ctor: 组件类
 * - nodeMapMgr: 节点映射管理器
 * - debug: 调试模式
 * - steps: 已执行的步骤列表
 */

import { IComponentBase } from './component';

/**
 * ComponentProps — 组件运行时传入参数
 *
 * id 和 localData 有明确语义，其余为节点内容/自定义属性。
 * 通过 props 传递的数据会被组件实例接收并处理。
 *
 * @example
 * ```ts
 * // 基本用法
 * const props: ComponentProps = {
 *     id: 'submit-button',
 *     title: '提交',
 *     disabled: false
 * };
 *
 * // 带 localData 的用法
 * const props: ComponentProps = {
 *     id: 'user-list',
 *     localData: {
 *         users: [
 *             { id: 1, name: 'Alice' },
 *             { id: 2, name: 'Bob' }
 *         ]
 *     },
 *     localDataKey: 'users'
 * };
 *
 * // 创建组件实例
 * const button = new ButtonComponent(props);
 * ```
 */
/** Badge 快捷配置，用于声明式创建角标浮层 */
export interface BadgeQuickConfig {
    text?: string | number;
    visible?: boolean;
    anchor?: string;
}

/** Tooltip 快捷配置，用于声明式创建提示浮层 */
export interface TooltipQuickConfig {
    tooltip?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    anchor?: string;
    showDelay?: number;
    hideDelay?: number;
}

/**
 * Dialog 快捷配置
 *
 * 通过 props.dialog 声明式挂载对话框浮层，与 tooltip 模式对称。
 * float 选项（mask/closeOnEscape 等）提取到 FloatDecl，剩余作为 data 传给 DialogComponent。
 *
 * @example
 * ```ts
 * new ButtonComponent({
 *     dialog: {
 *         title: '确认删除',
 *         confirm: true,
 *         cancel: true,
 *     }
 * });
 * // → 自动创建 { type: 'Dialog', trigger: 'manual', placement: 'center', mask: true, data: { title, confirm, cancel } }
 * ```
 */
export interface DialogQuickConfig {
    // ── 内容 ──
    title?: string;
    icon?: string;
    subtitle?: string;
    toolsLeft?: Record<string, any>;
    toolsRight?: Record<string, any>;

    // ── 底部按钮 ──
    confirm?: boolean | { order?: number; text?: string };
    cancel?: boolean | { order?: number; text?: string };
    ok?: boolean | { order?: number; text?: string };
    save?: boolean | { order?: number; text?: string };
    close?: boolean | { order?: number; text?: string };
    apply?: boolean | { order?: number; text?: string };
    reset?: boolean | { order?: number; text?: string };
    footerItems?: Record<string, any>[];

    // ── 尺寸 ──
    width?: string;
    resizable?: boolean;

    // ── Float 选项（提取到 FloatDecl，不进 data）──
    mask?: boolean | string;
    closeOnEscape?: boolean;
    closeOnClickOutside?: boolean;
    emits?: Record<string, string>;
}

/** Loading 快捷配置，用于声明式创建加载浮层 */
export interface LoadingQuickConfig {
    text?: string;
    spinner?: string;
    maskMode?: 'none' | 'scoped' | 'global';
    mask?: boolean | string;
}

/** Popover 快捷配置，用于声明式创建弹出框浮层 */
export interface PopoverQuickConfig {
    title?: string;
    content?: string;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    trigger?: 'click' | 'hover';
    width?: number | string;
    emits?: Record<string, string>;
}

/** 指示器类型：圆点/数字/短划线/按钮/标签页 */
export type IndicatorType = 'dot' | 'number' | 'dash' | 'button' | 'tab';

export interface IndicatorConfig {
    /** 指示器类型 */
    type: IndicatorType;
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
 * InitContext — 管线上下文
 *
 * step 函数通过此对象访问实例、nodeMapMgr、props 等。
 * nodeMapMgr 由 ensureNodeMap 步骤填充。
 *
 * @example
 * ```ts
 * // 定义 step 函数
 * function ensureNodeMap(ctx: InitContext) {
 *     const { instance, ctor } = ctx;
 *     const nodeMapMgr = ctor._templateRegistrar.getNodeMapManager();
 *     instance._nodeMapMgr = nodeMapMgr;
 *     ctx.nodeMapMgr = nodeMapMgr;
 *     ctx.steps.push('ensureNodeMap');
 * }
 *
 * // 使用上下文
 * function setupNodeProps(ctx: InitContext) {
 *     const { instance, props, nodeMapMgr } = ctx;
 *     if (props.title) {
 *         nodeMapMgr.get('text').el.textContent = props.title;
 *     }
 * }
 * ```
 *
 * @see createInitContext - 创建初始上下文
 */
export interface InitContext {
    /**
     * 组件实例
     *
     * 正在初始化的组件实例，step 函数可对其进行操作。
     */
    instance: IComponentBase;

    /**
     * 调试模式
     *
     * 从 ctor.__runtimeDebug 读取，用于控制调试输出。
     */
    debug: boolean;
}

export type InitStep = (ctx: InitContext) => void;
