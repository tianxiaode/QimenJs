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
