/**
 * DOM 事件委托类型定义 — 两层扁平 domEvents
 *
 * ══════════════════════════════════════════════════════════════
 * 两层扁平模式 — { [domEvent]: DomEventRule | DomEventRule[] }
 * ══════════════════════════════════════════════════════════════
 *
 * 事件体系三部分：
 *   ① domEvents — DOM 委托事件与转发（本文件）
 *   ② node 事件 — nodeMap 子组件事件订阅（listens: NodeListen）
 *   ③ listens — 统C统一事件订阅（ListenItem[]，支持 node/source/entity/system/route/file/float/drag）
 *
 *,核心规则：
 *   1. domEvents 两层扁平：DOM事件 → DomEventRule（含 path + handler + 转发配置）
 *   2. 使用D使用方在当前组件 el 上绑定 DOM 事件，委托匹配目标组件
 *   3. path F段语法：裸字符串=name、[xxx]=option、{Type}=type
 *   4. 按钮不需要定义 domEvents，完全被动
 *   5. domEvents 就是声明式监听：handler 本地监听，emits 转发，可共存
 *
 * path 段语法：
 *   裸字符串  = name 查找（nodeMap 中按 name 定位D，如 'colorCard'）
 *   [G[xxx]     = option 查找（component[xxx] getter，如 '[body]'、'[items]'）
 *   {Type}    = type 查找（子组件中按类型匹配，如 '{Button}'）
 *
 * path 示例：
 *   'colorCard'                          → ShowcaseApp nodeMap 中找 name=colorCard
 *   'colorCard.[body].colorToolbar.[items]' → Card → body option → Toolbar → items option
 *   'toolbar.{Button}'                   → toolbar nodeMap 中找，再按类型 Button 匹配
 *
 * [items] 特殊处理：返回数组时，在数组中找 el.contains(target) 的那个组件
 *
 * 方法名推导（基于 path 最后一段）：
 *   on{LastSegment}{Event}
 *   自定义 handler 优先于自动推导
 *
 * 运行时流程：
 *   在当前组件 el 上绑定 DOM 事件（如 click）
 *   → 事件触发 → 查 domEvents[click]
 *   → 解析 path 逐段定位4配 → el.contains(event.target) 验证
 *   → 执行 handler / 转发
 */

// ══════════════════════════════════════════════════════════════
// 运行时委托元数据
// ══════════════════════════════════════════════════════════════

/**
 * 单条委托规则（运行时使用）
 *
 * 从 domEvents 两层扁平结构编译生成。
 * 运行时匹配：当前组件 el 上 DOM 事件触发 → path 逐段定位 → el.contains 验证
 */
export interface DelegatedEventRule {
    /** DOM 事件名（第一层 key） */
    event: string;

    /** 组件路径（如 'colorCard.[body].colorToolbar.[items]'） */
    path: string;

    /**
     * 事件数据声明
     */
    data?: string[] | Record<string, string[]>;

    /** 转发为组件事件 */
    emits?: string[];

    /** 转发为组件事件（通过 ComponentEventBus） */
    bridges?: string[];

    /** 转发为实体操作 */
    entities?: string;

    /** 转发为路由事件 */
    router?: string;

    /** 转发为系统事件 */
    system?: string[];

    /**
     * DOM 事件委托 → 调用组件本地方法
     *
     * - true：自动推导方法名（on{LastSegment}{Event}）
     * - string：使用自定义方法名
     * - Record<string, string>：按 action 值映射不同方法名，'default' 为兜底
     */
    handler?: boolean | string | Record<string, string>;

    /** 只执行一次 */
    once?: boolean;

    /** 防抖时间 */
    debounce?: number;

    /** 节流时间 */
    throttle?: number;

    /** 是否需要内部绑定 */
    needsBinding: boolean;
}

/**
 * domEvents 单条规则配置（两层扁平结构中的 value）
 *
 * path 段语法：
 *   裸字符串  = name 查找（nodeMap 中按 name 定位）
 *   [xxx]     = option 查找（component[xxx] getter）
 *   {Type}    = type 查找（子组件中按类型匹配）
 *
 * @example
 * ```ts
 * domEvents = {
 *     click: { path: 'colorCard.[body].colorToolbar.[items]', handler: '_onButtonClick' },
 *     input: { path: 'searchInput', handler: '_onSearch' },
 * }
 * ```
 */
export interface DomEventRule {
    /** 组件路径，段间用 '.' 分隔 */
    path: string;

    /**
     * DOM 事件委托 → 调用组件本地方法
     *
     * - true：自动推导方法名（on{LastSegment}{Event}）
     * - string：使用自定义方法名
     * - Record<string, string>：按 action 值映射不同方法名，'default' 为兜底
     */
    handler?: boolean | string | Record<string, string>;

    /** 转发为组件事件 */
    emits?: string[];

    /** 转发为组件事件（通过 ComponentEventBus） */
    bridges?: string[];

    /** 转发为实体操作 */
    entities?: string;

    /** 转发为路由事件 */
    router?: string;

    /** 转发为系统事件 */
    system?: string[];

    /** 事件数据声明 */
    data?: string[] | Record<string, string[]>;

    /** 只执行一次 */
    once?: boolean;

    /** 防抖时间 */
    debounce?: number;

    /** 节流时间 */
    throttle?: number;
}

/**
 * domEvents 两层扁平类型
 *
 * 第一层 key = DOM 事件名（click / keypress / change 等）
 * 第二层 = DomEventRule 或 DomEventRule[]（同一事件多条规则）
 *
 * @example
 * ```ts
 * domEvents = {
 *     click: { path: 'colorCard.[body].colorToolbar.[items]', handler: '_onButtonClick' },
 *     input: [
 *         { path: 'searchInput', handler: '_onSearch' },
 *         { path: 'filterInput', handler: '_onFilter' },
 *     ],
 * }
 * ```
 */
export interface DomEventsMap {
    [domEvent: string]: DomEventRule | DomEventRule[];
}

/**
 * 节点事件配置 — ItemGroup 等场景中为子节点声明事件
 *
 * 与 DomEventRule 类似但不需要 path（因为子节点已经在 item 配置中定位）
 *
 * @example
 * ```ts
 * // ItemGroup 子节点的事件配置
 * { click: { handler: true, emits: ['itemClick'] } }
 * ```
 */
export type TplEventAction = Omit<DomEventRule, 'path'>;

// 事件体系三部分：
// ① domEvents — DOM 委托事件与转发（本文件 DomEventsMap）
// ② node 事件 — nodeMap 子组件事件订阅（listens: NodeListen）
// ③ listens — 统一事件订阅（ListenItem[]，所有类型支持本地监听 + 六路转发）

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
    /** 浮动层组件类型（可选，省略时由具体的 Ability 提供默认类型） */
    type?: string | { new (...args: any[]): any };
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

// ══════════════════════════════════════════════════════════════
// 浮层快捷配置类型（从 init-context 复用）
// ══════════════════════════════════════════════════════════════

/** 浮层配置映射表，将浮层名映射到浮层声明 */
export type FloatsConfig = Record<string, FloatDecl>;
