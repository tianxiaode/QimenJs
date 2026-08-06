/**
 * compiled-types.ts — 模板编译产物类型
 *
 * 核心结构：NodeMetadata — 节点级唯一运行时数据载体
 * 编译时产出 nodeMetas（TplNode 字段直接带入），
 * 运行时浅复制 + 挂 el/component 构建 nodeMap。
 */

import type {
    FlexConfig,
    GridConfig,
    HiddenMode,
    FloatDecl,
    DragDecl,
    DropDecl,
} from './tpl-node-types';
import type {
    BadgeQuickConfig,
    TooltipQuickConfig,
    DialogQuickConfig,
    PopoverQuickConfig,
    IndicatorConfig,
} from './init-context';

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

    // ─── event：事件声明（从 TplNode 编译） ───

    /**

     * 语义动作名 — 从 TplNode.action 编译
     *
     * 节点声明的语义动作，事件触发时自动合并到事件数据中
     */
    action?: string;

    /**
     * 节点级事件数据声明 — 从 TplNode.data 编译
     *
     * 节点声明的额外数据字段，事件触发时自动收集并合并到事件数据中。
     * 支持数组形式（所有事件共享）和对象形式（按事件类型区分）。
     *
     * @example
     * // 数组形式: ['name', 'getFormData']
     * // 对象形式: { emit: ['name'], entity: ['getEntityData'] }
     */
    data?: string[] | Record<string, string[]>;

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

    /** 权限声明（true=从 action 推导 / action / entity:action / domain:entity:action） */
    permission?: boolean | string;

    // ─── state：状态 ───

    hidden?: boolean;

    hiddenMode?: HiddenMode;

    // ─── dom：DOM 属性 ───

    role?: string;

    /**
     * DOM 原生属性
     *
     * 双重来源：
     * 1. TplNode.attrs — 编译时 copyMetaFields 直接带入（Record<string, string>）
     * 2. 编译引擎分类 — 剩余字段中不在 DEFAULT_NODE_PROP_MAP 的（Record<string, any>）
     *
     * 运行时通过 setAttribute 应用到 DOM 元素。
     */
    attrs?: Record<string, any>;

    // ─── component：组件专属 ───

    /** @deprecated 使用 props 替代 */
    initConfig?: Record<string, any>;

    /**
     * 子组件自定义属性 — 父组件在 TplNode 上写的非框架字段
     *
     * 编译时从 TplNode 剩余字段收集（排除 TPL_NODE_FIELDS 已知字段），
     * 运行时由 applyConfig 管线步骤处理：按 DEFAULT_NODE_PROP_MAP 分类为
     * htmlProps（应用到 DOM）和 customProps（触发组件 setter）。
     *
     * 仅 type 节点有此字段，tag 节点使用 htmlProps/attrs。
     */
    props?: Record<string, any>;

    /**
     * DOM 节点 HTML 属性 — 在 DEFAULT_NODE_PROP_MAP 中有映射的字段
     *
     * 编译时从 TplNode 剩余字段中按 DEFAULT_NODE_PROP_MAP 分类提取，
     * 运行时自动通过 _updateNode 应用到 DOM 元素。
     *
     * 仅 tag 节点有此字段，type 节点使用 props。
     */
    htmlProps?: Record<string, any>;

    // ─── behavior: 行为配置（浮层/拖拽/放置/动画） ───

    /** 浮层标记 — 声明此节点是浮层锚点 */
    float?: boolean | FloatDecl;

    /** 拖拽标记 — 声明此节点是拖拽手柄 */
    drag?: boolean | DragDecl;

    /** 放置区标记 — 声明此节点是放置目标 */
    drop?: boolean | DropDecl;

    /** 动画配置 — 声明此节点的进入/离开动画 */
    animation?: Record<string, any>;

    // ─── float-shorthand: 浮层快捷配置（float 的语法糖） ───

    /**
     * 角标配置 — 节点级 badge 声明
     *
     * badge 不走浮动引擎，而是在 buildDOM 后由 NodeMapManager 创建绝对定位 DOM，
     * 注册为 `{nodeName}:badge` 节点，可通过 CommonPropsAbility 操作。
     *
     * @example
     * { name: 'icon', badge: '3' }
     * { name: 'icon', badge: { text: 'New', visible: false } }
     */
    badge?: BadgeQuickConfig | string | number | null;

    /** 提示浮层快捷配置 */
    tooltip?: TooltipQuickConfig | string | null;

    /** 对话框浮层快捷配置 */
    dialog?: DialogQuickConfig | null;

    /** 弹出层浮层快捷配置 */
    popover?: PopoverQuickConfig | null;

    // ─── drag-drop-shorthand: 拖拽/放置快捷标记 ───

    /** 拖拽手柄标记 — 声明此节点是组件的拖拽手柄 */
    dragHandle?: boolean;

    /** 放置区标记 — 声明此节点是组件的放置目标 */
    dropZone?: boolean;

    // ─── itemgroup: ItemGroup 专属配置 ───

    /** 指示器配置 — 仅 ItemGroup 类型组件可用 */
    indicator?: IndicatorConfig | null;
}

// ══════════════════════════════════════════════════════════════
// 编译产物
// ══════════════════════════════════════════════════════════════

/**
 * 节点位置索引 — 记录命名节点在模板 DOM 树中的位置路径
 *
 * key 为节点 name，value 为从根节点到该节点的子节点索引路径。
 * 用于运行时快速定位节点元素，避免每次查询。
 *
 * @example
 * ```ts
 * const indexPath: NodeIndexPath = {
 *     'root': [],                    // 根节点，路径为空
 *     'header': [0],                 // 第一个子节点
 *     'title': [0, 1],               // header 的第二个子节点
 *     'content': [1],                // 第二个子节点
 *     'footer': [2, 0, 1]            // footer 的第一个子节点的第二个子节点
 * };
 *
 * // 使用 indexPath 定位节点
 * function locateNode(template: HTMLTemplateElement, indexPath: number[]): HTMLElement {
 *     let current = template.content.firstChild;
 *     for (const index of indexPath) {
 *         current = current.childNodes[index];
 *     }
 *     return current as HTMLElement;
 * }
 * ```
 */
export type NodeIndexPath = Record<string, number[]>;

/**
 * 编译产物 — compileTemplate() 的返回值
 *
 * nodeMetas 替代了原 contentInfos + domEventBindings + componentMap，
 * 所有节点级数据统一收归到 nodeMetas 中。
 *
 * @example
 * ```ts
 * const result: CompiledTemplateResult = compileTemplate(BUTTON_TEMPLATE);
 *
 * // 访问编译产物
 * console.log(result.html);              // "<div class='q-button'>...</div>"
 * console.log(result.indexPath);         // { root: [], icon: [0], text: [1] }
 * console.log(result.nodeMetas.root);    // { name: 'root', tag: 'div', ... }
 * console.log(result.exposeNames);       // ['title', 'disabled', 'onClick']
 * console.log(result.i18nNodes);         // [{ name: 'text', i18nKey: 'button.submit' }]
 * ```
 *
 * @see compileTemplate - 编译函数
 * @see CompiledTemplateCache - 可共享的缓存部分
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

    /** i18n 节点列表（含字段名，用于 locale change 时精确刷新） */
    i18nNodes: Array<{ name: string; field?: string; i18nKey: string }>;

    /** 权限节点列表 */
    permissionNodes: Array<{ name: string; permission: boolean | string }>;
}

/**
 * 编译缓存 — 可共享的只读部分
 *
 * 包含编译产物中不可变、可安全跨类共享的部分：
 * - html: HTML 模板字符串
 * - indexPath: 节点位置索引
 * - exposeNames: 暴露的属性名列表
 * - i18nNodes: i18n 节点列表
 * - templateCache: HTMLTemplateElement 缓存（只读 cloneNode 源）
 *
 * nodeMetas 不属于此缓存，因为它会被 body 修改。
 * 多个组件实例可以共享同一个 CompiledTemplateCache，但各自维护独立的 nodeMetas。
 *
 * @example
 * ```ts
 * // 多个按钮实例共享同一个缓存
 * const cache: CompiledTemplateCache = compileTemplate(BUTTON_TEMPLATE).cache;
 *
 * const button1 = new ButtonComponent({ ... });
 * const button2 = new ButtonComponent({ ... });
 * // button1 和 button2 共享 cache，但各自有独立的 nodeMetas
 *
 * // 克隆模板
 * const fragment = cache.templateCache.content.cloneNode(true);
 * ```
 */
export interface CompiledTemplateCache {
    html: string;
    indexPath: NodeIndexPath;
    exposeNames: string[];
    i18nNodes: Array<{ name: string; field?: string; i18nKey: string }>;
    permissionNodes: Array<{ name: string; permission: boolean | string }>;
    templateCache: HTMLTemplateElement;
}

/**
 * 编译后的组件模板 — 保留兼容，内部使用 CompiledTemplateCache
 *
 * @deprecated 直接使用 CompiledTemplateCache + 独立的 nodeMetas
 */
export interface CompiledComponentTemplate extends CompiledTemplateResult {
    /** HTMLTemplateElement 缓存，用于 cloneNode */
    templateCache: HTMLTemplateElement;

    /** 原始 body 定义 */
    body?: Record<string, any>;
}
