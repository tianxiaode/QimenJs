import type { TplNode } from './tpl-node-types';
import type { NodeMetadata } from './compiled-types';

export interface CompiledProduct {
    cache: any;
    nodeMetas: Record<string, NodeMetadata>;
}

export interface TemplateEntry {
    name: string;
    tpl: TplNode;
    compiled?: CompiledProduct;
    replaceFrom?: string;
}
