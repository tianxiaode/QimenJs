/**
 * NodeMapManager — 运行时 DOM 管理器（实例级）
 *
 * 只负责运行时 DOM 操作，不涉及编译/缓存逻辑。
 *
 * 职责：
 * - buildDOM: 从 cache 克隆模板 + buildNodeMap
 * - replace: 运行时动态替换子组件（销毁旧 → 创建新 → DOM 原位替换 → 合并 nodeMap）
 * - mountChildComponent: 运行时子组件挂载（已创建的实例挂载到占位节点）
 * - disposeAll: 清理运行时资源
 *
 * 实例级：每个组件实例创建自己的 NodeMapManager，不跨类共享
 */

import type {
    NodeIndexPath,
    I18nOptionsMap,
    PermissionOptionsMap,
    IComponentCore,
    ComponentClass,
    INodeManager,
    TemplateCache,
    NodeMetaMap,
    NodeMeta,
    NodeOptions,
} from '../types';
import { SKELETON_CLS } from '../constants';

/** 运行时 DOM 管理器，负责模板克隆、节点映射构建、子组件挂载与动态替换 */
export class NodeMapManager implements INodeManager {
    private _cache: TemplateCache;
    private _map: NodeMetaMap = {};
    private _el!: HTMLElement;
    private _owner: IComponentCore;

    /**
     * 创建 NodeMapManager 实例
     *
     * @param cache - 编译后的模板缓存对象，包含模板内容、索引路径等信息
     * @param nodeMetas - 节点元数据映射表，可选参数，默认为空对象
     * @param owner - 拥有此管理器的组件实例，可选参数，用于建立父子组件关系
     *
     * @example
     * ```typescript
     * const cache = {
     *   templateCache: document.createElement('template'),
     *   indexPath: { root: [0], child: [0, 1] },
     *   i18nNodes: [],
     *   exposeNames: []
     * };
     * const nodeMetas = {
     *   root: { tag: 'div' },
     *   child: { tag: 'span' }
     * };
     * const manager = new NodeMapManager(cache, nodeMetas, componentInstance);
     * ```
     *
     * @remarks
     * - 每个组件实例应创建自己的 NodeMapManager
     * - 不应在多个组件间共享同一个 NodeMapManager 实例
     */
    constructor(cache: TemplateCache, owner: IComponentCore) {
        this._cache = cache;
        this._owner = owner;
        this._map = cache.nodeMetaMap;
    }

    /**
     * 获取节点索引路径映射
     *
     * @returns 节点名到索引路径的映射对象
     *
     * @example
     * ```typescript
     * const indexPath = manager.indexPath;
     * console.log(indexPath['root']); // [0]
     * console.log(indexPath['child']); // [0, 1]
     * ```
     */
    get indexPath(): NodeIndexPath {
        return this._cache.indexPath;
    }

    /**
     * 获取需要国际化处理的节点列表
     *
     * @returns 包含节点名和国际化键的数组
     *
     * @example
     * ```typescript
     * const i18nNodes = manager.i18nNodes;
     * i18nNodes.forEach(node => {
     *   console.log(node.name, node.i18nKey);
     * });
     * ```
     */
    get i18ns(): I18nOptionsMap {
        return this._cache.i18nMap;
    }

    /**
     * 获取需要权限控制的节点列表
     */
    get permissions(): PermissionOptionsMap {
        return this._cache.permissionMap;
    }

    /**
     * 获取根节点的标签名
     *
     * @returns 根节点的标签名，如果未定义则返回 'div'
     *
     * @example
     * ```typescript
     * const tag = manager.rootTag;
     * console.log(tag); // 'div' 或其他定义的标签
     * ```
     */
    get rootTag(): string {
        return this._map.root.tag ?? 'div';
    }

    /**
     * 获取组件的根 DOM 元素
     *
     * @returns 组件的根 DOM 元素，如果在 buildDOM() 调用前访问则可能为 undefined
     *
     * @example
     * ```typescript
     * manager.buildDOM();
     * const rootEl = manager.el;
     * rootEl.classList.add('my-component');
     * ```
     *
     * @remarks
     * - 必须在 buildDOM() 调用后才能正确获取元素
     */
    get el(): HTMLElement {
        return this._el;
    }

    /**
     * 获取节点元数据的映射表
     * @returns {NodeMetaMap} 返回节点元数据的映射表，包含所有节点的元数据信息
     */
    get map(): NodeMetaMap {
        return this._map;
    }

    /**
     * 根据节点名获取节点元数据
     *
     * @param nodeName - 节点名称，在模板中通过 qm-node 或类似指令定义
     * @returns 节点元数据对象，包含 el、component 等信息；如果节点不存在则返回 undefined
     *
     * @example
     * ```typescript
     * const nodeMeta = manager.get('header');
     * if (nodeMeta) {
     *   console.log('Header element:', nodeMeta.el);
     *   if (nodeMeta.component) {
     *     console.log('Header component:', nodeMeta.component);
     *   }
     * }
     * ```
     *
     * @remarks
     * - 返回的对象包含运行时的 DOM 元素引用和组件实例
     * - 节点名区分大小写
     */
    get(nodeName: string): NodeMeta | undefined {
        return this._map[nodeName];
    }

    /**
     * 设置或更新节点元数据
     *
     * @param nodeName - 节点名称
     * @param meta - 节点元数据对象
     *
     * @example
     * ```typescript
     * manager.set('dynamicNode', {
     *   el: document.createElement('div'),
     *   tag: 'div',
     *   component: myComponentInstance
     * });
     * ```
     *
     * @remarks
     * - 如果节点名已存在，会覆盖原有元数据
     * - 不会自动处理 DOM 操作，需要手动确保 DOM 同步
     */
    set(nodeName: string, meta: NodeMeta): void {
        this._map[nodeName] = meta;
    }

    /**
     * 更新指定节点名称的元数据信息
     * @param nodeName - 要更新的节点名称
     * @param meta - 包含要更新的节点元数据的部分对象
     */
    update(nodeName: string, meta: Partial<NodeMeta>): void {
        // 使用展开运算符合并现有元数据和新的元数据
        // 保留原有属性的同时更新或添加新属性
        this._map[nodeName] = { ...this._map[nodeName], ...meta };
    }

    /**
     * 根据节点名称获取对应的HTML元素
     * @param nodeName - 节点名称
     * @returns 返回对应的HTMLElement元素，如果不存在则返回undefined
     */
    getNodeEl(nodeName: string): HTMLElement | undefined {
        // 首先获取指定名称的节点
        const node = this.get(nodeName);
        if (!node) return undefined;
        // 检查节点是否存在以及是否为组件
        if (node.isComponent) {
            // 如果是组件，返回组件实例的el属性
            return node.instance?.el;
        }
        // 如果不是组件，直接从映射表中获取对应的HTML元素
        if (node.el) return node.el;
        node.el = this.findByPath(node.nodeIndex!) as HTMLElement;
        return node.el;
    }

    /**
     * 获取指定节点的子组件实例
     *
     * @param name - 节点名称
     * @returns 子组件实例，如果节点不存在或无组件则返回 undefined
     *
     * @example
     * ```typescript
     * // 获取 header 节点的子组件
     * const headerComp = manager.getComponent('header');
     * if (headerComp) {
     *   headerComp.title = 'New Title';
     * }
     * ```
     */

    getComponent(nodeName: string): IComponentCore | undefined {
        return this._map[nodeName]?.instance;
    }

    /**
     * 获取组件节点列表
     * @returns 返回组件节点的字符串数组
     */
    getComponentNodes(): string[] {
        return this._cache.components;
    }

    /**
     * 获取指定节点的选项配置
     * @param nodeName - 要查询的节点名称
     * @returns 返回节点的选项配置(NodeOptions类型)，如果节点不存在则返回undefined
     */
    getOptions(nodeName: string): NodeOptions | undefined {
        return this._map[nodeName].options;
    }

    /**
     * 判断给定的节点名称是否为组件
     * @param nodeName - 需要检查的节点名称
     * @returns 如果是组件返回true，否则返回false
     */
    isComponent(nodeName: string): boolean {
        // 使用可选链操作符安全访问_map对象中对应nodeName的属性
        // 如果isComponent属性存在则返回其值，否则返回false
        return this._map[nodeName]?.isComponent ?? false;
    }

    /**
     * 构建组件的 DOM 结构
     *
     * 从模板缓存中克隆模板内容，创建根元素并构建节点映射表。
     * 这是组件初始化时的核心方法，负责将编译后的模板转换为实际的 DOM 结构。
     *
     * @returns 构建完成的根 DOM 元素
     *
     * @example
     * ```typescript
     * const manager = new NodeMapManager(cache, nodeMetas, owner);
     * const rootElement = manager.buildDOM();
     * document.body.appendChild(rootElement);
     * // 此时可以通过 manager.get('nodeName') 获取节点引用
     * ```
     *
     * @remarks
     * - 此方法会设置内部的 _el 属性作为根元素引用
     * - 调用后会自动构建节点映射表 (_buildNodeMap)
     * - 只应在组件初始化时调用一次
     */
    buildDOM() {
        this._el = document.createElement(this.rootTag);
        const fragment = this._cache.templateCache!.content.cloneNode(true);
        this._el.appendChild(fragment);
    }

    /**
     * 将指定节点恢复为骨架占位符
     *
     * 用骨架占位符替换当前节点的 DOM 元素，清除组件引用。
     * 通常用于组件卸载后恢复占位状态，以便后续重新挂载组件。
     *
     * @param nodeName - 节点名称
     *
     * @example
     * ```typescript
     * // 先挂载一个组件
     * manager.mountChildComponent(nodeMeta, childComponent);
     * // 后续需要卸载并恢复骨架
     * manager.restoreSkeleton('childSlot');
     * // 骨架占位符现在替代了原来的组件元素
     * ```
     *
     * @remarks
     * - 如果节点不存在，方法会静默返回
     * - 会清除节点的 component 引用
     * - 占位符会继承 SKELETON_CLS 样式类
     * - 保持节点在父容器中的位置信息
     */
    restoreSkeleton(nodeName: string): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;

        const placeholder = document.createElement('div');
        placeholder.className = SKELETON_CLS;

        el.replaceWith(placeholder);
        const node = this.get(nodeName);
        if (!node) return;
        node.el = placeholder;
        node.instance = undefined;
    }

    /**
     * 运行时动态替换指定节点的子组件
     *
     * 销毁旧组件及其子条目 → 创建新组件实例 → DOM 原位替换 → 合并 nodeMap。
     * 与模板编译期的 Component.replace() 不同，这是运行时操作。
     *
     * @param nodeName - 目标节点名称
     * @param ComponentClass - 新的组件类构造函数
     * @param options - 传递给新组件的属性对象，可选
     * @returns 新创建的组件实例，如果节点未找到则返回 null
     *
     * @example
     * ```typescript
     * // 替换为新的组件实例
     * const newHeader = manager.replace('header', HeaderComponent, { title: 'New Title' });
     *
     * // 不带 props 的替换
     * const newFooter = manager.replace('footer', FooterComponent);
     *
     * // 检查是否成功
     * if (!newHeader) {
     *   console.error('Header node not found');
     * }
     * ```
     *
     * @remarks
     * - 会先销毁旧组件及其所有子节点
     * - 新组件的 parent 会自动设置为当前管理器的 owner
     * - 会合并新组件的 nodeMap 到父组件
     * - 如果节点不存在，返回 null
     */
    replace(
        nodeName: string,
        componentClass: ComponentClass,
        options?: Record<string, any>
    ): any | null {
        const old = this._map[nodeName];
        if (!old) return null;

        const newChild = new componentClass(options);

        const el = this.getNodeEl(nodeName);
        el?.replaceWith(newChild.el!);
        old.el = newChild.el;
        old.instance = newChild;
        old.ctor = componentClass;

        return newChild;
    }

    /**
     * 清理所有运行时资源
     *
     * 遍历并销毁所有节点关联的组件，清空节点映射表。
     * 这是组件销毁时的核心清理方法，确保所有子组件正确释放资源。
     *
     * @example
     * ```typescript
     * // 组件销毁时调用
     * class MyComponent {
     *   dispose() {
     *     this.nodeMapMgr.disposeAll();
     *   }
     * }
     * ```
     *
     * @remarks
     * - 会调用每个组件的 dispose() 方法
     * - 清空后 _map 会被重置为空对象
     * - 不会移除 DOM 元素，只清理组件引用
     * - 适用于组件卸载前的资源清理
     */
    dispose(): void {
        for (const node of Object.values(this._map)) {
            if (node.instance && typeof node.instance.dispose === 'function') {
                node.instance.dispose();
            }
        }
        this._map = {};
        this._cache = null as any;
        this._owner = null as any;
        this._el = null as any;
    }

    /**
     * 将已创建的子组件实例挂载到指定节点的占位元素上
     *
     * 用占位元素替换为子组件的 el，合并 nodeMap。
     * 与 replace() 不同，此方法不处理旧组件销毁，也不创建新实例。
     *
     * @param node - 目标节点元数据，必须包含占位元素 el
     * @param child - 已创建的子组件实例，必须包含 el 属性
     *
     * @example
     * ```typescript
     * // 创建子组件实例
     * const childComponent = new ChildComponent({ text: 'Hello' });
     *
     * // 获取占位节点
     * const nodeMeta = manager.get('childSlot');
     * if (nodeMeta) {
     *   // 挂载子组件
     *   manager.mountChildComponent(nodeMeta, childComponent);
     * }
     * ```
     *
     * @remarks
     * - 会设置子组件的 parent 为当前管理器的 owner
     * - 如果节点定义了 cls，会自动添加到子组件元素上
     * - 会合并子组件的 nodeMap 到父组件
     * - 会记录节点的 parentNode 和 nodeIndex 用于后续恢复
     */
    mountChildComponent(nodeName: string, child: IComponentCore): void {
        const node = this.get(nodeName);
        if (!node) {
            this._owner?.logger.warn(
                `[${this._owner.id}][NodeMapManager] Slot "${nodeName}" not found`
            );
            return;
        }
        const placeholder = node.el! ?? this.findByPath(node.nodeIndex!);
        if (!placeholder) return;
        placeholder.replaceWith(child.el!);
        node.el = child.el;
        node.instance = child;
    }

    /**
     * 按子节点索引路径定位 DOM 元素
     *
     * @param root - 搜索起点元素
     * @param path - 子节点索引路径（由编译时 indexPath 产出）
     * @returns 定位到的 HTMLElement，路径不存在时返回 null
     *
     * @example
     * ```ts
     * // 编译时产出: indexPath['text'] = [0, 1]
     * // 运行时定位: const el = findByPath(rootEl, [0, 1])
     * ```
     */
    private findByPath(path: number[]): HTMLElement | null {
        let current: Element = this._el;
        for (const idx of path) {
            if (!current.children[idx]) return null;
            current = current.children[idx];
        }
        return current as HTMLElement;
    }
}
