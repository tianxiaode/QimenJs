/**
 * compiled-types.ts — 模板编译产物类型
 *
 * 核心结构：NodeMetadata — 节点级唯一运行时数据载体
 * 编译时产出 nodeMetas（TplNode 字段直接带入），
 * 运行时浅复制 + 挂 el/component 构建 nodeMap。
 */

import type { DomEventDecl, FlexConfig, GridConfig, HiddenMode } from './tpl-node-types';

// ══════════════════════════════════════════════════════════════
// 节点元数据 — 唯一运行时数据载体
// ══════════════════════════════════════════════════════════════

/**
 * NodeMetadata — 节点级唯一运行时数据载体
 *
 * 编译时：从 TplNode 直接构建 nodeMetas（el/component 为空）
 * 运行时：浅复制 nodeMetas + 挂 el/component → 构建 nodeMap
 *
 * 字段与 TplNode 几乎一一对应，无需中间转换类型：
 * - events 直接存 DomEventDecl，运行时按需推导 handler 名
 * - i18n → i18nKey（唯一重命名）
 * - componentClass 从 TplNode.type 解析
 */
export interface NodeMetadata {
    // ─── runtime：运行时附加 ───

    /** DOM 元素引用 */
    el?: HTMLElement;

    /** 子组件实例（渲染后填充） */
    component?: any;

    /** 子组件类引用（编译时从 TplNode.type 解析） */
    componentClass?: new (props?: Record<string, any>) => any;

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
    type?: string;

    // ─── event：事件声明（原始 DomEventDecl，运行时按需推导 handler） ───

    events?: Record<string, DomEventDecl>;

    // ─── layout：布局 ───

    flex?: boolean | FlexConfig;

    grid?: boolean | GridConfig;

    // ─── style：样式 ───

    cls?: string;

    style?: string | Record<string, any>;

    // ─── content：内容 ───

    /** 内容操作模式（按 tag 自动推导：div→html, input→value, img→src, a→link） */
    contentMode?: 'value' | 'src' | 'html' | 'link';

    /** i18n 翻译 key */
    i18nKey?: string;

    // ─── state：状态 ───

    hidden?: boolean;

    hiddenMode?: HiddenMode;

    // ─── dom：DOM 属性 ───

    role?: string;

    attrs?: Record<string, string>;

    // ─── component：组件专属 ───

    initConfig?: Record<string, any>;
}

// ══════════════════════════════════════════════════════════════
// 编译产物
// ══════════════════════════════════════════════════════════════

/** 节点位置索引 — 记录命名节点在模板 DOM 树中的位置路径 */
export type NodeIndexPath = Record<string, number[]>;

/**
 * 编译产物 — compileTemplate() 的返回值
 *
 * nodeMetas 替代了原 contentInfos + domEventBindings + componentMap，
 * 所有节点级数据统一收归到 nodeMetas 中。
 */
export interface CompiledTemplateResult {
    /** 生成的 HTML 字符串 */
    html: string;

    /** 命名节点的 DOM 位置索引 */
    indexPath: NodeIndexPath;

    /** 节点元数据（编译时产出，运行时附加 el/component） */
    nodeMetas: Record<string, NodeMetadata>;

    /** 暴露的属性名列表（用于生成 getter/setter） */
    exposeNames: string[];
}

/**
 * 编译后的组件模板 — 编译产物 + 运行时缓存
 */
export interface CompiledComponentTemplate extends CompiledTemplateResult {
    /** HTMLTemplateElement 缓存，用于 cloneNode */
    templateCache: HTMLTemplateElement;

    /** 原始 body 定义 */
    body?: Record<string, any>;
}
