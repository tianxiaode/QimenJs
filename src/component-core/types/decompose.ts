import { NodeI18nConfig } from './i18n';
import { NodeAttributes, NodeMetadata } from './node';
import { PermissionDef } from './permission';
import { TplNode } from './tpl-node-types';

/** 拆解管线上下文 */
export interface DecomposeContext {
    /** 原始模板节点 */
    node?: TplNode;
    /** 节点名称（可选） */
    name?: string;
    /** 浅克隆的节点配置 */
    clone: Record<string, any>;
    /** 节点元数据 */
    meta: NodeMetadata;
    /** 节点html */
    html: string;
    /** 是否需要权限 */
    permission?: PermissionDef;
    /** 是否是有 name 节点 */
    hasName: boolean;
    /** 是否是组件节点 */
    isComponent: boolean;
    /** i18n 配置集合 */
    i18n?: NodeI18nConfig;
    /** 节点属性元数据 */
    nodeAttributes: NodeAttributes;
    /** 子组件属性集合 */
    options: Record<string, any>;
}

/** 拆解步骤函数类型 */
export type DecomposeStep = (ctx: DecomposeContext) => void;
