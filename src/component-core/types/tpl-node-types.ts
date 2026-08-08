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
    /** flex 缩放因子，如 '1'、'0 0 200px'，数字自动转字符串 */
    flex?: number | string;
    /** 最小高度，数字自动加 px */
    minHeight?: number | string;
    /** 最大高度，数字自动加 px */
    maxHeight?: number | string;
    /** 最小宽度，数字自动加 px */
    minWidth?: number | string;
    /** 最大宽度，数字自动加 px */
    maxWidth?: number | string;
    /** 高度，数字自动加 px */
    height?: number | string;
    /** 宽度，数字自动加 px */
    width?: number | string;
    /** 溢出处理 */
    overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
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

    /** 组件类引用（如 ButtonComponent），与 tag 互斥，不支持字符串 */
    type?: new (...args: any[]) => any;

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

    /**
     * 节点级事件数据声明
     *
     * @deprecated 请使用 tplEvents 三层嵌套中的 data 声明
     */
    data?: string[] | Record<string, string[]>;

    // ─── style: 样式 ───

    /** CSS 类名 */
    cls?: string;

    /** 内联样式（字符串或对象） */
    style?: string | Record<string, any>;

    /** 自定义 CSS 变量声明 — 结构化定义，编译时合并到 style 属性前部 */
    cssVars?: Record<string, string>;

    // ─── layout: 布局（flex/grid 互斥） ───

    /** flex 布局，true 使用默认 row */
    flex?: boolean | FlexConfig;

    /** grid 布局，true 使用默认配置 */
    grid?: boolean | GridConfig;

    // ─── content: 内容 ───

    /** 静态文本内容，编译时直接写入 HTML */
    text?: string;

    /** i18n 翻译 key */
    i18n?: string;

    /** 权限声明（true=从 action 推导 / action / entity:action / domain:entity:action） */
    permission?: boolean;

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

    // ─── behavior: 行为配置（浮层/拖拽/放置/动画） ───

    /**
     * 浮层标记 — 声明此节点是浮层锚点
     *
     * true 使用默认配置，或传入 FloatDecl 自定义。
     * 运行时通过 attachFloat 挂载浮层组件。
     *
     * @example
     * { name: 'dropBtn', type: 'Button', float: true }
     * { name: 'helpIcon', type: 'Icon', float: { type: 'Tooltip', trigger: 'hover' } }
     */
    float?: boolean | FloatDecl;

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
    drag?: boolean | DragDecl;

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
    drop?: boolean | DropDecl;

    /**
     * 动画配置 — 声明此节点的进入/离开动画
     *
     * 节点级配置：使用方为子组件节点配置动画，
     * 组件自身无需声明，由使用方按需注入。
     *
     * @example
     * { name: 'panel', type: 'Panel', animation: { enter: 'slideInUp', leave: 'slideOutDown', duration: 200 } }
     */
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

    /**
     * 提示浮层快捷配置 — 节点级 tooltip 声明
     *
     * 等价于 float: { type: 'Tooltip', ... }
     *
     * @example
     * { name: 'help', tooltip: '帮助说明' }
     * { name: 'help', tooltip: { content: '详细内容', placement: 'top' } }
     */
    tooltip?: TooltipQuickConfig | string | null;

    /**
     * 对话框浮层快捷配置 — 节点级 dialog 声明
     *
     * 等价于 float: { type: 'Dialog', ... }
     *
     * @example
     * { name: 'saveBtn', dialog: { type: 'Confirm', title: '确认保存？' } }
     */
    dialog?: DialogQuickConfig | null;

    /**
     * 弹出层浮层快捷配置 — 节点级 popover 声明
     *
     * 等价于 float: { type: 'Popover', ... }
     *
     * @example
     * { name: 'info', popover: { title: '信息', content: '详情内容' } }
     */
    popover?: PopoverQuickConfig | null;

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
    indicator?: IndicatorConfig | null;

    // ─── children: 子节点 ───

    /** 子节点定义 */
    children?: TplNode[];
    // ─── template-level: 模板级声明（仅根节点使用）───

    /** 替换映射 — key=命名节点name, value=替换内容 */
    replaces?: Record<string, any>;

    // ─── custom props: 自定义属性（ExtJS 风格声明式 Props）───

    /**
     * 自定义属性 — 父组件在 TplNode 上写的非框架字段
     *
     * 编译时由 collectExtraFields 收集（排除 KNOWN_FIELD_SET），
     * 存入 nodeMetas[name].props，运行时通过 instantiateChildComponents
     * 传入子组件构造函数，由 applyConfig 管线步骤处理。
     *
     * 支持 i18n: 前缀，运行时自动 resolve。
     *
     * @example
     * ```ts
     * { name: 'hero', type: HeroComponent, title: 'i18n:hero.title', subtitle: '欢迎使用' }
     * ```
     */
    [key: string]: any;
}

// ══════════════════════════════════════════════════════════════
// 事件监听类型（从 tpl-body 迁移）
// ══════════════════════════════════════════════════════════════

/**
 * 事件映射值 — 统一支持本地监听 + 六路转发
 *
 * 三种简写：
 *   string              — 纯本地监听，handler 方法名
 *   true                — 纯本地监听，方法名自动推导（仅 node 类型）
 *   ForwardConfig       — 转发（可含 handler 本地处理）
 *
 * @example
 * ```ts
 * events: {
 *     save: 'onSave',                                    // 纯本地
 *     close: true,                                       // 纯本地，方法名自动推导（仅 node）
 *     submit: { handler: 'onSubmit', once: true },       // 本地 + 选项
 *     deleted: { bridges: ['removed'] },                 // 纯转发
 *     updated: { handler: 'onUpdated', emits: ['ok'] },  // 本地 + 转发
 * }
 * ```
 */
export type EventMapping =
    | string
    | true
    | {
          handler?: string | true;
          once?: boolean;
          emits?: string[];
          bridges?: string[];
          entities?: string;
          file?: string;
          router?: string;
          system?: string[];
      };

/**
 * 桥接事件订阅
 *
 * @example
 * ```ts
 * { source: 'formKey', events: { save: 'onSave', cancel: { handler: 'onCancel', once: true } } }
 * ```
 */
export interface ComponentListen {
    /** 组件事件源 key（源组件的 eventKey） */
    source: string;
    /** 事件映射：源事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 实体事件订阅
 *
 * entityKey 统一从 instance.entityKey 取（组件实例属性，独立于 listens 声明），
 * `entity` 字段仅作类型标识，区分 entity 监听与其他监听类型，不再承担 entityKey 值。
 *
 * @example
 * ```ts
 * { entity: true, events: { listed: 'onUsersLoaded', created: { handler: 'onUserCreated', once: true } } }
 * ```
 */
export interface EntityListen {
    /** 类型标识：声明为实体事件监听（entityKey 取 instance.entityKey） */
    entity: true;
    /** 事件映射：实体事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 浮动层事件订阅
 *
 * @example
 * ```ts
 * { float: 'dropBtn', events: { close: 'onClose', open: { handler: 'onOpen', once: true } } }
 * ```
 */
export interface FloatListen {
    /** 浮动层节点 name */
    float: string;
    /** 事件映射：浮动层事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 拖拽事件订阅
 *
 * @example
 * ```ts
 * { drag: 'handle', events: { start: 'onDragStart', end: { handler: 'onDragEnd', once: true } } }
 * ```
 */
export interface DragListen {
    /** 拖拽节点 name */
    drag: string;
    /** 事件映射：拖拽事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 系统事件订阅
 *
 * @example
 * ```ts
 * { system: true, events: { 'i18n:localeChange': 'onLocaleChange' } }
 * { system: true, events: { 'window:resize': 'onWindowResize' } }
 * ```
 */
export interface SystemListen {
    /** 标识为系统事件订阅 */
    system: true;
    /** 事件映射：系统事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 路由事件订阅
 *
 * @example
 * ```ts
 * { route: 'router', events: { change: 'onRouteChange', 'change:users': 'onUsersRoute' } }
 * ```
 */
export interface RouteListen {
    /** 路由源 key（通常为 'router'） */
    route: string;
    /** 事件映射：路由事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 文件事件订阅
 *
 * @example
 * ```ts
 * { file: 'avatars', events: { uploaded: 'onFileUploaded', uploadProgress: 'onUploadProgress' } }
 * ```
 */
export interface FileListen {
    /** 文件通道 key（fileKey） */
    file: string;
    /** 事件映射：文件反馈事件名 → 处理方法名或带选项对象 */
    events: Record<string, EventMapping>;
}

/**
 * 子组件事件订阅 — nodeMap 中子组件的 child.on() 订阅
 *
 * 扁平化结构，与其他 ListenItem 对齐：{ node: string, events: Record<string, EventMapping> }
 *
 * 仅限直接子组件（FINALIZE 时已实例化），跨层走桥接。
 *
 * @example
 * ```ts
 * // 简写 — 仅本地监听（方法名自动推导：onToolbarSave）
 * { node: 'toolbar', events: { save: true, create: true } }
 *
 * // 带转发 — handler 处理 + EventForwarder 六路转发
 * { node: 'toolbar', events: {
 *     save:    { handler: 'onToolbarSave', emits: ['saved'] },
 *     create:  { emits: ['created'] },
 *     delete:  { entities: 'remove' },
 * } }
 * ```
 */
export interface NodeListen {
    /** 子组件节点 name（nodeMap key） */
    node: string;
    /** 事件映射：事件名 → EventMapping */
    events: Record<string, EventMapping>;
}

/**
 * 统一事件订阅 — 数组格式，通过 key 名区分来源类型
 *
 * TplNode events 是【发布端】，body listens 是【订阅端】。一出进，不应混谈。
 *
 * 所有类型统一支持本地监听 + 六路转发（handler 处理后自动走 EventForwarder）。
 *
 * @example
 * ```ts
 * listens: [
 *     { node: 'toolbar', events: { save: true } },
 *     { source: 'formKey', events: { save: 'onSave' } },
 *     { entity: true, events: { listed: 'onUsersLoaded' } },
 *     { system: true, events: { 'i18n:localeChange': 'onLocaleChange' } },
 *     { route: 'router', events: { change: 'onRouteChange' } },
 *     { file: 'avatars', events: { uploaded: 'onFileUploaded' } },
 * ]
 * ```
 */
export type ListenItem =
    | NodeListen
    | ComponentListen
    | EntityListen
    | FloatListen
    | DragListen
    | SystemListen
    | RouteListen
    | FileListen;

// ══════════════════════════════════════════════════════════════
// 浮动层配置（从 tpl-body 迁移）
// ══════════════════════════════════════════════════════════════

/** 浮动层触发方式 */
export type FloatTrigger = 'click' | 'hover' | 'focus' | 'manual' | 'always';

/**
 * 浮动层定义 — type 是唯一特殊字段，去掉 type 后直接作为组件构造参数
 *
 * 触发方式由 trigger 字段控制，不需要在 TplNode events 中声明：
 * - 有 trigger → 系统自动在锚点元素上绑定对应事件
 * - 无 trigger → 手动控制（代码调用 onFloat）
 *
 * 两种浮动模式：
 *
 * 1. 节点触发型：key 匹配节点 name，自动锚定该节点
 *    floats: {
 *        dropBtn: { type: 'DropPanel', align: 'bottom', trigger: 'click' },
 *        // key='dropBtn' → 锚定 nodeMap.dropBtn.el，点击触发
 *    }
 *
 * 2. 组件级浮动：key 是语义名，必须指定 anchor
 *    floats: {
 *        tooltip: { type: 'Tooltip', anchor: 'self', trigger: 'hover' },
 *        // anchor='self' → 锚定组件自身 el，悬停触发
 *        tooltip: { type: 'Tooltip', anchor: 'self', trigger: ['hover', 'click'] },
 *        // 悬停或点击都触发
 *    }
 *
 * 注：badge 不走浮动引擎，而是在 buildDOM 后由 NodeMapManager 创建绝对定位 DOM，
 * 注册为 `{nodeName}:badge` 节点，可通过 CommonPropsAbility 操作。
 *
 * 处理流程：
 *   1. 取出 type → 解析组件类
 *   2. 删掉 type → 剩余配置
 *   3. new Component(remainingConfig) → 直接传入构造函数
 *
 * 统一了所有浮动场景：下拉面板、菜单、提示框等。
 */
export interface FloatDecl {
    /** 浮动层组件类型（唯一特殊字段，去掉后剩余配置直接作为构造参数） */
    type: string;
    /**
     * 锚定目标：
     * - 省略 → key 即为节点 name，自动锚定该节点
     * - 'self' → 锚定组件自身 el
     * - 节点 name → 锚定指定节点
     */
    anchor?: string | 'self';
    /**
     * 触发方式（有值则系统自动绑定，无值则手动控制）：
     * - 'click': 点击触发
     * - 'hover': 悬停触发
     * - 'focus': 聚焦触发
     * - 'manual': 手动控制
     * - 'always': 始终显示（初始化时显示一次）
     * - 数组：多种触发方式组合（如 ['hover', 'click']）
     */
    trigger?: FloatTrigger | FloatTrigger[];
    /** 弹出方向 */
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'anchor-center';
    /** 与锚点的间距（像素） */
    offset?: number;
    /** 点击浮层外部是否关闭（默认 true） */
    closeOnClickOutside?: boolean;
    /** 按 Escape 是否关闭（默认 true） */
    closeOnEscape?: boolean;
    /** 遮罩配置：true=默认遮罩，string=自定义遮罩样式类 */
    mask?: boolean | string;
    /** 遮罩模式：'scoped'=遮盖锚点组件el，'global'=全屏遮盖，'none'=无遮罩 */
    maskMode?: 'none' | 'scoped' | 'global';
    /**
     * 浮层事件转发：key=反馈事件名，value=转发到组件的事件名
     *
     * 反馈事件：shown（已显示）、hidden（已隐藏）、changed（数据已变更）
     *
     * @example
     * emits: { shown: 'dropOpen', hidden: 'dropClose' }
     * // 浮层打开时 → 组件 emit('dropOpen', data)
     * // 浮层关闭时 → 组件 emit('dropClose', data)
     */
    emits?: Record<string, string>;
    /** 显示延迟（毫秒），trigger 为 hover 时生效 */
    showDelay?: number;
    /** 隐藏延迟（毫秒），trigger 为 hover 时生效 */
    hideDelay?: number;
    /** 组件构造参数（由具体组件类型决定） */
    [key: string]: any;
}

/** 浮层配置映射表，将浮层名映射到浮层声明 */
export type FloatsConfig = Record<string, FloatDecl>;

// ══════════════════════════════════════════════════════════════
// 拖拽配置（从 tpl-body 迁移）
// ══════════════════════════════════════════════════════════════

/**
 * 拖拽定义 — 行为配置 + 可选影子组件 + 回调
 *
 * key=节点name（触发源），触发方式由 trigger 字段控制。
 *
 * 与 floats 不同，drags 的配置分两部分：
 * - 拖拽行为配置：axis、bounds 等 → 给 DragProcessor 用
 * - 拖拽影子组件：ghost 字段 → 影子组件类型
 *
 * 拖拽回调通过 body 中定义方法实现（函数自动挂原型）：
 *   body: {
 *       drags: { handle: { axis: 'y' } },
 *       onHandleDragStart(ctx) { ... },
 *       onHandleDragEnd(ctx) { ... },
 *   }
 *
 * @example
 * ```ts
 * drags: {
 *     handle: { axis: 'y', bounds: 'parent' },
 *     card:   { ghost: 'DragGhost', axis: 'both', bounds: { left: 0, top: 0 } },
 * }
 * ```
 */
export interface DragDecl {
    /**
     * 拖拽类型 — 覆盖默认的 component.type
     *
     * 默认使用组件的 type 属性（由类名自动派生，如 CardComponent → 'Card'）。
     * 仅在需要将组件伪装成其他类型时使用。
     *
     * @example
     * { axis: 'both' }  // type 自动使用 component.type
     * { type: 'item', axis: 'both' }  // 强制伪装为 'item' 类型
     */
    type?: string;
    /** 拖拽影子组件类型（可选） */
    ghost?: string;
    /** 拖拽轴向：'x' | 'y' | 'both' */
    axis?: 'x' | 'y' | 'both';
    /** 拖拽边界约束 */
    bounds?:
        | HTMLElement
        | { left?: number; top?: number; right?: number; bottom?: number }
        | string;
    /** 拖拽时添加的 CSS 类 */
    activeClass?: string;
    /** 网格吸附步长 */
    grid?: number;
}

/**
 * 放置区配置 — 声明节点可以接收拖拽放置
 *
 * @example
 * ```ts
 * // 基本用法
 * { name: 'dropZone', tag: 'div', drop: true }
 * { name: 'dropZone', tag: 'div', drop: { accept: ['card', 'item'], activeClass: 'drag-over' } }
 * ```
 */
export interface DropDecl {
    /** 接受的拖拽类型列表（为空表示接受所有） */
    accept?: string[];
    /** 拖拽悬停时添加的 CSS 类 */
    activeClass?: string;
    /** 放置时的回调方法名 */
    onDrop?: string;
}

/** 拖拽配置映射表，将拖拽名映射到拖拽声明 */
export type DragsConfig = Record<string, DragDecl>;

// ══════════════════════════════════════════════════════════════
// 动画配置（从 tpl-body 迁移）
// ══════════════════════════════════════════════════════════════

/**
 * 组件动画配置 — 声明式，自动触发
 *
 * 在 body 中声明，运行时自动在对应生命周期播放：
 * - enter: 组件初始化完成后自动播放
 * - leave: 组件销毁前自动播放
 *
 * 动画是组件行为，不是节点属性：
 * - CSS transition 写在 TplNode 的 cls/style 里
 * - 进入/退出动画在这里声明，由框架自动触发
 * - 浮层组件（如 Menu）自己管自己的动画，触发组件（如 Button）只管 floats 声明
 *
 * @example
 * ```ts
 * body: {
 *     animation: {
 *         enter: 'slideInUp',
 *         leave: 'slideOutDown',
 *         duration: 200,
 *     }
 * }
 * ```
 */
export interface AnimationDecl {
    /** 进入动画预设名（如 fadeIn / slideInUp / scaleIn） */
    enter?: string;
    /** 进入动画自定义 Keyframe（与 enter 二选一） */
    enterKeyframes?: Keyframe[];
    /** 退出动画预设名（如 fadeOut / slideOutDown / scaleOut） */
    leave?: string;
    /** 退出动画自定义 Keyframe（与 leave 二选一） */
    leaveKeyframes?: Keyframe[];
    /** 动画时长（毫秒），默认 300 */
    duration?: number;
    /** 缓动函数，默认 'ease' */
    easing?: string;
    /** 是否启用动画，默认 true */
    enabled?: boolean;
}

// ══════════════════════════════════════════════════════════════
// 浮层快捷配置类型（从 init-context 复用）
// ══════════════════════════════════════════════════════════════

import type {
    BadgeQuickConfig,
    TooltipQuickConfig,
    DialogQuickConfig,
    PopoverQuickConfig,
    IndicatorConfig,
} from './init-context';
