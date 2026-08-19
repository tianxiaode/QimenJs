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
import { COMPONENT_CORE_READONLY_OPTIONS_KEYS, SKELETON_CLS } from '../constants';
import { ComponentCoreOptions, IComponentCore, SplitOptionsResult } from '../types';
import { object } from '@/utils';
/** 组件初始化能力 */
export const InitAbility = {
    /**
     * 构建 DOM
     *
     * 合并编译模板和构建 DOM 的逻辑，同步执行，el 立即可用。
     */
    _buildDOM(options: ComponentCoreOptions): void {
        this._tplCache = TemplateManager.get(this.tpl);
        const splits = TemplateManager.splitOptions(options, this.getOptionKeys());
        this.logger.debug(`[prepare:compile template]`, `[${this.type}]:[${this.id}]`);
        const el = document.createElement(this.rootTag);
        this.el = el as HTMLElement;
        this._setNodeEl('root', el);
        const fragment = this._cache.templateCache!.content.cloneNode(true);
        el.appendChild(fragment);
        this.logger.debug(`[prepare:build html]`, `[${this.type}]:[${this.id}]`);
        this._applyNodeMeta(splits);

        if (!this.hasParent) {
            if (this.container) {
                this.container.appendChild(this.el);
            }
            this.createChildren();
        }
        this._templateInitialized = true;
    },

    _applyNodeMeta(splits: SplitOptionsResult): void {
        const names = this._tplCache.names;
        for (const name of names) {
            const nodeMeta = this.getNode(name);
            if (nodeMeta.isComponent) continue;
            if (!nodeMeta) continue;
            const { attributes, style, classes } = nodeMeta;
            this.setAttributes(name, attributes);
            this.setStyle(name, style);
            this.addCls(name, classes);
        }
        this.logger.debug(`[prepare:setup node props]`, `[${this.type}]:[${this.id}]`);
        const { attributes, style, classes, coreOptions, options } = splits as any;
        this.setAttributes('root', attributes);
        this.setStyle('root', style);
        this.addCls('root', classes);
        //将hidden等属性设置到组件实例上
        for (const [key, value] of coreOptions) {
            object.setProperty(this, key, value);
        }
        //将badge等属性设置到组件实例上
        for (const key of COMPONENT_CORE_READONLY_OPTIONS_KEYS) {
            if (options[key]) {
                this[key] = options[key]; // 设置组件属性
            }
        }
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
            const child = new (node.type as any)({ hasParent: true, ...options });
            const placeholder = this.getNodeEl(name);
            if (!placeholder) continue;
            placeholder.replaceWith(child.el!);
            this._setNodeEl(name, child.el!);
            this._setComponent(name, child);
            this._onChildMounted(name, child);
        }
        this._emitMounted();

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
        this._initializing = false;
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
