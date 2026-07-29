/**
 * init-context.ts — 初始化管线上下文
 *
 * 管线中所有 step 函数共享的上下文对象。
 * nodeMapMgr 由 ensureNodeMap 步骤直接从 TemplateRegistrar 获取并绑定。
 *
 * ══════════════════════════════════════════════════════════════
 * 初始化管线架构
 * ══════════════════════════════════════════════════════════════
 *
 * 组件实例化时执行初始化管线，管线分 4 Phase：
 *
 * Phase 1 MOUNT: ensureNodeMap → selfMount → setupNodeProps → onInitState → onBeforeInit
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

import type { INodeMapManager } from './node-map-manager-types';

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
export interface ComponentProps {
    /**
     * 组件唯一标识
     *
     * 用于在组件树中定位和引用组件。
     * 可通过 component.id 访问。
     */
    id?: string;

    /**
     * 本地数据源
     *
     * key 为数据源名称，value 为数据数组。
     * 与 localDataKey 配合使用，指定组件渲染使用的数据源。
     *
     * @example
     * ```ts
     * localData: {
     *     users: [{ id: 1, name: 'Alice' }],
     *     roles: [{ id: 1, name: 'Admin' }]
     * }
     * ```
     */
    localData?: Record<string, any[]>;

    /**
     * 本地数据激活 key
     *
     * 声明组件渲染使用的数据源，对应 localData 中的 key。
     * 如 localDataKey: 'users'，则组件使用 localData.users 渲染。
     */
    localDataKey?: string;

    /**
     * 其他自定义属性
     *
     * 传递给组件的任意属性，如 title、disabled、onClick 等。
     * 会自动映射到组件实例的对应属性。
     */
    [key: string]: any;
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
    instance: any;

    /**
     * 传入参数
     *
     * 组件实例化时接收的参数，包含 id、localData 等。
     */
    props: ComponentProps;

    /**
     * 组件类
     *
     * 组件的构造函数，可访问静态属性（如 _templateRegistrar）。
     */
    ctor: any;

    /**
     * 节点映射管理器
     *
     * 管理组件的 nodeMap，提供 get/set/remove 等方法。
     * 由 ensureNodeMap 步骤填充。
     */
    nodeMapMgr: INodeMapManager | null;

    /**
     * 调试模式
     *
     * 从 ctor.__runtimeDebug 读取，用于控制调试输出。
     */
    debug: boolean;

    /**
     * 已执行的步骤列表
     *
     * 记录管线执行过程，用于调试和追踪。
     */
    steps: string[];
}

/**
 * 创建初始上下文
 *
 * 初始化管线的入口，创建 InitContext 对象。
 * nodeMapMgr 初始为 null，由 ensureNodeMap 步骤填充。
 *
 * @param instance - 组件实例
 * @param props - 传入参数
 * @returns 初始化上下文对象
 *
 * @example
 * ```ts
 * class MyComponent extends TemplateComponent {
 *     constructor(props: ComponentProps) {
 *         super();
 *         const ctx = createInitContext(this, props);
 *         runInitPipeline(ctx);
 *     }
 * }
 * ```
 */
export function createInitContext(instance: any, props: ComponentProps): InitContext {
    const ctor = instance.constructor as any;
    return {
        instance,
        props,
        ctor,
        nodeMapMgr: null,
        debug: ctor.__runtimeDebug === true,
        steps: [],
    };
}
