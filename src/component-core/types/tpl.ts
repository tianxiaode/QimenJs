import { extend } from 'zod/v4/core/util.cjs';
import { AnimationDecl } from './animation';
import { IComponentBase } from './component';
import { DragDecl, DropDecl } from './drag-drop';
import { HiddenDecl, HiddenMode } from './hidden';
import { I18nDecl } from './i18n';

import { PermissionDecl } from './permission';
import { AttrDecl } from './attributes';

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
// 模板节点定义
// ══════════════════════════════════════════════════════════════

/**
 * 模板节点定义
 *
 * tag 和 type 互斥：tag 是 DOM 节点，type 是组件。
 * 详细设计说明见 tpl-node-def.ts。
 */
export interface TplDecl<
    TI18n,
    Tpermission,
    TDrag,
    TDrop,
    TAnimation,
    TBadge,
    TTooltip,
    TDialog,
    TIndicator,
    TPopover,
>
    extends AttrDecl, HiddenDecl {
    // ─── identity: 节点标识 ───

    /** DOM 标签名（如 div、span、input），与 type 互斥 */
    tag?: string;

    /** 组件类引用（如 ButtonComponent），与 tag 互斥，不支持字符串 */
    type?: IComponentBase;

    /** 节点名称 — nodeMap 索引键 + 自动属性生成 */
    name?: string;

    // ─── event: 事件声明（全委托模式：统一在 domEvents 三层嵌套中声明） ───

    /**
     * 语义动作名 — 用于 tplEvents 第三层 key 定位和事件数据
     *
     * 全委托模式中 action 有两个用途：
     *   1. 作为 tplEvents 第三层 key 的定位标识（区分同类型多实例）
     *   2. 自动合并到事件数据中（{ action: 'save' }）
     *
     * action 由使用方在模板节点上定义，不是组件自身定义的。
     * 同类型多实例通过不同 action 区分（save vs create）。
     *
     * @example
     * ```ts
     * { name: 'save', type: 'Button', action: 'save' }
     * { name: 'create', type: 'Button', action: 'create' }
     * ```
     */
    action?: string;

    // ─── content: 内容 ───

    /** 静态文本内容，编译时直接写入 HTML */
    text?: string;

    /** i18n 翻译 key */
    i18n?: TI18n;

    /** 权限声明（true=从 action 推导 / action / entity:action / domain:entity:action） */
    permission?: Tpermission;

    // ─── component: 组件专属 ───

    // ─── behavior: 行为配置（浮层/拖拽/放置/动画） ───

    /**
     * 拖拽标记 — 声明此节点是拖拽手柄
     *
     * true 使用默认配置（axis='both', trigger='press'），或传入 DragDecl 自定义。
     * 运行时通过 attachDrag 挂载拖拽手势。
     *
     * @example
     * { name: 'handle', tag: 'div', drag: true }
     * { name: 'resizeHandle', tag: 'div', drag: { axis: 'x' } }
     */
    drag?: boolean | TDrag;

    /**
     * 放置区标记 — 声明此节点是放置目标
     *
     * true 使用默认配置，或传入 DropDecl 自定义。
     * 运行时通过 DragDispatchCenter 绑定放置事件。
     *
     * @example
     * { name: 'dropZone', tag: 'div', drop: true }
     * { name: 'dropZone', tag: 'div', drop: { accept: ['card'], activeClass: 'drag-over' } }
     */
    drop?: boolean | TDrop;

    /**
     * 动画配置 — 声明此节点的进入/离开动画
     *
     * 节点级配置：使用方为子组件节点配置动画，
     * 组件自身无需声明，由使用方按需注入。
     *
     * @example
     * { name: 'panel', type: 'Panel', animation: { enter: 'slideInUp', leave: 'slideOutDown', duration: 200 } }
     */
    animation?: TAnimation;

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
    badge?: TBadge | string | number | null;

    /**
     * 提示浮层快捷配置 — 节点级 tooltip 声明
     *
     * 等价于 float: { type: 'Tooltip', ... }
     *
     * @example
     * { name: 'help', tooltip: '帮助说明' }
     * { name: 'help', tooltip: { content: '详细内容', placement: 'top' } }
     */
    tooltip?: TTooltip | string | null;

    /**
     * 对话框浮层快捷配置 — 节点级 dialog 声明
     *
     * 等价于 float: { type: 'Dialog', ... }
     *
     * @example
     * { name: 'saveBtn', dialog: { type: 'Confirm', title: '确认保存？' } }
     */
    dialog?: TDialog | null;

    /**
     * 弹出层浮层快捷配置 — 节点级 popover 声明
     *
     * 等价于 float: { type: 'Popover', ... }
     *
     * @example
     * { name: 'info', popover: { title: '信息', content: '详情内容' } }
     */
    popover?: TPopover | null;

    // ─── drag-drop-shorthand: 拖拽/放置快捷标记 ───

    /**
     * 拖拽手柄标记 — 声明此节点是组件的拖拽手柄
     *
     * true：此节点作为父组件的拖拽触发区域。
     * 等价于组件级 dragHandle = nodeName。
     *
     * @example
     * { name: 'header', dragHandle: true }
     * // 等价于：在组件类写 dragHandle = 'header'
     */
    dragHandle?: boolean;

    /**
     * 放置区标记 — 声明此节点是组件的放置目标
     *
     * true：此节点作为父组件的放置区域。
     * 等价于组件级 dropZone = nodeName。
     *
     * @example
     * { name: 'content', dropZone: true }
     * // 等价于：在组件类写 dropZone = 'content'
     */
    dropZone?: boolean;

    // ─── itemgroup: ItemGroup 专属配置 ───

    /**
     * 指示器配置 — 仅 ItemGroup 类型组件可用
     *
     * 自动挂载 IndicatorComponent 浮层，实现 activeIndex 选中管理。
     *
     * @example
     * { name: 'tabs', type: 'TabGroup', indicator: { type: 'tab', arrows: true } }
     */
    indicator?: TIndicator | null;

    // ─── children: 子节点 ───

    /** 子节点定义 */
    children?: TplDecl<
        TI18n,
        Tpermission,
        TDrag,
        TDrop,
        TAnimation,
        TBadge,
        TTooltip,
        TDialog,
        TIndicator,
        TPopover
    >[];
    // ─── template-level: 模板级声明（仅根节点使用）───

    // ─── custom props: 自定义属性（ExtJS 风格声明式 Props）───
    [key: string]: any;
}
