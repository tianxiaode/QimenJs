/**
 * template-json 类型定义
 */

import type { NodeIndexPath, NodeTemplateMeta } from './index';
import type { ContentInfo, DomEventBinding } from './template';

export interface CompiledTemplateResult {
    html: string;
    indexPath: NodeIndexPath;
    templateMetas: Record<string, NodeTemplateMeta>;
    contentPropNames: string[];
    contentInfos: ContentInfo[];
    componentMap: Record<string, new (props?: Record<string, any>) => any>;
    domEventBindings: DomEventBinding[];
    rootClassName?: string;
    rootStyle?: string | Record<string, any>;
    rootLayout?: 'hbox' | 'vbox' | 'fit' | 'grid' | 'center';
    rootGap?: number | string;
    rootAlign?: 'start' | 'center' | 'end' | 'stretch';
    rootPack?: 'start' | 'center' | 'end' | 'between' | 'around';
    rootWrap?: boolean;
    exposeNames: string[];
    propsDef?: Record<string, any>;
}

export interface CompiledComponentTemplate extends CompiledTemplateResult {
    templateCache: HTMLTemplateElement;
    body?: Record<string, any>;
}
