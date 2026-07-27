/**
 * compile-engine-types.ts — 编译引擎类型
 */

import type { NodeMetadata, CompiledTemplateCache } from '../../types/compiled-types';

export interface CompileResult {
    cache: CompiledTemplateCache;
    nodeMetas: Record<string, NodeMetadata>;
}
