/**
 * template.ts — 模板类型统一出口
 *
 * 所有模板相关类型从 tpl-node-types.ts 统一导出，
 * 本文件仅做 re-export，保持向后兼容。
 */

export type {
    DomEventDecl,
    FlexConfig,
    GridConfig,
    HiddenMode,
    TplNode,
    ComponentTemplate,
    ContentInfo,
    DomEventBinding,
    NodePropDef,
    NodePropMap,
} from './tpl-node-types';
