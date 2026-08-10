import type { TplDecl } from './tpl';
import { INodeMapManager } from './node-map-manager';
import { ComponentCoreOptions, IComponentCore } from './core';

/**
 * 组件选项（平铺模式）
 *
 * 开发者直接 new 组件时使用
 */
export interface ComponentOptions extends ComponentCoreOptions, Partial<TplDecl> {}

export interface IComponentBase extends IComponentCore {
    /** 组件节点管理器 */
    nodeMapMgr: INodeMapManager;
    /**
     * 模板根节点定义
     *
     * 定义组件的 DOM 骨架结构，包括标签、类名、子节点等。
     * 编译时递归遍历生成 HTML，运行时克隆模板构建 nodeMap。
     */
    get tpl(): TplDecl;

    /** 组件初始化选项（外部传入） */
    options: ComponentOptions;
}
