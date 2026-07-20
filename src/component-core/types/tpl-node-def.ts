/**
 * TplNode 字段定义 — 单一真相源
 *
 * TplNode 是组件模板中每个节点的定义，描述 DOM 骨架和组件树。
 * 编译时递归遍历 TplNode 树，产出 HTML 片段 + 元数据；
 * 运行时克隆模板、构建 nodeMap、绑定事件、应用样式。
 *
 * ══════════════════════════════════════════════════════════════
 * 核心设计原则：数据驱动 + 统一分发
 * ══════════════════════════════════════════════════════════════
 *
 * 事件、属性、overlay/drag 全部遵循同一模式：
 *   定义 → 存为纯数据 → 统一方法分发 → 不生成复杂闭包
 *
 * ══════════════════════════════════════════════════════════════
 * 组件构建流程
 * ══════════════════════════════════════════════════════════════
 *
 * 【编译时】compileTemplate(template)
 *   1. 递归遍历 TplNode 树
 *   2. tag 节点 → 生成 HTML 标签 + 收集 name 到 nodeMap
 *   3. type 节点 → 生成占位 <div>，运行时由子组件替换
 *   4. events → 存入 nodeMap 元数据（纯数据，不生成闭包）
 *   5. flex/grid/cls/style → 存入 meta，运行时由 applyStyle 应用
 *   6. i18n → 存入 meta，运行时写入 DOM
 *   7. initConfig → 存入 meta，子组件渲染时传入构造函数
 *   8. 创建 <template> 元素缓存 HTML 片段
 *   9. buildContentProperties 在原型上生成极简 getter/setter（只转发）
 *
 * 【运行时】_initWithTemplate()
 *   1. 克隆模板 → 构建 nodeMap（el + meta）
 *   2. applyStyle — 将 flex/grid/cls/style 应用到 DOM
 *   3. initContentFromProps — 填充内容属性
 *   4. initI18nFromTemplate — 翻译 i18n key 并写入 DOM
 *   5. _renderChildComponents — 渲染 type 子组件，initConfig 传入构造函数
 *   6. _bindDomEvents — 统一绑定 DOM 事件到 _handleDomEvent
 *   7. 调用能力 __init__ 方法
 *
 * ══════════════════════════════════════════════════════════════
 * 事件机制
 * ══════════════════════════════════════════════════════════════
 *
 * TplNode 的 events 是【发布端】，声明节点会发出什么事件；
 * body 的 listens 是【订阅端】，声明组件监听什么事件。
 * 一出一进，不应混谈。
 *
 * 统一事件处理流程：
 *   _handleDomEvent(ctx, nodeName, event)
 *     → 从 nodeMap[nodeName].eventDefs[event] 取事件定义（纯数据）
 *     → 遍历定义，按类型分发：
 *        handler   → this[handlerName](ctx, el)
 *        emits     → this.emit(emitName, ctx)
 *        entities  → EntityEventBus.entityEmit(entityKey, action, ctx)
 *        bridges   → this.bridgeEmit(eventKey, targetEvent, ctx)
 *
 * 设计要点：
 * - 不为每个事件生成闭包，事件定义存在 nodeMap 元数据中
 * - debounce/throttle 通过预定义包装函数处理，不每次生成
 * - 无条件绑定：emits/entities/bridges 是跨组件桥接，
 *   组件自身无法知道外部有没有监听，只能全部触发
 *
 * 事件数据自动收集：
 * - emits 触发 this.emit(emitName, ctx) 时，如果 ctx 无自定义数据，
 *   框架自动查找 get{EmitName}EventData() 方法获取数据
 * - 详见 tpl-body-def.ts「事件数据自动收集」章节
 *
 * DomEventDecl 各字段含义：
 * ┌──────────────┬──────────────────────────────────────────────────┐
 * │ 字段         │ 说明                                             │
 * ├──────────────┼──────────────────────────────────────────────────┤
 * │ handler      │ 内部处理方法                                     │
 * │              │ true → 自动推导 on{Name}{Event}（推荐）          │
 * │              │ string → 显式指定方法名（不推荐，与钩子脱节）     │
 * │ emits        │ 转发为组件事件，持有方通过 on(name, fn) 监听      │
 * │ entities     │ 转发为实体操作，调用 EntityEventBus               │
 * │ bridges      │ 转发为桥接事件（通过 EventBridge 解耦转发）       │
 * │ once         │ handler 只执行一次                               │
 * │ debounce     │ 防抖时间（毫秒），预定义包装函数                  │
 * │ throttle     │ 节流时间（毫秒），预定义包装函数                  │
 * │ delegate     │ 委托模式（原子化组件极少使用）                    │
 * │ delegateTarget│ 委托目标，与 delegate 配合                       │
 * └──────────────┴──────────────────────────────────────────────────┘
 *
 * ══════════════════════════════════════════════════════════════
 * floats / drags 机制
 * ══════════════════════════════════════════════════════════════
 *
 * 浮动层和拖拽由 body 中的 floats/drags 配置驱动，
 * 触发方式由 FloatDecl.trigger 字段控制，不需要在 TplNode events 中声明。
 *
 * floats 配置（详见 tpl-body.ts FloatDecl）：
 *   body: {
 *       floats: {
 *           dropBtn:  { type: 'DropPanel', align: 'bottom', trigger: 'click' },
 *           tooltip:  { type: 'Tips', anchor: 'self', trigger: 'hover' },
 *           badge:    { type: 'Badge', anchor: 'icon', trigger: 'always' },
 *       }
 *   }
 *
 * drags 配置（详见 tpl-body.ts DragDecl）：
 *   body: {
 *       drags: {
 *           handle: { axis: 'y', bounds: 'parent' },
 *       }
 *   }
 *
 * 触发规则：
 * - FloatDecl 有 trigger → 系统自动在锚点元素上绑定对应事件
 * - FloatDecl 无 trigger → 手动控制（代码调用 onFloat）
 * - 内置防重入锁，防双击重复开关 / 拖拽进行中不重复触发
 *
 * ══════════════════════════════════════════════════════════════
 * name 字段与属性机制
 * ══════════════════════════════════════════════════════════════
 *
 * name 是 nodeMap 中的索引键，同时承担自动属性生成。
 * 属性访问同样遵循数据驱动 + 统一分发原则：
 *
 * 【属性映射表】纯数据，定义属性名到 DOM 操作的映射：
 *   static _nodePropMap = {
 *       cls:    { domAttr: 'className' },
 *       style:  { domAttr: 'style' },
 *       hidden: { domAttr: 'hidden' },
 *       text:   { domAttr: 'innerHTML' },   // 默认，按 tag 自动调整
 *       src:    { domAttr: 'href' },         // a 标签
 *       width:  { domAttr: 'style', cssProp: 'width', autoPx: true },
 *       ...
 *   };
 *
 * 【统一方法】所有属性操作集中处理：
 *   _getNodeProp(nodeName, prop)
 *     → 查 _nodePropMap[prop] 取映射
 *     → cssProp → el.style[cssProp]
 *     → 其他 → el[domAttr]
 *
 *   _setNodeProp(nodeName, prop, value)
 *     → 查 _nodePropMap[prop] 取映射
 *     → cssProp + autoPx → 数字自动加 px
 *     → 其他 → el[domAttr] = value
 *
 * 【原型 getter/setter】极简转发，不生成复杂闭包：
 *   Object.defineProperty(proto, 'textCls', {
 *       get() { return this._getNodeProp('text', 'cls'); },
 *       set(v) { this._setNodeProp('text', 'cls', v); }
 *   });
 *
 * 【tag 自动推导内容属性】不需要 textMode，按 tag 自动决定：
 *   tag: 'div'/'span' → this.name → el.innerHTML
 *   tag: 'input'      → this.name → el.value
 *   tag: 'img'        → this.name → el.src
 *   tag: 'a'          → this.name → el.innerHTML + this.nameSrc → el.href
 *
 * 【DOM 子节点】name='text' 自动生成：
 *   - this.text → el.innerHTML（按 tag 自动推导）
 *   - this.textCls → el.className
 *   - this.textStyle → el.style
 *   - this.textHidden → el.hidden
 *   - this.textWidth → el.style.width
 *   - ...通用属性由 _nodePropMap 定义
 *
 * 【组件子节点】name='icon' 自动生成：
 *   - this.$icon → nodeMap.icon.component（组件访问器，$ 前缀）
 *   - this.iconCls → iconComponent.el.className
 *   - this.iconStyle → iconComponent.el.style
 *   - this.iconSize → iconComponent.size
 *   - ...同上通用属性
 *
 * ══════════════════════════════════════════════════════════════
 * role / attrs 机制
 * ══════════════════════════════════════════════════════════════
 *
 * role：高频 ARIA 属性，单独字段更直观
 *   { name: 'btn', tag: 'button', role: 'button' }
 *
 * attrs：兜底其他静态 HTML 属性（aria-label、data-* 等）
 *   { name: 'btn', tag: 'button', attrs: { 'aria-label': '保存', 'data-id': '1' } }
 *
 * 动态 aria 属性（aria-checked、aria-disabled 等）随状态变化，
 * 声明式无法解决，走 _setNodeProp 统一方法：
 *   this.btnAriaChecked = true;  → _setNodeProp('btn', 'ariaChecked', true)
 *
 * ══════════════════════════════════════════════════════════════
 * forwards 透传机制（body 级）
 * ══════════════════════════════════════════════════════════════
 *
 * forwards 定义在 body 中，用于跨组件层透传属性/方法。
 * 不做自动化，通过自定义属性解决，避免过度复杂。
 *
 *   body: {
 *       forwards: {
 *           title: 'header.title',    // this.title → headerComponent.title
 *           doOpen: 'dialog.open',    // this.doOpen() → dialogComponent.open()
 *       }
 *   }
 *
 * key 是当前组件暴露的名称，value 是 nodeMap 路径。
 * 需要透传时手动定义，不自动生成，保持简单可控。
 *
 * ══════════════════════════════════════════════════════════════
 * 布局机制（flex / grid 互斥）
 * ══════════════════════════════════════════════════════════════
 *
 * flex 和 grid 作为 TplNode 顶层字段，互斥，不需要套一层 layout：
 *
 *   flex: true                                                      // flex 默认 row
 *   flex: { direction: 'column', gap: 8, wrap: true, align: 'center', pack: 'start' }
 *   grid: true                                                      // grid 默认
 *   grid: { columns: 3, gap: 8 }
 *
 * flex 配置：
 *   - direction: 'row' | 'column'（默认 'row'）
 *   - gap: 间距，数字自动加 px
 *   - align: 交叉轴对齐 'start' | 'center' | 'end' | 'stretch'
 *   - pack: 主轴分布 'start' | 'center' | 'end' | 'between' | 'around'
 *   - wrap: 是否换行
 *
 * grid 配置：
 *   - columns: 列数
 *   - gap: 间距
 *
 * 运行时由 applyStyle 将语义值转换为内联 flex/grid CSS。
 * 代码只按 flex 或 grid 分支加对应 CSS 属性，互不干扰。
 *
 * ══════════════════════════════════════════════════════════════
 * 字段分类
 * ══════════════════════════════════════════════════════════════
 *
 * - identity:  节点标识（tag/type/name），编译时直接处理
 * - event:     事件发布（events），编译时存入元数据，运行时统一绑定
 * - style:     样式（cls/style），运行时由 applyStyle 应用
 * - layout:    布局（flex/grid），互斥，运行时转为内联 CSS
 * - content:   内容（i18n），运行时由 getter/setter 处理
 * - dom:       DOM 属性（role/attrs），运行时通过 setAttribute 设置
 * - state:     状态（hidden/hiddenMode），运行时映射 DOM 属性
 * - component: 组件专属（initConfig），编译时存元数据
 * - children:  子节点（children），编译时递归处理
 *
 * toMeta: 是否复制到 NodeTemplateMeta（编译时元数据）
 * toRoot: 是否复制到根节点属性（如 rootCls、rootFlex）
 * metaKey: 复制到 meta 时使用的替代 key 名
 */

export interface TplNodeFieldDef {
    field: string;
    category:
        | 'identity'
        | 'event'
        | 'style'
        | 'layout'
        | 'content'
        | 'state'
        | 'dom'
        | 'component'
        | 'children';
    toMeta: boolean;
    toRoot: boolean;
    metaKey?: string;
}

export const TPL_NODE_FIELDS: readonly TplNodeFieldDef[] = [
    // ─── identity: 节点标识 ───

    { field: 'tag', category: 'identity', toMeta: false, toRoot: false },
    { field: 'type', category: 'identity', toMeta: false, toRoot: false },
    { field: 'name', category: 'identity', toMeta: false, toRoot: false },

    // ─── event: 事件发布（详见上方事件机制章节） ───

    { field: 'events', category: 'event', toMeta: false, toRoot: false },

    // ─── style: 样式 ───

    { field: 'cls', category: 'style', toMeta: true, toRoot: true, metaKey: 'cls' },
    { field: 'style', category: 'style', toMeta: true, toRoot: true },

    // ─── layout: 布局（flex/grid 互斥，详见上方布局机制章节） ───

    { field: 'flex', category: 'layout', toMeta: true, toRoot: true },
    { field: 'grid', category: 'layout', toMeta: true, toRoot: true },

    // ─── content: 内容 ───

    { field: 'i18n', category: 'content', toMeta: true, toRoot: false, metaKey: 'i18nKey' },

    // ─── dom: DOM 属性 ───

    { field: 'role', category: 'dom', toMeta: true, toRoot: false },
    { field: 'attrs', category: 'dom', toMeta: true, toRoot: false },

    // ─── state: 状态 ───

    { field: 'hidden', category: 'state', toMeta: true, toRoot: false },
    { field: 'hiddenMode', category: 'state', toMeta: true, toRoot: false },

    // ─── component: 组件专属 ───

    {
        field: 'initConfig',
        category: 'component',
        toMeta: true,
        toRoot: false,
        metaKey: 'initConfig',
    },

    // ─── children: 子节点 ───

    { field: 'children', category: 'children', toMeta: false, toRoot: false },
] as const;

export const META_COPY_KEYS = TPL_NODE_FIELDS.filter(f => f.toMeta).map(
    f => f.field
) as readonly string[];

export const ROOT_COPY_KEYS = TPL_NODE_FIELDS.filter(f => f.toRoot).map(
    f => f.field
) as readonly string[];
