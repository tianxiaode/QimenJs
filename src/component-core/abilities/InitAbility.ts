/**
 * InitAbility — 组件初始化能力
 *
 * 负责组件的初始化流程：
 * - buildDOM: 构建DOM（合并编译模板和构建DOM的逻辑）
 * - setupNodeProps: 设置节点属性
 * - mount: 挂载组件
 * - createChildren: 创建子组件（根据hasParent判断是否调用）
 *
 * 初始化流程：
 * 1. buildDOM() - 同步，el立即可用
 * 2. setupNodeProps() - 同步
 * 3. mount() - 同步
 * 4. createChildren() - 异步派发（根据hasParent判断）
 */

import type { AbilityDefinition } from '@/composable';
import { TemplateManager } from '../engine/TemplateManager';
import { CONTENT_MODE_MAP, SKELETON_CLS } from '../constants';
import { ComponentCoreOptions, IComponentCore } from '../types';
/** 组件初始化能力 */
export const InitAbility = {
    /**
     * 构建 DOM
     *
     * 合并编译模板和构建 DOM 的逻辑，同步执行，el 立即可用。
     */
    _buildDOM(options: ComponentCoreOptions): void {
        const cache = TemplateManager.get(this.tpl);
        const splits = TemplateManager.splitOptions(options, this.optionKeys);

        this.logger.debug(`[prepare:compile template]`, `[${this.type}]:[${this.id}]`);
        const el = document.createElement(this.rootTag);
        this._setNodeEl(el);
        const fragment = this._cache.templateCache!.content.cloneNode(true);
        el.appendChild(fragment);

        if (!this.hasParent) {
            if (this.container) {
                this.container.appendChild(this.el);
            }
            this.createChildren();
        }
    },

    _applyNodeMeta(metaMap: NodeMetaMap): void {
        for (const [name, meta] of Object.entries(metaMap)) {
            if (!meta.contentMode || name === 'root') continue;

            const contentDefs = CONTENT_MODE_MAP[meta.contentMode];
            if (contentDefs === undefined) {
                this.logger.warn(
                    `[build:dom]`,
                    `[${this.type}]:[${this.id}]`,
                    `节点 ${name} 的 contentMode ${meta.contentMode} 不存在`
                );
                continue;
            }

            const optionsKeys = this.optionKeys;
            for (const def of contentDefs) {
                if (!optionsKeys.includes(def)) continue;
                if (!Object.prototype.hasOwnProperty.call(this, def)) {
                    Object.defineProperty(this, def, {
                        get: () => this._getContent(name, def),
                        set: v => this._setContent(name, def, v),
                        configurable: true,
                        enumerable: true,
                    });
                }
            }
        }

        this.logger.debug(
            `[build:dom]`,
            `[${this.type}]:[${this.id}]`,
            `DOM 构建完成，${Object.keys(metaMap).length} 个节点`
        );
    },

    /**
     * 获取节点属性
     */
    _getContent(nodeName: string, contentName: string): any {
        const node: NodeMeta = this.getNode(nodeName);
        if (!node) return undefined;

        // 1. 组件节点
        if (node.isComponent) {
            const instance = node.instance as any;
            const method = this._getComponentMethod(instance, contentName);
            if (typeof method === 'function') return method.call(instance);
            return undefined;
        }

        // 2. 从 DOM 元素获取
        const el = this.getNodeEl(nodeName);
        if (!el) return undefined;

        return this._getDomContent(el, contentName);
    },

    /**
     * 设置节点属性
     */
    _setContent(nodeName: string, contentName: string, value: any): void {
        const node = this.getNode(nodeName);
        if (!node) return;

        // 1. 组件节点：设置到实例
        if (node.isComponent && node.instance) {
            node.instance[contentName] = value;
            return;
        }

        // 2. DOM 元素：设置到元素
        const el = this.getNodeEl(nodeName);
        if (!el) return;

        this._setDomProperty(el, contentName, value);
        this._markNodeDirty(nodeName, { [contentName]: value });
    },

    /**
     * 从 DOM 元素获取属性值
     */
    _getDomContent(el: HTMLElement, contentName: string): any {
        switch (contentName) {
            case 'text':
                return el.textContent;
                break;
            case 'html':
                return el.innerHTML;
                break;
            default:
                return el.getAttribute(contentName);
                break;
        }
    },

    /**
     * 设置 DOM 元素属性值
     */
    _setDomContent(el: HTMLElement, contentName: string, value: any): void {
        switch (contentName) {
            case 'text':
                el.textContent = value;
                break;
            case 'html':
                el.innerHTML = value;
                break;
            default:
                el.setAttribute(contentName, value);
                break;
        }
    },

    _getComponentMethod(instance: any, methodName: string): any {
        const method = instance[methodName] ?? instance[`get${string.capitalize(methodName)}`];
        return method;
    },

    createChildren(childReady?: () => void): void {
        this.logger.debug(`[createChildren][${this.id}]`, '开始创建子组件');
        const components = this.nodeManager.getComponentNodes();
        if (components.length === 0) {
            this.logger.debug(`[createChildren][${this.id}]`, '没有子组件');
            setTimeout(() => {
                this._continueInit(childReady);
            }, 0);
            return;
        }
        for (const name of components) {
            const node = this.getNode(name);
            if (!node) continue;
            const options = node.options;
            const child = new (node.ctor as any)({ hasParent: true, ...options });
            this.nodeManager.mountChildComponent(name, child);
            this._onChildMounted(name, child);
        }

        setTimeout(() => {
            this._continueInit(childReady);
        }, 0);

        this.logger.debug(`[createChildren][${this.id}]`, '子组件创建完成');
    },

    _onChildMounted(nodeName: string, child: IComponentCore) {
        setTimeout(() => {
            (child as any).createChildren(() => this._onChildReady(nodeName, child));
        }, 0);
        this.logger.debug(`[_onChildMounted][${this.id}]`, '子组件创建完成');
    },

    _continueInit(childReady?: () => void) {
        //组件后续初始化任务

        // 子组件创建完成
        if (childReady) {
            childReady();
        }
    },

    _onChildReady(nodeName: string) {
        this.logger.debug(`[_onChildReady][${this.id}]`, `子组件${nodeName}准备完成`);
    },

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
    _restoreSkeleton(nodeName: string): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;

        const placeholder = document.createElement('div');
        placeholder.className = SKELETON_CLS;

        el.replaceWith(placeholder);
        const node = this.get(nodeName);
        if (!node) return;
        node.el = placeholder;
        node.instance = undefined;
    },

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
    _mountChildComponent(nodeName: string, child: IComponentCore): void {
        const node = this.get(nodeName);
        if (!node) {
            this._owner?.logger.warn(`[${this._owner.id}] Slot "${nodeName}" not found`);
            return;
        }
        const placeholder = node.el! ?? this.findByPath(node.nodeIndex!);
        if (!placeholder) return;
        placeholder.replaceWith(child.el!);
        node.el = child.el;
        node.instance = child;
    },

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
    _findByPath(path: number[]): HTMLElement | null {
        let current: Element = this._el;
        for (const idx of path) {
            if (!current.children[idx]) return null;
            current = current.children[idx];
        }
        return current as HTMLElement;
    },
} as AbilityDefinition;
