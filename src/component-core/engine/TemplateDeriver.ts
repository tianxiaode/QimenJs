/**
 * TemplateDeriver — 模板替换引擎
 *
 * 纯函数引擎：从父类编译产物派生子类编译产物
 *
 * 三种派生模式：
 *   1. derive()            — 属性覆盖（nodeOverrides），cache 同引用
 *   2. deriveWithTplReplaces() — 模板子树替换，产出新 cache
 *   3. deriveFromTpl()     — 完全替换模板
 */

import type { NodeMetadata, NodeIndexPath, CompiledTemplateCache } from '../types/compiled-types';
import type { TplNode } from '../types/tpl-node-types';
import { TemplateCompiler, findByPath, expandFragments, compileSubtree } from './TemplateCompiler';

export interface DeriveResult {
    cache: CompiledTemplateCache;
    nodeMetas: Record<string, NodeMetadata>;
}

export class TemplateDeriver {
    static derive(
        parentCache: CompiledTemplateCache,
        parentNodeMetas: Record<string, NodeMetadata> | undefined,
        nodeOverrides?: Record<string, Record<string, any>>
    ): DeriveResult {
        const clonedNodeMetas = TemplateDeriver._cloneNodeMetas(parentNodeMetas);

        if (nodeOverrides && Object.keys(nodeOverrides).length > 0) {
            TemplateDeriver._applyNodeOverrides(clonedNodeMetas, nodeOverrides);
        }

        return {
            cache: parentCache,
            nodeMetas: clonedNodeMetas,
        };
    }

    /**
     * 模板子树替换派生 — 替换父模板中指定节点的 DOM 子树
     *
     * 约定：
     * - tplReplaces 的 key 是父模板中已命名节点的 name
     * - value 是替换该节点的 TplNode（单个父节点，可带 children）
     * - 替换节点的父 indexPath 不变，子节点 = 父 path + 子索引
     * - 产出新的 CompiledTemplateCache，不影响父类共享的 cache
     *
     * @example
     * ```ts
     * // BaseCell 模板中有 { tag:'div', name:'content' }
     * // TreeCell 替换 content 为带 toggle + text 的子树
     * deriveWithTplReplaces(parentCache, parentNodeMetas, {
     *     content: {
     *         tag: 'div', cls: 'q-cell--tree', children: [
     *             { tag: 'span', name: 'toggle', cls: 'q-cell__toggle' },
     *             { tag: 'span', name: 'text', cls: 'q-cell__text' },
     *         ]
     *     }
     * })
     * ```
     */
    static deriveWithTplReplaces(
        parentCache: CompiledTemplateCache,
        parentNodeMetas: Record<string, NodeMetadata> | undefined,
        tplReplaces: Record<string, TplNode>,
        nodeOverrides?: Record<string, Record<string, any>>,
        owner?: any
    ): DeriveResult {
        const clonedTemplate = parentCache.templateCache.cloneNode(true) as HTMLTemplateElement;
        const clonedIndexPath: NodeIndexPath = { ...parentCache.indexPath };
        const clonedNodeMetas = TemplateDeriver._cloneNodeMetas(parentNodeMetas);
        const newExposeNames: string[] = [...parentCache.exposeNames];
        const newI18nNodes: Array<{ name: string; i18nKey: string }> = [...parentCache.i18nNodes];

        for (const [nodeName, replacementTpl] of Object.entries(tplReplaces)) {
            const originalPath = parentCache.indexPath[nodeName];
            if (!originalPath) continue;

            const originalEl = findByPath(
                clonedTemplate.content as unknown as HTMLElement,
                originalPath
            );
            if (!originalEl) continue;

            const expanded = expandFragments(replacementTpl);

            const compiled = compileSubtree(expanded, { warn: () => {} });

            const tmpEl = document.createElement('template');
            tmpEl.innerHTML = compiled.html;
            const newEl = tmpEl.content.firstChild as HTMLElement;
            if (!newEl) continue;

            originalEl.replaceWith(newEl);

            TemplateDeriver._removeNodeEntries(
                nodeName,
                originalPath,
                clonedIndexPath,
                clonedNodeMetas,
                newExposeNames
            );

            TemplateDeriver._mergeCompiledSubtree(
                originalPath,
                compiled,
                clonedIndexPath,
                clonedNodeMetas,
                newExposeNames,
                newI18nNodes
            );
        }

        if (nodeOverrides && Object.keys(nodeOverrides).length > 0) {
            TemplateDeriver._applyNodeOverrides(clonedNodeMetas, nodeOverrides);
        }

        const newCache: CompiledTemplateCache = {
            html: clonedTemplate.innerHTML,
            indexPath: clonedIndexPath,
            exposeNames: newExposeNames,
            i18nNodes: newI18nNodes,
            templateCache: clonedTemplate,
        };

        return {
            cache: newCache,
            nodeMetas: clonedNodeMetas,
        };
    }

    static deriveFromTpl(
        parentCache: CompiledTemplateCache,
        parentNodeMetas: Record<string, NodeMetadata> | undefined,
        newTpl: TplNode,
        owner?: any
    ): DeriveResult {
        return TemplateCompiler.compile(newTpl, owner);
    }

    private static _cloneNodeMetas(
        nodeMetas: Record<string, NodeMetadata> | undefined
    ): Record<string, NodeMetadata> {
        if (!nodeMetas) return {};
        const result: Record<string, NodeMetadata> = {};
        for (const [key, meta] of Object.entries(nodeMetas)) {
            result[key] = { ...meta };
        }
        return result;
    }

    private static _applyNodeOverrides(
        nodeMetas: Record<string, NodeMetadata>,
        nodeOverrides: Record<string, Record<string, any>>
    ): void {
        for (const [nodeName, override] of Object.entries(nodeOverrides)) {
            const meta = nodeMetas[nodeName];
            if (!meta) continue;

            if (override.type !== undefined) {
                if (typeof override.type === 'function') {
                    meta.componentClass = override.type;
                } else if (typeof override.type === 'string') {
                    meta.componentClass = (window as any)[override.type];
                }
            }

            if (override.initConfig !== undefined) {
                meta.initConfig = { ...(meta.initConfig ?? {}), ...override.initConfig };
            }
        }
    }

    private static _removeNodeEntries(
        nodeName: string,
        nodePath: number[],
        indexPath: NodeIndexPath,
        nodeMetas: Record<string, NodeMetadata>,
        exposeNames: string[]
    ): void {
        const prefix = nodePath.join(',');

        for (const [name, path] of Object.entries(indexPath)) {
            if (name === nodeName || path.join(',').startsWith(prefix + ',')) {
                delete indexPath[name];
                delete nodeMetas[name];
                const idx = exposeNames.indexOf(name);
                if (idx !== -1) exposeNames.splice(idx, 1);
            }
        }
    }

    private static _mergeCompiledSubtree(
        originalPath: number[],
        compiled: {
            indexPath: NodeIndexPath;
            nodeMetas: Record<string, NodeMetadata>;
            exposeNames: string[];
            i18nNodes: Array<{ name: string; i18nKey: string }>;
        },
        targetIndexPath: NodeIndexPath,
        targetNodeMetas: Record<string, NodeMetadata>,
        targetExposeNames: string[],
        targetI18nNodes: Array<{ name: string; i18nKey: string }>
    ): void {
        for (const [name, path] of Object.entries(compiled.indexPath)) {
            const adjustedPath = [...originalPath, ...path];
            targetIndexPath[name] = adjustedPath;

            const meta = compiled.nodeMetas[name];
            if (meta) {
                targetNodeMetas[name] = { ...meta };
                targetExposeNames.push(name);
            }
        }

        for (const i18nNode of compiled.i18nNodes) {
            targetI18nNodes.push(i18nNode);
        }
    }
}
