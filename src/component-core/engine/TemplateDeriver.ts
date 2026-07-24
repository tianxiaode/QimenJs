/**
 * TemplateDeriver — 模板替换引擎
 *
 * 纯函数引擎：从父类编译产物派生子类编译产物
 * 输入：parentCache, parentNodeMetas, nodeOverrides
 * 输出：{ cache: 同引用, nodeMetas: clone+修改 }
 *
 * cache 直接引用（只读共享），nodeMetas 深拷贝后修改（每类独立）
 */

import type { NodeMetadata, CompiledTemplateCache } from '../types/compiled-types';
import type { TplNode } from '../types/tpl-node-types';
import { TemplateCompiler } from './TemplateCompiler';

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

    static deriveFromTpl(
        parentCache: CompiledTemplateCache,
        parentNodeMetas: Record<string, NodeMetadata> | undefined,
        newTpl: TplNode,
        owner?: any
    ): DeriveResult {
        // 新模板完全替换父模板，忽略 parentCache/parentNodeMetas
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
}
