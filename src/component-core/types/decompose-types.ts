import { NodeMetadata } from './compiled-types';
import { TplNode } from './tpl-node-types';

/** 拆解管线上下文 */
export interface DecomposeContext {
    /** 原始模板节点 */
    node: TplNode;
    /** 节点名称（可选） */
    name?: string;
    /** 浅克隆的节点配置 */
    clone: Record<string, any>;
    /** 节点元数据 */
    meta: NodeMetadata;
    /** 节点html */
    html: string;
    /** i18n 键集合 */
    i18nKeys: Array<{ field?: string; i18nKey: string }>;
    /** 是否需要权限 */
    hasPermission: boolean;
    /** 是否是有 name 节点 */
    hasName: boolean;
    /** 是否是组件节点 */
    isComponent: boolean;
}

/** 拆解步骤函数类型 */
export type DecomposeStep = (ctx: DecomposeContext) => void;
