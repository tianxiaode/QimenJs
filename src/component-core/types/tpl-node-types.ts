/**
 * TplNode 类型定义 — 模板节点的完整类型系统
 *
 * 本文件是 TplNode 相关所有类型的唯一定义源，
 * 与 tpl-node-def.ts（字段定义常量）配合使用。
 *
 * 详细设计说明见 tpl-node-def.ts 顶部注释。
 *
 * ══════════════════════════════════════════════════════════════
 * 双层架构下的 TplNode
 * ══════════════════════════════════════════════════════════════
 *
 * TplNode 定义模板结构，编译时产出预编译产物（HTML + nodeMetas + indexPath），
 * 挂在内部类（InnerComponent）上。闭包基类不直接处理 TplNode。
 *
 * 节点命名约定（Ability 与模板的契约）：
 *   - field   — 输入框本体（InputAbility 核心，必须）
 *   - label   — 标签文本
 *   - prefix  — 前缀
 *   - suffix  — 后缀
 *   - error   — 错误提示
 *   - hint    — 提示文本
 *   - eye     — 密码显示切换（PasswordAbility）
 *   - strength — 复杂度指示条（PasswordAbility）
 *
 * 不同模板的节点命名必须统一，Ability 通过显式配置（fieldNodeName 等）
 * 或约定命名访问节点，与具体模板结构解耦。
 */

// ══════════════════════════════════════════════════════════════
// 布局配置
// ══════════════════════════════════════════════════════════════

/** flex 布局配置 */
export interface FlexConfig {
    /** 方向，默认 'row' */
    direction?: 'row' | 'column';
    /** 间距，数字自动加 px */
    gap?: number | string;
    /** 交叉轴对齐 */
    align?: 'start' | 'center' | 'end' | 'stretch';
    /** 主轴分布 */
    pack?: 'start' | 'center' | 'end' | 'between' | 'around';
    /** 是否换行 */
    wrap?: boolean;
}

/** grid 布局配置 */
export interface GridConfig {
    /** 列数 */
    columns?: number;
    /** 间距，数字自动加 px */
    gap?: number | string;
}

// ══════════════════════════════════════════════════════════════
// 隐藏模式
// ══════════════════════════════════════════════════════════════

/**
 * 隐藏模式 — 控制 hidden 时的 DOM 表现
 *
 * - 'display': display: none（默认，不占空间）
 * - 'visibility': visibility: hidden（占空间但不可见）
 * - 'opacity': opacity: 0（不可见但可交互）
 */
export type HiddenMode = 'display' | 'visibility' | 'opacity';

// ══════════════════════════════════════════════════════════════
// 模板片段
// ══════════════════════════════════════════════════════════════

/**
 * 模板片段 — 可复用的节点定义集合
 *
 * 编译时内联展开为父节点的 children，不创建组件边界。
 * fragment.name 作为命名空间前缀，自动加到子节点 name 上，
 * 避免与父模板中的同名节点冲突。
 *
 * @example
 * ```ts
 * const HeaderFragment: TplFragment = {
 *     name: 'header',
 *     children: [
 *         { tag: 'i', name: 'icon', cls: 'q-header__icon', hidden: true },
 *         { tag: 'div', name: 'title', cls: 'q-header__title' },
 *         { name: 'action', type: ButtonComponent, cls: 'q-header__action', hidden: true },
 *     ],
 * };
 *
 * // 使用：fragment 的 children 展开到 div 内，name 自动变为 header:icon / header:title / header:action
 * { tag: 'div', cls: 'q-card__header', fragment: HeaderFragment }
 * ```
 */
export interface TplFragment {
    /** 片段名称，作为子节点 name 的命名空间前缀 */
    name: string;

    /** 子节点定义 */
    children: TplNode[];
}

// ══════════════════════════════════════════════════════════════
// 模板节点定义
// ══════════════════════════════════════════════════════════════

/**
 * 模板节点定义
 *
 * tag 和 type 互斥：tag 是 DOM 节点，type 是组件。
 * 详细设计说明见 tpl-node-def.ts。
 */
export interface TplNode {
    // ─── identity: 节点标识 ───

    /** DOM 标签名（如 div、span、input），与 type 互斥 */
    tag?: string;

    /** 组件类型名（如 ButtonComponent），与 tag 互斥 */
    type?: string;

    /** 节点名称 — nodeMap 索引键 + 自动属性生成 */
    name?: string;

    // ─── style: 样式 ───

    /** CSS 类名 */
    cls?: string;

    /** 内联样式（字符串或对象） */
    style?: string | Record<string, any>;

    // ─── layout: 布局（flex/grid 互斥） ───

    /** flex 布局，true 使用默认 row */
    flex?: boolean | FlexConfig;

    /** grid 布局，true 使用默认配置 */
    grid?: boolean | GridConfig;

    // ─── content: 内容 ───

    /** i18n 翻译 key */
    i18n?: string;

    // ─── dom: DOM 属性 ───

    /** ARIA role 属性 */
    role?: string;

    /** 其他静态 HTML 属性（aria-label、data-* 等），动态 aria 走 _setNodeProp */
    attrs?: Record<string, string>;

    // ─── state: 状态 ───

    /** 初始隐藏状态 */
    hidden?: boolean;

    /** 隐藏模式：'display' | 'visibility' | 'opacity' */
    hiddenMode?: HiddenMode;

    // ─── component: 组件专属 ───

    /** 子组件初始配置，传入构造函数 */
    initConfig?: Record<string, any>;

    // ─── children: 子节点 ───

    /** 子节点定义 */
    children?: TplNode[];

    // ─── fragment: 模板片段 ───

    /** 模板片段引用，编译时内联展开为 children，自动命名空间 */
    fragment?: TplFragment;

    // ─── template-level: 模板级声明（仅根节点使用）───

    /** 替换来源 — 声明本模板基于哪个已注册模板做替换 */
    replace?: string;

    /** 替换映射 — key=命名节点name, value=替换内容 */
    replaces?: Record<string, any>;
}
