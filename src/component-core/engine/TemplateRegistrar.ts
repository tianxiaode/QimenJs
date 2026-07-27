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
import type { TplNode } from '../types/tpl-node-types';
import type { TemplateEntry, CompiledProduct } from '../types/template-registrar';

interface TemplateStorage {
    entries: Map<string, TemplateEntry>;
}

export class TemplateRegistrar extends RegistrarBase<TemplateStorage> {
    public readonly name = 'template';

    protected storage: TemplateStorage = {
        entries: new Map(),
    };

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

    get(name: string): CompiledProduct | undefined {
        const entry = this.storage.entries.get(name);
        if (!entry) return undefined;

        if (entry.compiled) return entry.compiled;

        const { cache, nodeMetas } = CompileEngine.compile(entry.tpl);
        entry.compiled = { cache, nodeMetas };
        return entry.compiled;
    }

    unregister(id: string): void {
        this.checkLock();
        this.storage.entries.delete(id);
    }

    has(name: string): boolean {
        return this.storage.entries.has(name);
    }

    names(): string[] {
        return Array.from(this.storage.entries.keys());
    }

    replaceGraph(): Map<string, string | undefined> {
        const graph = new Map<string, string | undefined>();
        for (const [name, entry] of this.storage.entries) {
            graph.set(name, entry.replaceFrom);
        }
        return graph;
    }

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
