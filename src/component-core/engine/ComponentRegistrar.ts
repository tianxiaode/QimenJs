/**
 * TemplateRegistrar — 组件注册器（统一管理组件类 + 模板）
 *
 * 核心职能：
 *   1. register(ComponentClass, tpl?) — 注册组件定义 + 可选模板
 *   2. get(type) — 返回组件类
 *   3. getCompiled(type) — 返回编译产物（懒编译）
 *   4. createNodeMapManager(type, owner) — 创建节点映射管理器
 *
 * 无模板组件：沿原型链推导，templateRef 指向祖先类的 type，
 * 获取编译产物时解析 templateRef 链直到找到编译产物。
 *
 * @example
 * ```ts
 * const registry = TemplateRegistrar.getInstance();
 * registry.register(ButtonComponent, BUTTON_TPL);  // 有模板
 * registry.register(TabBarComponent);               // 无模板，推导到父类
 *
 * const BtnClass = registry.get('Button');           // 获取组件类
 * const compiled = registry.getCompiled('Button');   // 获取编译产物
 * ```
 */

import { RegistrarBase } from '@/registry/registrars/RegistrarBase';
import { CompileEngine } from './CompileEngine';
import { TplInspector } from './TplInspector';
import { clone } from '@/utils/object/clone';
import { NodeMapManager } from '../NodeMapManager';
import type { TplNode } from '../types/tpl-node-types';
import type { ComponentEntry, CompiledProduct } from '../types/template-registrar';
import type { INodeMapManager } from '../types/node-map-manager-types';

interface ComponentStorage {
    entries: Map<string, ComponentEntry>;
}

export class ComponentRegistrar extends RegistrarBase<ComponentStorage> {
    public readonly name = 'component';

    protected storage: ComponentStorage = {
        entries: new Map(),
    };

    /**
     * 注册组件
     *
     * @param componentClass - 组件类（必须有 static getter type）
     * @param tpl - 可选模板定义，不提供则沿原型链推导
     *
     * @example
     * ```ts
     * registry.register(ButtonComponent, BUTTON_TPL);  // 有独立模板
     * registry.register(TabBarComponent);               // 继承父类模板
     * ```
     */
    register(componentClass: new (props?: Record<string, any>) => any, tpl?: TplNode): void {
        this.checkLock();

        const type: string = (componentClass as any).type
            ?? (componentClass as any).name?.replace(/Component$/, '');
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

            if (existing) {
                existing.tpl = resolvedTpl;
                existing.componentClass = componentClass;
                existing.replaceFrom = tpl.replace;
                delete existing.templateRef;
            } else {
                this.storage.entries.set(type, {
                    name: type,
                    tpl: resolvedTpl,
                    componentClass,
                    replaceFrom: tpl.replace,
                });
            }

            this.logger.debug(
                `Component registered: ${type} (with template)${tpl.replace ? ` replace from ${tpl.replace}` : ''}`
            );
        } else {
            const templateRef = this._deriveTemplateRef(componentClass);

            if (existing?.tpl) {
                existing.componentClass = componentClass;
            } else {
                this.storage.entries.set(type, {
                    name: type,
                    componentClass,
                    templateRef,
                });
            }

            this.logger.debug(
                `Component registered: ${type} (no template${templateRef ? `, ref → ${templateRef}` : ''})`
            );
        }
    }

    /**
     * 沿原型链推导模板引用
     *
     * 从 componentClass 的父类开始，逐级查找已注册的祖先类 type
     */
    private _deriveTemplateRef(
        componentClass: new (props?: Record<string, any>) => any
    ): string | undefined {
        let current = Object.getPrototypeOf(componentClass);
        while (current && current !== Function.prototype) {
            const parentType = (current as any).type
                ?? (current as any).name?.replace(/Component$/, '');
            if (parentType && this.storage.entries.has(parentType)) {
                return parentType;
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
     * 解析 templateRef 链，直到找到有 tpl 的条目，懒编译并返回。
     *
     * @param type - 组件类型标识
     * @returns 编译产物，未找到返回 undefined
     */
    getCompiled(type: string): CompiledProduct | undefined {
        const entry = this.storage.entries.get(type);
        if (!entry) return undefined;

        if (entry.compiled) return entry.compiled;

        if (entry.tpl) {
            const { cache, nodeMetas } = CompileEngine.compile(entry.tpl);
            entry.compiled = { cache, nodeMetas };
            return entry.compiled;
        }

        if (entry.templateRef) {
            return this.getCompiled(entry.templateRef);
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
        this.checkLock();
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
     * 清空所有注册
     */
    clear(): void {
        this.checkLock();
        this.storage.entries.clear();
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
        console.log(`  Components: ${entries.length}`);
        console.log('');
        for (const [name, entry] of entries) {
            const replaceInfo = entry.replaceFrom ? ` ← replace from ${entry.replaceFrom}` : '';
            const refInfo = entry.templateRef ? ` → ref ${entry.templateRef}` : '';
            console.log(`  📄 ${name}${replaceInfo}${refInfo}`);
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
