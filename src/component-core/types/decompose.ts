import { AttrDecl, TplCoreDecl } from './declarations';
import { TplDecl } from './tpl';

/** 拆解管线上下文 */
export interface DecomposeContext extends TplCoreDecl {
    /** 原始模板节点 */
    node: TplDecl;
    /** 浅克隆的节点配置 */
    clone: Record<string, any>;
    /** 组件核心配置key集合，通过get optionKeys返回 */
    coreKeys?: Set<string>;
    /** 节点html */
    html: string;
    /** 是否是有 name 节点 */
    hasName: boolean;
    /** 是否是组件节点 */
    isComponent: boolean;
    /** 节点html属性集合 */
    attrDecl: AttrDecl;
    /** 节点配置集合 */
    nodeOptions: Record<string, any>;
}

export type DecomposeResult = Omit<DecomposeContext, 'node' | 'clone'>;

export interface DecomposeComponentOptionsResult {
    attrDecl: AttrDecl;
    options: Record<string, any>;
}

/** 拆解步骤函数类型 */
export type DecomposeStep = (ctx: DecomposeContext) => void;

export type DecomposeResultMap = Record<string, DecomposeResult>;
