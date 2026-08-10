import { ComponentClass, IComponentCore } from './core';
import { HiddenDecl, NodeOptionsDecl } from './declarations';

/**
 * NodeMetadata — 节点级唯一运行时数据载体
 *
 * 编译时：从 TplNode 直接构建 nodeMetas（el/component 为空）
 * 运行时：浅复制 nodeMetas + 挂 el/component → 构建 nodeMap
 *
 * 字段与 TplNode 几乎一一对应，无需中间转换类型：
 * - i18n → i18nKey（唯一重命名）
 * - componentClass 从 TplNode.type 解析

 *
 * @example
 * ```ts
 * // 编译时创建的 nodeMetas
 * const nodeMetas = {
 *     root: { name: 'root', tag: 'div', cls: 'q-button', flex: true },
 *     icon: { name: 'icon', tag: 'i', cls: 'q-button__icon', hidden: true },
 *     text: { name: 'text', tag: 'span', cls: 'q-button__text', i18nKey: 'button.submit' }
 * };
 *
 * // 运行时附加实例数据
 * nodeMetas.root.el = document.querySelector('.q-button');
 * nodeMetas.icon.el = document.querySelector('.q-button__icon');
 * nodeMetas.icon.component = iconComponent;  // 如果 icon 是组件节点
 * ```
 */
export interface MetaDecl extends HiddenDecl {
    // ─── runtime：运行时附加 ───

    /** DOM 元素引用 */
    el?: HTMLElement;

    /** 子组件实例（渲染后填充） */
    instance?: IComponentCore;

    /** 子组件类引用（编译时从 TplNode.type 解析） */
    ctor?: ComponentClass;

    /** 父元素引用（replace 模式定位用） */
    parentNode?: HTMLElement | null;

    /** 在父元素子节点列表中的位置索引 */
    nodeIndex?: number;

    /** 当前生效的属性快照，用于对比新旧值决定动画方向 */
    _state?: Record<string, any>;

    // ─── identity：节点标识 ───

    /** 节点名称 — nodeMap 索引键 */
    name: string;

    /** DOM 标签名 */
    tag?: string;

    /** 组件类型名 */
    type?: IComponentCore;

    /** 节点内容 */
    text?: string;

    /**

     * 语义动作名 — 从 TplNode.action 编译
     *
     * 节点声明的语义动作，事件触发时自动合并到事件数据中
     */
    action?: string;

    /** 内容操作模式（按 tag 自动推导：div→html, input→value, img→src, a→link） */
    contentMode?: 'value' | 'src' | 'html' | 'link';
    /**
     * 根节点：剔除html属性后的配置
     * 子组件：剔除父组件所需属性后的包含html属性的配置
     */
    nodeOptions?: NodeOptionsDecl;
}

export type MetaDeclMap = Record<string, MetaDecl>;
