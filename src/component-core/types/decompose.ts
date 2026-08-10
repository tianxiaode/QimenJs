import { AttrDecl, I18nDecl, PermissionDecl } from './declarations';
import { MetaDecl } from './meta';
import { TplDecl } from './tpl';

/** 拆解管线上下文 */
export interface DecomposeContext {
    /** 原始模板节点 */
    node?: TplDecl;
    /** 节点名称（可选） */
    name?: string;
    /** 浅克隆的节点配置 */
    clone: Record<string, any>;
    /** 节点元数据 */
    meta: MetaDecl;
    /** 节点html */
    html: string;
    /** 是否需要权限 */
    permission?: PermissionDecl;
    /** 是否是有 name 节点 */
    hasName: boolean;
    /** 是否是组件节点 */
    isComponent: boolean;
    /** i18n 配置集合 */
    i18n?: I18nDecl;
    /** 节点属性元数据 */
    attrDecl: AttrDecl;
}

/** 拆解步骤函数类型 */
export type DecomposeStep = (ctx: DecomposeContext) => void;
