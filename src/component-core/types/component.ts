import type { TplDecl } from './tpl';
import { INodeMapManager } from './node-map-manager';
import { IComponentCore } from './core';

/**
 * 组件选项（平铺模式）
 *
 * 开发者直接 new 组件时使用
 */
export interface ComponentOptions extends Partial<TplDecl> {
    /** 组件 ID */
    id?: string;
    /** 父组件引用 */
    parent?: IComponentBase;
    /** 父组件插槽名称 */
    slotName?: string;
    /** 要挂载的容器节点 */
    container?: HTMLElement;
    /** DOM 属性（data-*、aria-* 等） */
    [key: string]: any;
}

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
