/**
 * 子组件管理能力接口
 *
 * 提供子组件的增删查改和布局渲染。
 * 按需声明，容器类组件通过 static abilities 引入。
 */

import type { LayoutNode } from '@qimenjs/layout';

export interface IChildrenAbility {
    /** 子组件列表 */
    readonly children: any[];

    /** 子组件数量 */
    readonly childCount: number;

    // ── 添加 ──

    /** 添加子组件 */
    addChild(child: any, index?: number): any;

    /** 批量添加子组件 */
    addChildren(children: any[], startIndex?: number): any;

    /** 在指定子组件前插入 */
    insertBefore(child: any, refChild: any): any;

    /**
     * 从 LayoutNode JSON 创建并挂载子组件
     *
     * 解析 Layout 定义，递归创建组件树。
     * 每层只负责自己的直接子节点，子的子由子自己负责。
     */
    add(layout: LayoutNode): any;

    // ── 移除 ──

    /** 移除并销毁子组件 */
    removeChild(child: any): any;

    /** 按索引移除子组件 */
    removeChildAt(index: number): any | undefined;

    /** 移除所有子组件 */
    removeAll(): any;

    // ── 替换与移动 ──

    /** 替换子组件 */
    replaceChild(oldChild: any, newChild: any): any;

    /** 移动子组件到新位置 */
    moveChild(child: any, newIndex: number): any;

    // ── 查询 ──

    /** 按索引获取子组件 */
    getChildAt(index: number): any | undefined;

    /** 按 id 获取子组件 */
    getChild(id: string): any | undefined;

    /** 按 type 查找第一个匹配的直接子组件 */
    queryChild(type: string): any;
}
