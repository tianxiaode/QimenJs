/**
 * node-map-manager-types.ts — NodeMapManager 接口定义
 *
 * 解耦 types 层对 NodeMapManager 类本体的依赖，避免循环引用。
 * InitContext 等类型只引用此接口，不引用类。
 *
 * ══════════════════════════════════════════════════════════════
 * NodeMapManager 架构
 * ══════════════════════════════════════════════════════════════
 *
 * NodeMapManager 是组件运行时的核心管理器，负责：
 * 1. 管理 nodeMap（节点名称 → NodeMetadata 的映射）
 * 2. 提供 get/set/remove 等节点访问方法
 * 3. 处理子组件挂载和销毁
 * 4. 支持运行时动态替换子组件
 * 5. 管理 DOM 元素生命周期
 *
 * 与编译缓存的关系：
 * - 编译时：产出 CompiledTemplateCache（只读共享）
 * - 运行时：NodeMapManager 基于 cache 创建，维护实例特定的 nodeMetas
 * - 多实例：共享 cache，各自独立的 NodeMapManager
 *
 * @see NodeMetadata - 节点元数据定义
 * @see CompiledTemplateCache - 编译缓存定义
 */

import type { NodeMetadata, NodeIndexPath } from './compiled-types';

/**
 * INodeMapManager — NodeMapManager 接口
 *
 * 定义节点映射管理器的标准接口，提供节点访问、子组件管理、DOM 操作等方法。
 *
 * @example
 * ```ts
 * // 访问节点
 * const nodeMapMgr = component._nodeMapMgr;
 * const rootNode = nodeMapMgr.get('root');
 * const iconNode = nodeMapMgr.get('icon');
 *
 * // 访问 DOM 元素
 * const rootEl = rootNode.el;
 * const iconEl = iconNode.el;
 *
 * // 修改节点属性
 * iconNode.hidden = true;
 * nodeMapMgr.set('icon', iconNode);
 *
 * // 挂载子组件
 * const childComponent = new ChildComponent({ ... });
 * nodeMapMgr.mountChildComponent(nodeMapMgr.get('slot'), childComponent);
 *
 * // 动态替换子组件
 * nodeMapMgr.replace('icon', NewIconComponent, { color: 'red' });
 *
 * // 销毁所有子组件
 * nodeMapMgr.disposeAll();
 * ```
 *
 * @see NodeMapManager - 具体实现类
 */
export interface INodeMapManager {
    /**
     * 节点位置索引
     *
     * 记录命名节点在模板 DOM 树中的位置路径。
     * key 为节点 name，value 为从根节点到该节点的子节点索引路径。
     */
    readonly indexPath: NodeIndexPath;

    /**
     * 节点元数据映射
     *
     * key 为节点 name，value 为 NodeMetadata。
     * 包含节点的所有运行时数据（el、component、componentClass 等）。
     */
    readonly nodeMetas: Record<string, NodeMetadata>;

    /**
     * i18n 节点列表
     *
     * 需要国际化翻译的节点列表，包含节点 name 和 i18nKey。
     */
    readonly i18nNodes: Array<{ name: string; field?: string; i18nKey: string }>;

    readonly permissionNodes: Array<{ name: string; permission: boolean | string }>;

    /**
     * 暴露的属性名列表
     *
     * 组件对外暴露的属性名，用于生成 getter/setter。
     */
    readonly exposeNames: string[];

    /**
     * 根节点标签名
     *
     * 模板根节点的 HTML 标签名（如 'div'、'span'）。
     */
    readonly rootTag: string;

    /**
     * 组件根元素
     *
     * 组件的 DOM 根元素，可直接挂载到父元素。
     */
    readonly el: HTMLElement;

    /**
     * 获取节点元数据
     *
     * @param name - 节点名称
     * @returns 节点元数据，不存在则返回 undefined
     *
     * @example
     * ```ts
     * const node = nodeMapMgr.get('icon');
     * if (node) {
     *     console.log(node.el);  // DOM 元素
     *     console.log(node.component);  // 子组件实例（如果有）
     * }
     * ```
     */
    get(name: string): NodeMetadata | undefined;

    /**
     * 获取指定节点的子组件实例
     *
     * @param name - 节点名称
     * @returns 子组件实例，不存在或无组件则返回 undefined
     *
     * @example
     * ```ts
     * const headerComp = nodeMapMgr.getComponent('header');
     * if (headerComp) {
     *     headerComp.title = 'New Title';
     * }
     * ```
     */
    getComponent(name: string): any | undefined;

    /**
     * 获取所有节点元数据
     *
     * @returns 节点名称 → NodeMetadata 的映射对象
     *
     * @example
     * ```ts
     * const allNodes = nodeMapMgr.getAll();
     * Object.keys(allNodes).forEach(name => {
     *     console.log(name, allNodes[name].el);
     * });
     * ```
     */
    getAll(): Record<string, NodeMetadata>;

    /**
     * 设置节点元数据
     *
     * @param name - 节点名称
     * @param meta - 节点元数据
     *
     * @example
     * ```ts
     * const node = nodeMapMgr.get('icon');
     * node.hidden = true;
     * nodeMapMgr.set('icon', node);
     * ```
     */
    set(name: string, meta: NodeMetadata): void;

    /**
     * 移除节点元数据
     *
     * @param name - 节点名称
     *
     * @example
     * ```ts
     * nodeMapMgr.remove('icon');
     * ```
     */
    remove(name: string): void;

    /**
     * 恢复指定节点的骨架占位符
     *
     * 当 slot 挂载的子组件被销毁时，用骨架占位符替换回原位，
     * 保持父组件 slot 结构不塌陷。
     * itemGroup 子组件不走此流程（它们通过 appendChild 直接挂载）。
     *
     * @param name - 节点名称
     *
     * @example
     * ```ts
     * // 销毁子组件后恢复占位符
     * const slotNode = nodeMapMgr.get('slot');
     * if (slotNode.component) {
     *     slotNode.component.dispose();
     *     nodeMapMgr.restoreSkeleton('slot');
     * }
     * ```
     */
    restoreSkeleton(name: string): void;

    /**
     * 运行时动态替换指定节点的子组件
     *
     * 销毁旧组件 → 创建新组件实例 → DOM 原位替换 → 合并 nodeMap。
     * 与模板编译期的 Component.replace() 不同，这是运行时操作。
     *
     * @param name - 节点名称
     * @param ComponentClass - 新组件类
     * @param props - 组件属性（可选）
     * @returns 新组件实例，失败返回 null
     *
     * @example
     * ```ts
     * // 动态替换图标组件
     * const newIcon = nodeMapMgr.replace('icon', NewIconComponent, {
     *     color: 'red',
     *     size: 24
     * });
     *
     * if (newIcon) {
     *     console.log('替换成功');
     * }
     * ```
     */
    replace(
        name: string,
        ComponentClass: new (props?: Record<string, any>) => any,
        props?: Record<string, any>
    ): any | null;

    /**
     * 销毁所有子组件
     *
     * 遍历 nodeMetas，销毁所有子组件实例，清空 DOM 元素引用。
     * 在组件销毁时自动调用。
     *
     * @example
     * ```ts
     * // 组件销毁时自动调用
     * dispose() {
     *     this._nodeMapMgr.disposeAll();
     *     super.dispose();
     * }
     * ```
     */
    disposeAll(): void;

    /**
     * 挂载子组件到指定节点
     *
     * 将子组件实例挂载到节点的 DOM 元素上，并更新节点的 component 引用。
     *
     * @param node - 目标节点元数据
     * @param child - 子组件实例
     *
     * @example
     * ```ts
     * const slotNode = nodeMapMgr.get('slot');
     * const childComponent = new ChildComponent({ ... });
     * nodeMapMgr.mountChildComponent(slotNode, childComponent);
     * ```
     */
    mountChildComponent(node: NodeMetadata, child: any): void;

    /**
     * 构建 DOM 元素
     *
     * 从模板缓存克隆 DOM 结构，并根据 nodeMetas 初始化节点元素。
     *
     * @returns 组件根元素
     *
     * @example
     * ```ts
     * const el = nodeMapMgr.buildDOM();
     * document.body.appendChild(el);
     * ```
     */
    buildDOM(): HTMLElement;
}
