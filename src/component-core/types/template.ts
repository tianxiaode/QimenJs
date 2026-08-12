import {
    Attributes,
    AttributesMap,
    I18nOptionsMap,
    NodeIndexPath,
    PermissionOptionsMap,
} from './base';
import { NodeMetaMap, NodeOptions } from './core';

export interface SplitOptionsResult {
    attributes: Attributes;
    options: NodeOptions;
}

export interface TemplateCache {
    /** 生成的 HTML 字符串 */
    html?: string;
    /** 命名节点的 DOM 位置索引 */
    indexPath: NodeIndexPath;
    /** 暴露的属性名列表（用于生成 getter/setter） */
    exposeNames: string[];
    /** i18n 节点列表（含字段名，用于 locale change 时精确刷新） */
    i18nMap: I18nOptionsMap;
    /** 模板缓存 */
    templateCache?: HTMLTemplateElement;
    /** 权限节点列表 */
    permissionMap: PermissionOptionsMap;
    nodeMetaMap: NodeMetaMap;
    atttributesMap: AttributesMap;
}
