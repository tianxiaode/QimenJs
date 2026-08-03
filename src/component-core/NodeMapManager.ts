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

import type { NodeMetadata, NodeIndexPath, CompiledTemplateCache } from './types/compiled-types';
import type { INodeMapManager } from './types/node-map-manager-types';
import { findByPath } from './engine/utils/dom-path';
import { SKELETON_CLS } from './constants/compile-constants';

export class NodeMapManager implements INodeMapManager {
    private _cache: CompiledTemplateCache;
    private _nodeMetas: Record<string, NodeMetadata>;
    private _map: Record<string, NodeMetadata> = {};
    private _el!: HTMLElement;
    private _owner: any;

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
    constructor(
        cache: CompiledTemplateCache,
        nodeMetas?: Record<string, NodeMetadata>,
        owner?: any
    ) {
        this._cache = cache;
        this._nodeMetas = nodeMetas || {};
        this._owner = owner;
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
     * 获取节点元数据映射表
     *
     * @returns 节点名到节点元数据的映射对象
     *
     * @example
     * ```typescript
     * const nodeMetas = manager.nodeMetas;
     * console.log(nodeMetas['root'].tag); // 'div'
     * ```
     */
    get nodeMetas(): Record<string, NodeMetadata> {
        return this._nodeMetas;
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
    get i18nNodes(): Array<{ name: string; i18nKey: string }> {
        return this._cache.i18nNodes;
    }

    get permissionNodes(): Array<{ name: string; permission: boolean | string }> {
        return this._cache.permissionNodes;
    }

    /**
     * 获取需要暴露的节点名列表
     *
     * @returns 暴露的节点名字符串数组
     *
     * @example
     * ```typescript
     * const exposeNames = manager.exposeNames;
     * exposeNames.forEach(name => {
     *   console.log('Exposed node:', name);
     * });
     * ```
     */
    get exposeNames(): string[] {
        return this._cache.exposeNames;
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
        return this._nodeMetas['root']?.tag ?? 'div';
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
    buildDOM(): HTMLElement {
        this._el = document.createElement(this.rootTag);
        const fragment = this._cache.templateCache.content.cloneNode(true);
        this._el.appendChild(fragment);
        this._buildNodeMap();
        return this._el;
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
     * 根据节点名获取节点元数据
     *
     * @param name - 节点名称，在模板中通过 qm-node 或类似指令定义
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
    get(name: string): NodeMetadata | undefined {
        return this._map[name];
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
    getComponent(name: string): any | undefined {
        return this._map[name]?.component;
    }

    /**
     * 获取所有节点元数据的映射表
     *
     * @returns 包含所有节点名到节点元数据映射的对象
     *
     * @example
     * ```typescript
     * const allNodes = manager.getAll();
     * Object.entries(allNodes).forEach(([name, meta]) => {
     *   console.log(`${name}: ${meta.el?.tagName}`);
     * });
     * ```
     *
     * @remarks
     * - 返回的是内部映射表的引用，修改会影响管理器状态
     * - 包含 buildDOM() 后构建的所有节点信息
     */
    getAll(): Record<string, NodeMetadata> {
        return this._map;
    }

    /**
     * 设置或更新节点元数据
     *
     * @param name - 节点名称
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
    set(name: string, meta: NodeMetadata): void {
        this._map[name] = meta;
    }

    /**
     * 将指定节点恢复为骨架占位符
     *
     * 用骨架占位符替换当前节点的 DOM 元素，清除组件引用。
     * 通常用于组件卸载后恢复占位状态，以便后续重新挂载组件。
     *
     * @param name - 节点名称
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
    restoreSkeleton(name: string): void {
        const node = this._map[name];
        if (!node) return;

        const placeholder = document.createElement('div');
        placeholder.className = SKELETON_CLS;

        if (node.el) {
            node.el.replaceWith(placeholder);
        } else if (node.parentNode) {
            const refNode =
                node.nodeIndex !== undefined ? node.parentNode.childNodes[node.nodeIndex] : null;
            if (refNode) {
                node.parentNode.insertBefore(placeholder, refNode);
            } else {
                node.parentNode.appendChild(placeholder);
            }
        }

        node.el = placeholder;
        node.component = undefined;
    }

    /**
     * 移除指定节点及其所有子节点
     *
     * 完整清理节点：销毁关联组件、移除 DOM 元素、从映射表中删除。
     * 会递归处理所有子节点，确保资源完全释放。
     *
     * @param name - 要移除的节点名称
     *
     * @example
     * ```typescript
     * // 移除单个节点
     * manager.remove('header');
     *
     * // 移除带有子组件的节点（子组件也会被销毁）
     * manager.remove('container');
     * // container 内部的所有子节点也会被清理
     * ```
     *
     * @remarks
     * - 如果节点不存在，方法会静默返回
     * - 会调用子组件的 dispose() 方法进行清理
     * - 通过 isItemContainer 控制是否在 dispose 时恢复骨架
     * - 会同时删除所有以该节点路径为前缀的子节点条目
     */
    remove(name: string): void {
        if (name === 'root') {
            throw new Error('[NodeMapManager] Cannot remove root node');
        }

        const node = this._map[name];
        if (!node) return;

        this._removeChildEntries(name);

        if (node.component && typeof node.component.dispose === 'function') {
            node.component.dispose();
        }

        if (node.el) {
            node.el.remove();
        }

        delete this._map[name];
    }

    /**
     * 运行时动态替换指定节点的子组件
     *
     * 销毁旧组件及其子条目 → 创建新组件实例 → DOM 原位替换 → 合并 nodeMap。
     * 与模板编译期的 Component.replace() 不同，这是运行时操作。
     *
     * @param name - 目标节点名称
     * @param ComponentClass - 新的组件类构造函数
     * @param props - 传递给新组件的属性对象，可选
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
        name: string,
        ComponentClass: new (props?: Record<string, any>) => any,
        props?: Record<string, any>
    ): any | null {
        const old = this._map[name];
        if (!old) return null;

        this._removeChildEntries(name);

        if (old.component && typeof old.component.dispose === 'function') {
            old.component.dispose();
        }

        const newChild = new ComponentClass(props);
        if (this._owner) (newChild as any).parent = this._owner;

        this._replaceDOM(old, newChild.el);

        old.el = newChild.el;
        old.component = newChild;
        old.componentClass = ComponentClass;

        if (newChild.nodeMap && this._owner) {
            Object.assign(this._owner.nodeMap, newChild.nodeMap);
        } else if ((newChild as any).nodeMapMgr) {
            this._mergeChildNodeMap((newChild as any).nodeMapMgr);
        }

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
    disposeAll(): void {
        for (const node of Object.values(this._map)) {
            if (node.component && typeof node.component.dispose === 'function') {
                node.component.dispose();
            }
        }
        this._map = {};
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
    mountChildComponent(node: NodeMetadata, child: any): void {
        const placeholder = node.el!;
        const parentEl = placeholder.parentElement;
        if (parentEl) {
            node.parentNode = parentEl;
            node.nodeIndex = Array.from(parentEl.childNodes).indexOf(placeholder as ChildNode);
        }
        placeholder.replaceWith(child.el);
        node.el = child.el;
        node.component = child;
        child.parent = this._owner;

        if (node.cls && child.el) {
            const classes = node.cls.split(/\s+/).filter(Boolean);
            if (classes.length) child.el.classList.add(...classes);
        }

        if (child.nodeMapMgr) {
            this._mergeChildNodeMap(child.nodeMapMgr);
        } else if (child.nodeMap) {
            for (const [name, meta] of Object.entries(
                child.nodeMap as Record<string, NodeMetadata>
            )) {
                this._map[name] = meta;
            }
        }
    }

    /**
     * 构建节点映射表
     *
     * 遍历 indexPath 中的所有节点路径，根据路径查找对应的 DOM 元素，
     * 并将元数据与 DOM 元素关联后存入内部映射表。
     *
     * @remarks
     * - 仅在 buildDOM() 内部调用
     * - 使用 findByPath 根据索引路径定位元素
     * - 会跳过没有元数据或无法找到元素的节点
     */
    private _buildNodeMap(): void {
        const indexPath = this._cache.indexPath;
        const nodeMetas = this._nodeMetas;

        for (const [name, path] of Object.entries(indexPath)) {
            const meta = nodeMetas[name];
            if (!meta) continue;

            const el = findByPath(this._el, path);
            if (!el) continue;

            this._map[name] = { ...meta, el };
        }
    }

    /**
     * 移除指定节点的所有子节点条目
     *
     * 根据索引路径前缀匹配，删除所有属于指定父节点的子节点。
     * 会调用子节点组件的 dispose() 方法进行清理。
     *
     * @param parentName - 父节点名称
     *
     * @remarks
     * - 通过路径前缀匹配确定子节点关系
     * - 通过 isItemContainer 控制是否在 dispose 时恢复骨架
     * - 会从映射表中删除所有匹配的子节点
     */
    private _removeChildEntries(parentName: string): void {
        const parentPath = this._cache.indexPath[parentName];
        if (!parentPath) return;

        for (const [name, path] of Object.entries(this._cache.indexPath)) {
            if (name === parentName) continue;
            if (
                path.length > parentPath.length &&
                path.slice(0, parentPath.length).every((v, i) => v === parentPath[i])
            ) {
                const node = this._map[name];
                if (node?.component && typeof node.component.dispose === 'function') {
                    node.component.dispose();
                }
                delete this._map[name];
            }
        }
    }

    /**
     * 执行 DOM 元素的替换操作
     *
     * 处理不同场景下的 DOM 替换：
     * 1. 如果旧元素有父节点，直接替换
     * 2. 如果只有父容器和索引信息，在指定位置插入
     *
     * @param old - 旧节点的元数据
     * @param newEl - 新的 DOM 元素
     *
     * @remarks
     * - 优先使用 replaceWith 进行原位替换
     * - 备用方案使用 insertBefore 确保位置正确
     * - 最后手段使用 appendChild 添加到末尾
     */
    private _replaceDOM(old: NodeMetadata, newEl: HTMLElement): void {
        if (old.el?.parentNode) {
            old.el.replaceWith(newEl);
        } else if (old.parentNode && old.nodeIndex !== undefined) {
            const referenceNode = old.parentNode.childNodes[old.nodeIndex];
            if (referenceNode) {
                old.parentNode.insertBefore(newEl, referenceNode);
            } else {
                old.parentNode.appendChild(newEl);
            }
        }
    }

    /**
     * 合并子组件的节点映射表
     *
     * 将子组件管理器中的所有节点元数据合并到当前管理器的映射表中。
     * 确保父组件可以通过 nodeMap 访问到子组件的所有节点。
     *
     * @param childMgr - 子组件的 NodeMapManager 实例
     *
     * @remarks
     * - 直接引用合并，不进行深拷贝
     * - 如果节点名冲突，子组件的节点会覆盖现有条目
     */
    private _mergeChildNodeMap(childMgr: NodeMapManager): void {
        const childMap = childMgr.getAll();
        for (const [name, meta] of Object.entries(childMap)) {
            this._map[name] = meta;
        }
    }
}
