/**
 * TplNode 类型定义 — 模板节点的完整类型系统
 *
 * 本文件是 TplNode 相关所有类型的唯一定义源，
 * 与 tpl-node-def.ts（字段定义常量）配合使用。
 *
 * 详细设计说明见 tpl-node-def.ts 顶部注释。
 */

// ══════════════════════════════════════════════════════════════
// 事件声明
// ══════════════════════════════════════════════════════════════

/**
 * 单个 DOM 事件声明（发布端）
 *
 * TplNode 的 events 是【发布端】，声明节点会发出什么事件；
 * body 的 listens 是【订阅端】，声明组件监听什么事件。一出进，不应混谈。
 *
 * @example
 * ```ts
 * events: {
 *     click: { handler: true, emits: ['click'] },
 *     input: { handler: 'onSearch', debounce: 300, emits: ['input'] },
 *     pointerdown: { drag: true },
 * }
 * ```
 */
export interface DomEventDecl {
    /**
     * 内部 handler 方法
     * - true: 自动推导 on{Name}{Event}（推荐）
     * - string: 显式指定方法名（不推荐，与钩子脱节）
     */
    handler?: boolean | string;

    /** 转发为组件事件，持有方通过 on(name, fn) 监听 */
    emits?: string[];

    /** 转发为桥接事件（通过 EventBridge 解耦转发） */
    bridges?: string[];

    /** 转发为实体操作，值为 mgr 方法名 */
    entities?: string;

    /** 转发为浮动层操作，值为 action 名（show/hide/toggle） */
    floats?: string[];

    /** handler 只执行一次 */
    once?: boolean;

    /** 防抖时间（毫秒），预定义包装函数 */
    debounce?: number;

    /** 节流时间（毫秒），预定义包装函数 */
    throttle?: number;

    /** 委托模式（原子化组件极少使用） */
    delegate?: boolean;

    /** 委托目标，与 delegate 配合 */
    delegateTarget?: string;
}

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

    // ─── event: 事件发布 ───

    /** DOM 事件声明（发布端），key 为事件名，value 为声明对象 */
    events?: Record<string, DomEventDecl>;

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
}
