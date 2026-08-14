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
import { object, string } from '@/utils';
import { NodeMapManager } from '../engine/NodeManager';
import { AttributeManager } from '../engine';
import { CONTENT_MODE_MAP } from '../constants';
import { IComponentCore, NodeMeta, NodeMetaMap } from '../types';
/** 组件初始化能力 */
export const InitAbility = {
    /**
     * 构建 DOM
     *
     * 合并编译模板和构建 DOM 的逻辑，同步执行，el 立即可用。
     */
    buildDOM(): void {
        const cache = TemplateManager.get(this.tpl);
        const splits = TemplateManager.splitOptions(this._options, this.optionKeys);
        this._options = splits.options;
        object.deepMerge(this._options, cache.nodeMetaMap?.root.options || {});
        object.deepMerge(cache.atttributesMap.root ?? {}, splits.attributes);
        this.nodeManager = new NodeMapManager(cache, this as any);
        this.AttributeManager = new AttributeManager(cache.atttributesMap, this as any);
        this.logger.debug(`[prepare:compile template]`, `[${this.type}]:[${this.id}]`);

        this.nodeMapMgr.buildDOM();
        this._applyNodeMeta(cache.nodeMetaMap);
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
} as AbilityDefinition;
