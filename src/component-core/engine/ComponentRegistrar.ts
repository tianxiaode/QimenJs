/**
 * ComponentRegistrar — 组件注册器（统一管理组件类 + 模板）
 *
 * 核心职能：
 *   1. register(ComponentClass, tpl?) — 注册组件定义 + 可选模板
 *   2. get(type) — 返回组件类
 *   3. getCompiled(type) — 返回编译产物（懒编译）
 *   4. createNodeMapManager(type, owner) — 创建节点映射管理器
 *
 * 两层引用架构：
 *   tplRefs:  TplNode → type          （模板 → 模板名，O(1) 查找）
 *   entries:  type → ComponentEntry    （模板名 → 编译产物，唯一存储）
 *
 * 每个 entry 都有 tplName，指向真正存储 tpl + compiled 的 entry。
 * getCompiled 直接用 tplName 查找，无需递归链。
 *
 * @example
 * ```ts
 * const registry = ComponentRegistrar.getInstance();
 * registry.register(ButtonComponent, BUTTON_TPL);  // tplName = 'Button'
 * registry.register(TabBarComponent);               // tplName = 'Tabs'（继承）
 *
 * const BtnClass = registry.get('Button');
 * const compiled = registry.getCompiled('Button');
 * ```
 */

import { RegistrarBase } from '@/registry';
import { CompileEngine } from './CompileEngine';
import { TplInspector } from './TplInspector';
import { clone } from '@/utils/object';
import { NodeMapManager } from '../NodeMapManager';
import type { TplNode } from '../types/tpl-node-types';
import type { ComponentEntry, CompiledProduct } from '../types/template-registrar';
import type { INodeMapManager } from '../types/node-map-manager-types';

interface ComponentStorage {
    entries: Map<string, ComponentEntry>;
    /**
     * 模板引用表：模板对象 → 模板名（首次注册该模板的组件 type）
     *
     * 当多个组件共享同一个模板对象时，只有第一个组件存储 tpl + compiled，
     * 后续组件只存 tplName 指向模板名，从而避免重复编译。
     */
    tplRefs: Map<TplNode, string>;
}

/** 组件注册器，统一管理组件类与模板的注册、查找、懒编译 */
export class ComponentRegistrar extends RegistrarBase<ComponentStorage> {
    public readonly name = 'component';

    protected storage: ComponentStorage = {
        entries: new Map(),
        tplRefs: new Map(),
    };

    /**
     * 注册组件
     *
     * @param componentClass - 组件类（必须有 static getter type）
     * @param tpl - 可选模板定义，不提供则沿原型链推导
     *
     * @example
     * ```ts
     * registry.register(ButtonComponent, BUTTON_TPL);  // tplName = 'Button'
     * registry.register(TabBarComponent);               // tplName = 'Tabs'
     * ```
     */
    register(componentClass: new (props?: Record<string, any>) => any, tpl?: TplNode): void {
        const type: string =
            (componentClass as any).type ?? (componentClass as any).name?.replace(/Component$/, '');
        if (!type) {
            this.logger.warn(`Component class has no type getter, skipping registration`);
            return;
        }

        if (!(componentClass as any).type) {
            Object.defineProperty(componentClass, 'type', {
                value: type,
                writable: true,
                configurable: true,
            });
        }

        const existing = this.storage.entries.get(type);

        if (tpl) {
            // 第一层查找：模板引用表（O(1)），避免同一模板重复编译
            if (!tpl.replace) {
                const sharedType = this.storage.tplRefs.get(tpl);
                if (sharedType && sharedType !== type) {
                    // 共享模板：tplName 指向主注册者，不存 tpl
                    if (existing) {
                        existing.componentClass = componentClass;
                        delete existing.tpl;
                        delete existing.compiled;
                        existing.replaceFrom = undefined;
                        existing.tplName = sharedType;
                    } else {
                        this.storage.entries.set(type, {
                            name: type,
                            componentClass,
                            tplName: sharedType,
                        });
                    }
                    this.logger.debug(
                        `Component registered: ${type} (shared template → ${sharedType})`
                    );
                    return;
                }
            }

            let resolvedTpl = tpl;

            if (tpl.replace) {
                const parentEntry = this.storage.entries.get(tpl.replace);
                if (parentEntry?.tpl) {
                    resolvedTpl = this.applyReplaces(parentEntry.tpl, tpl.replaces ?? {});
                } else {
                    this.logger.warn(
                        `Replace source '${tpl.replace}' not found for '${type}', using tpl as-is`
                    );
                }
            }

            // 第二层存储：注册模板引用 + 存储 tpl
            if (existing) {
                // 清除旧模板的引用关系
                if (existing.tpl) {
                    const oldRef = this.storage.tplRefs.get(existing.tpl);
                    if (oldRef === type) {
                        this.storage.tplRefs.delete(existing.tpl);
                    }
                }
                existing.tpl = resolvedTpl;
                existing.componentClass = componentClass;
                existing.replaceFrom = tpl.replace;
                existing.tplName = type;
                delete existing.compiled;
            } else {
                this.storage.entries.set(type, {
                    name: type,
                    tpl: resolvedTpl,
                    componentClass,
                    replaceFrom: tpl.replace,
                    tplName: type,
                });
            }

            // 建立模板引用：模板 → 模板名（首次注册的 type）
            if (!tpl.replace) {
                this.storage.tplRefs.set(tpl, type);
            }

            this.logger.debug(
                `Component registered: ${type} (with template)${tpl.replace ? ` replace from ${tpl.replace}` : ''}`
            );
        } else {
            const tplName = this._deriveTplName(componentClass);

            if (existing?.tpl) {
                existing.componentClass = componentClass;
            } else {
                this.storage.entries.set(type, {
                    name: type,
                    componentClass,
                    tplName,
                });
            }

            this.logger.debug(
                `Component registered: ${type} (no template${tplName ? `, tplName → ${tplName}` : ''})`
            );
        }
    }

    /**
     * 沿原型链推导模板名
     *
     * 从 componentClass 的父类开始，逐级查找已注册的祖先类 type，
     * 返回其 tplName（或 type 本身）。
     */
    private _deriveTplName(
        componentClass: new (props?: Record<string, any>) => any
    ): string | undefined {
        let current = Object.getPrototypeOf(componentClass);
        while (current && current !== Function.prototype) {
            const parentType =
                (current as any).type ?? (current as any).name?.replace(/Component$/, '');
            if (parentType && this.storage.entries.has(parentType)) {
                // 返回父类的 tplName（如果父类是共享模板的组件，继续推导）
                const parentEntry = this.storage.entries.get(parentType)!;
                return parentEntry.tplName ?? parentType;
            }
            current = Object.getPrototypeOf(current);
        }
        return undefined;
    }

    /**
     * 获取组件类
     *
     * @param type - 组件类型标识
     * @returns 组件类，未找到返回 undefined
     */
    get(type: string): (new (props?: Record<string, any>) => any) | undefined {
        return this.storage.entries.get(type)?.componentClass;
    }

    /**
     * 获取编译产物
     *
     * 直接用 tplName 查找存储 tpl 的 entry，懒编译并返回。
     * 无需递归链，O(1) 查找 + 首次编译。
     *
     * @param type - 组件类型标识
     * @returns 编译产物，未找到返回 undefined
     */
    getCompiled(type: string): CompiledProduct | undefined {
        const entry = this.storage.entries.get(type);
        this.logger.info('getCompiled', type, entry);
        if (!entry) return undefined;

        // 已缓存 → 直接返回
        if (entry.compiled) return entry.compiled;

        // 有自己的模板 → 编译并缓存
        if (entry.tpl) {
            const { cache, nodeMetas } = CompileEngine.compile(entry.tpl, entry.componentClass);
            entry.compiled = { cache, nodeMetas };
            return entry.compiled;
        }

        if (entry.tplName) {
            const tplEntry = this.storage.entries.get(entry.tplName);
            this.logger.info('tplName', tplEntry);
            if (tplEntry?.tpl) {
                if (!tplEntry.compiled) {
                    const { cache, nodeMetas } = CompileEngine.compile(
                        tplEntry.tpl,
                        tplEntry.componentClass
                    );
                    tplEntry.compiled = { cache, nodeMetas };
                }

                entry.compiled = tplEntry.compiled;
                this.logger.info('compiled', entry.compiled);
                return entry.compiled;
            }
        }

        return undefined;
    }

    /**
     * 创建节点映射管理器
     *
     * @param type - 组件类型标识
     * @param owner - 可选的宿主对象，通常是组件实例
     * @returns NodeMapManager 实例，如果模板不存在返回 undefined
     */
    createNodeMapManager(type: string, owner?: any): INodeMapManager | undefined {
        const compiled = this.getCompiled(type);
        if (!compiled) return undefined;
        return new NodeMapManager(compiled.cache, compiled.nodeMetas, owner);
    }

    /**
     * 注销
     */
    unregister(id: string): void {
        const entry = this.storage.entries.get(id);
        if (entry?.tpl) {
            const refType = this.storage.tplRefs.get(entry.tpl);
            if (refType === id) {
                this.storage.tplRefs.delete(entry.tpl);
            }
        }
        this.storage.entries.delete(id);
    }

    /**
     * 检查是否存在
     */
    has(name: string): boolean {
        return this.storage.entries.has(name);
    }

    /**
     * 获取所有已注册名称
     */
    names(): string[] {
        return Array.from(this.storage.entries.keys());
    }

    /**
     * 获取模板引用表（模板对象 → 模板名）
     */
    templateRefs(): Map<TplNode, string> {
        return this.storage.tplRefs;
    }

    /**
     * 清空所有注册
     */
    clear(): void {
        this.storage.entries.clear();
        this.storage.tplRefs.clear();
    }

    /**
     * 获取模板替换关系图
     */
    replaceGraph(): Map<string, string | undefined> {
        const graph = new Map<string, string | undefined>();
        for (const [name, entry] of this.storage.entries) {
            graph.set(name, entry.replaceFrom);
        }
        return graph;
    }

    protected doInspect(): void {
        const entries = Array.from(this.storage.entries.entries());
        const tplRefCount = this.storage.tplRefs.size;
        console.log(`  Components: ${entries.length}, Template refs: ${tplRefCount}`);
        console.log('');
        for (const [name, entry] of entries) {
            const replaceInfo = entry.replaceFrom ? ` ← replace from ${entry.replaceFrom}` : '';
            const tplNameInfo =
                entry.tplName && entry.tplName !== name ? ` → tplName ${entry.tplName}` : '';
            const isTplOwner = entry.tpl && this.storage.tplRefs.get(entry.tpl) === name;
            const ownerTag = isTplOwner ? ' 👑' : '';
            console.log(`  📄 ${name}${replaceInfo}${tplNameInfo}${ownerTag}`);
            if (entry.componentClass) {
                console.log(`     class: ${entry.componentClass.name}`);
            }
            if (entry.compiled) {
                const nodeCount = Object.keys(entry.compiled.nodeMetas).length;
                console.log(`     compiled: nodes=${nodeCount}`);
            } else if (entry.tpl) {
                console.log(`     compiled: (not yet)`);
            } else {
                console.log(`     compiled: (inherited)`);
            }
            if (entry.tpl) {
                TplInspector.printTree(entry.tpl, 2);
            }
        }
    }

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

    private applyReplaces(parentTpl: TplNode, replaces: Record<string, any>): TplNode {
        const cloned = clone(parentTpl);
        for (const [name, replacement] of Object.entries(replaces)) {
            this.walkAndApply(cloned, name, replacement);
        }
        return cloned;
    }
}
