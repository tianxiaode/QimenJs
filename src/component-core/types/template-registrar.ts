/**
 * template-registrar.ts — 模板注册器类型
 *
 * 定义模板注册相关的类型，用于管理模板编译和缓存。
 * TemplateRegistrar 负责模板的注册、编译、缓存和实例化。
 */

import type { TplNode } from './tpl-node-types';
import type { NodeMetadata } from './compiled-types';

/**
 * 编译产物
 *
 * 包含模板编译后的缓存和节点元数据。
 * 缓存部分可跨实例共享，nodeMetas 为实例特定数据。
 *
 * @example
 * ```ts
 * const product: CompiledProduct = {
 *     cache: {
 *         html: '<div class="q-button">...</div>',
 *         indexPath: { root: [], icon: [0], text: [1] },
 *         exposeNames: ['title', 'disabled'],
 *         templateCache: document.createElement('template')
 *     },
 *     nodeMetas: {
 *         root: { name: 'root', tag: 'div', cls: 'q-button' },
 *         icon: { name: 'icon', tag: 'i', cls: 'q-button__icon' }
 *     }
 * };
 * ```
 *
 * @see CompileResult - 编译引擎的返回值类型
 */
export interface CompiledProduct {
    /**
     * 编译缓存
     *
     * 包含 HTML、indexPath、exposeNames、i18nNodes、templateCache。
     * 多个组件实例可共享同一缓存。
     */
    cache: any;

    /**
     * 节点元数据
     *
     * key 为节点 name，value 为 NodeMetadata。
     * 实例化时会被复制并附加 el/component 等实例数据。
     */
    nodeMetas: Record<string, NodeMetadata>;
}

/**
 * 模板条目
 *
 * 定义模板注册时的条目，包含模板名称、定义、编译产物和替换关系。
 *
 * @example
 * ```ts
 * // 注册新模板
 * const entry: TemplateEntry = {
 *     name: 'Button',
 *     tpl: {
 *         tag: 'div',
 *         cls: 'q-button',
 *         children: [
 *             { tag: 'i', name: 'icon', cls: 'q-button__icon' },
 *             { tag: 'span', name: 'text', cls: 'q-button__text' }
 *         ]
 *     }
 * };
 *
 * // 注册替换模板
 * const replacedEntry: TemplateEntry = {
 *     name: 'PrimaryButton',
 *     tpl: BUTTON_TEMPLATE,
 *     replaceFrom: 'Button'  // 基于 Button 模板替换
 * };
 *
 * // 已编译的模板条目
 * const compiledEntry: TemplateEntry = {
 *     name: 'Button',
 *     tpl: BUTTON_TEMPLATE,
 *     compiled: {
 *         cache: { ... },
 *         nodeMetas: { ... }
 *     }
 * };
 * ```
 *
 * @see TemplateRegistrar - 模板注册器
 */
export interface TemplateEntry {
    name: string;
    tpl: TplNode;
    compiled?: CompiledProduct;
    replaceFrom?: string;
    componentClass?: new (props?: Record<string, any>) => any;
}
