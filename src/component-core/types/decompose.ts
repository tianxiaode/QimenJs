import { AttrDecl, TplCoreDecl, I18nDecl, PermissionDecl } from './declarations';
import { TplDecl } from './tpl';

export interface DecomposeMetaDecl {}

/** 拆解管线上下文 */
export interface DecomposeContext extends TplCoreDecl {
    /** 原始模板节点 */
    node?: TplDecl;
    /** 浅克隆的节点配置 */
    clone: Record<string, any>;
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
    nodeOptions: Record<string, any>;
}

export interface DecomposeComponentOptionsResult {
    attrDecl: AttrDecl;
    options: Record<string, any>;
}

/** 拆解步骤函数类型 */
export type DecomposeStep = (ctx: DecomposeContext) => void;
