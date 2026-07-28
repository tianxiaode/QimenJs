/**
 * TemplateRegistrar — 模板注册器
 *
 * 核心职能：
 *   1. 为 replace 提供模板查找源（tpl.replace 指定母模板名称）
 *   2. 存储编译产物，便于调试检查
 *
 * register(name, tpl) 只存原始模板，不编译。
 * get(name) 懒编译：首次调用时编译、缓存、返回编译产物。
 *
 * @example
 * ```ts
 * const registry = TemplateRegistrar.getInstance();
 * registry.register('Button', buttonTpl);
 * registry.register('DropdownButton', { replace: 'Button', replaces: { content: ... }, ...dropdownTpl });
 *
 * const compiled = registry.get('Button');  // 首次触发编译
 * registry.inspect();  // 查看模板与编译产物对比
 * ```
 */

import { RegistrarBase } from '@/registry/registrars/RegistrarBase';
import { CompileEngine } from './CompileEngine';
import { clone } from '@/utils/object/clone';
import { NodeMapManager } from '../NodeMapManager';
import type { TplNode } from '../types/tpl-node-types';
import type { TemplateEntry, CompiledProduct } from '../types/template-registrar';
import type { INodeMapManager } from '../types/node-map-manager-types';

interface TemplateStorage {
    entries: Map<string, TemplateEntry>;
}

export class TemplateRegistrar extends RegistrarBase<TemplateStorage> {
    public readonly name = 'template';

    protected storage: TemplateStorage = {
        entries: new Map(),
    };

    /**
     * 注册模板
     *
     * 将模板注册到注册表中，支持模板替换（replace）机制。
     * 如果模板声明了 replace 属性，会从父模板继承并应用 replaces 配置。
     *
     * @param name - 模板名称，用于后续获取和引用
     * @param tpl - 模板节点对象，可包含 replace 和 replaces 属性
     *
     * @example
     * ```ts
     * const registry = TemplateRegistrar.getInstance();
     *
     * // 注册基础模板
     * registry.register('Button', {
     *   tag: 'button',
     *   name: 'root',
     *   children: [{ name: 'content', tag: 'span' }]
     * });
     *
     * // 注册替换模板
     * registry.register('IconButton', {
     *   replace: 'Button',
     *   replaces: {
     *     content: { tag: 'span', children: [{ name: 'icon', tag: 'i' }] }
     *   }
     * });
     * ```
     *
     * @remarks
     * - 如果 replace 指定的父模板不存在，会使用当前模板并输出警告
     * - 注册后模板存储为 TemplateEntry，包含 name、tpl、replaceFrom
     * - 调用此方法前会检查注册器锁定状态
     */
    register(name: string, tpl: TplNode): void {
        this.checkLock();

        let resolvedTpl = tpl;

        if (tpl.replace) {
            const parentEntry = this.storage.entries.get(tpl.replace);
            if (parentEntry) {
                resolvedTpl = this.applyReplaces(parentEntry.tpl, tpl.replaces ?? {});
            } else {
                this.logger.warn(
                    `Replace source '${tpl.replace}' not found for '${name}', using tpl as-is`
                );
            }
        }

        this.storage.entries.set(name, { name, tpl: resolvedTpl, replaceFrom: tpl.replace });

        this.logger.debug(
            `Template registered: ${name}${tpl.replace ? ` (replace from ${tpl.replace})` : ''}`
        );
    }

    /**
     * 获取编译后的模板产物
     *
     * 懒编译：首次调用时编译模板，后续直接返回缓存的编译产物。
     * 编译产物包含 cache（可共享部分）和 nodeMetas（每类独立部分）。
     *
     * @param name - 模板名称
     * @returns 编译产物，包含 cache 和 nodeMetas；如果模板不存在返回 undefined
     *
     * @example
     * ```ts
     * const registry = TemplateRegistrar.getInstance();
     * const compiled = registry.get('Button');
     *
     * if (compiled) {
     *   const { cache, nodeMetas } = compiled;
     *   // cache.html: 编译后的 HTML 字符串
     *   // cache.indexPath: 节点路径映射
     *   // nodeMetas: 节点元数据集合
     * }
     * ```
     *
     * @remarks
     * - 编译结果会被缓存到 entry.compiled
     * - 后续调用直接返回缓存结果
     */
    get(name: string): CompiledProduct | undefined {
        const entry = this.storage.entries.get(name);
        if (!entry) return undefined;

        if (entry.compiled) return entry.compiled;

        const { cache, nodeMetas } = CompileEngine.compile(entry.tpl);
        entry.compiled = { cache, nodeMetas };
        return entry.compiled;
    }

    /**
     * 创建节点映射管理器
     *
     * 基于已编译的模板创建 NodeMapManager 实例，
     * 用于管理组件实例的节点映射关系。
     *
     * @param name - 模板名称
     * @param owner - 可选的宿主对象，通常是组件实例
     * @returns NodeMapManager 实例，如果模板不存在返回 undefined
     *
     * @example
     * ```ts
     * const registry = TemplateRegistrar.getInstance();
     * const nodeMapManager = registry.createNodeMapManager('Button', componentInstance);
     *
     * // 使用 nodeMapManager 管理节点
     * nodeMapManager.set('title', titleElement);
     * const titleEl = nodeMapManager.get('title');
     * ```
     */
    createNodeMapManager(name: string, owner?: any): INodeMapManager | undefined {
        const compiled = this.get(name);
        if (!compiled) return undefined;
        return new NodeMapManager(compiled.cache, compiled.nodeMetas, owner);
    }

    /**
     * 注册组件定义
     *
     * 同时完成组件类注册和模板注册：
     * - 从 ComponentClass.type 提取类型名作为注册 key
     * - 从 ComponentClass.tpl 获取模板（如果有静态 tpl 字段）
     * - 存储组件类引用，供 getComponent 使用
     *
     * @param type - 组件类型标识
     * @param componentClass - 组件类
     *
     * @example
     * ```ts
     * const registry = TemplateRegistrar.getInstance();
     * registry.registerComponent('Button', ButtonComponent);
     * // 同时注册了组件类和模板
     *
     * const BtnClass = registry.getComponent('Button'); // 获取组件类
     * ```
     */
    registerComponent(
        type: string,
        componentClass: new (props?: Record<string, any>) => any
    ): void {
        this.checkLock();

        const entry = this.storage.entries.get(type);
        if (entry) {
            entry.componentClass = componentClass;
        } else {
            this.storage.entries.set(type, {
                name: type,
                tpl: { tag: 'div' },
                componentClass,
            });
        }

        this.logger.debug(`Component registered: ${type}`);
    }

    /**
     * 获取组件类
     *
     * @param type - 组件类型标识
     * @returns 组件类，未找到返回 undefined
     */
    getComponent(type: string): (new (props?: Record<string, any>) => any) | undefined {
        return this.storage.entries.get(type)?.componentClass;
    }

    /**
     * 注销模板
     *
     * 从注册表中移除指定名称的模板。
     *
     * @param id - 模板名称
     *
     * @example
     * ```ts
     * const registry = TemplateRegistrar.getInstance();
     * registry.unregister('OldButton');
     * ```
     *
     * @remarks
     * - 调用此方法前会检查注册器锁定状态
     */
    unregister(id: string): void {
        this.checkLock();
        this.storage.entries.delete(id);
    }

    /**
     * 检查模板是否存在
     *
     * @param name - 模板名称
     * @returns 如果模板存在返回 true，否则返回 false
     *
     * @example
     * ```ts
     * const registry = TemplateRegistrar.getInstance();
     * if (registry.has('Button')) {
     *   const compiled = registry.get('Button');
     * }
     * ```
     */
    has(name: string): boolean {
        return this.storage.entries.has(name);
    }

    /**
     * 获取所有已注册模板名称
     *
     * @returns 模板名称数组
     *
     * @example
     * ```ts
     * const registry = TemplateRegistrar.getInstance();
     * const templateNames = registry.names();
     * // ['Button', 'IconButton', 'Dropdown', ...]
     * ```
     */
    names(): string[] {
        return Array.from(this.storage.entries.keys());
    }

    /**
     * 获取模板替换关系图
     *
     * 返回所有模板及其替换来源的映射关系。
     *
     * @returns Map<模板名, 替换来源模板名 | undefined>
     *
     * @example
     * ```ts
     * const registry = TemplateRegistrar.getInstance();
     * const graph = registry.replaceGraph();
     * // Map {
     * //   'Button' => undefined,
     * //   'IconButton' => 'Button',
     * //   'DropdownButton' => 'Button'
     * // }
     * ```
     */
    replaceGraph(): Map<string, string | undefined> {
        const graph = new Map<string, string | undefined>();
        for (const [name, entry] of this.storage.entries) {
            graph.set(name, entry.replaceFrom);
        }
        return graph;
    }

    /**
     * 执行调试检查输出
     *
     * 输出所有注册模板的详细信息，包括：
     * - 模板名称和替换来源
     * - 原始模板结构（截断显示）
     * - 编译状态和节点数量
     *
     * @example
     * ```ts
     * const registry = TemplateRegistrar.getInstance();
     * registry.inspect();
     * // 控制台输出：
     * // Templates: 3
     * //
     * // 📄 Button
     * //    tpl: {"tag":"button","name":"root",...
     * //    compiled: nodes=3 cache={ root, title, content }
     * //
     * // 📄 IconButton ← replace from Button
     * //    tpl: {"tag":"button","name":"root",...
     * //    compiled: (not yet)
     * ```
     */
    protected doInspect(): void {
        const entries = Array.from(this.storage.entries.entries());
        console.log(`  Templates: ${entries.length}`);
        console.log('');
        for (const [name, entry] of entries) {
            const replaceInfo = entry.replaceFrom ? ` ← replace from ${entry.replaceFrom}` : '';
            console.log(`  📄 ${name}${replaceInfo}`);
            console.log(`     tpl: ${JSON.stringify(entry.tpl, null, 2).slice(0, 200)}...`);
            if (entry.compiled) {
                const nodeCount = Object.keys(entry.compiled.nodeMetas).length;
                const cacheKeys = Object.keys(entry.compiled.cache).filter(
                    k => entry.compiled!.cache[k] != null
                );
                console.log(`     compiled: nodes=${nodeCount} cache={ ${cacheKeys.join(', ')} }`);
            } else {
                console.log(`     compiled: (not yet)`);
            }
        }
    }

    /**
     * 递归遍历并应用替换
     *
     * 在模板树中查找目标节点名，并应用替换配置。
     *
     * @param node - 当前遍历的节点
     * @param targetName - 要替换的节点名称
     * @param replacement - 替换配置对象
     *
     * @example
     * ```ts
     * // 将 content 节点替换为新配置
     * walkAndApply(parentNode, 'content', { tag: 'span', cls: 'new-cls' });
     * ```
     *
     * @remarks
     * - 如果 replacement 包含 tag 或 children，则完全替换节点
     * - 否则合并属性到目标节点
     */
    private walkAndApply(node: TplNode, targetName: string, replacement: any): void {
        if (!node.children) return;
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (child.name === targetName) {
                if (replacement.tag || replacement.children) {
                    node.children[i] = replacement;
                } else {
                    Object.assign(child, replacement);
                }
            } else {
                this.walkAndApply(child, targetName, replacement);
            }
        }
    }

    /**
     * 应用替换配置到父模板
     *
     * 克隆父模板并应用所有替换配置，生成新的模板。
     *
     * @param parentTpl - 父模板节点
     * @param replaces - 替换配置映射，key 为节点名，value 为替换配置
     * @returns 应用替换后的新模板节点
     *
     * @example
     * ```ts
     * const newTpl = applyReplaces(buttonTpl, {
     *   content: { tag: 'span', children: [{ name: 'icon', tag: 'i' }] },
     *   title: { cls: 'bold' }
     * });
     * ```
     *
     * @remarks
     * - 会深拷贝父模板，避免修改原模板
     * - 按顺序应用所有替换配置
     */
    private applyReplaces(parentTpl: TplNode, replaces: Record<string, any>): TplNode {
        const cloned = clone(parentTpl);
        for (const [name, replacement] of Object.entries(replaces)) {
            this.walkAndApply(cloned, name, replacement);
        }
        return cloned;
    }
}
