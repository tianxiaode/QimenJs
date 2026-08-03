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
 * 双层架构：闭包基类 + 内部类基类
 * ══════════════════════════════════════════════════════════════
 *
 * 组件系统采用双层架构，彻底解耦模板结构与组件逻辑：
 *
 * 【闭包基类】ComponentFactory — 工厂层，纯闭包
 *   - 不持有 el、nodeMap，不挂载能力
 *   - withTemplate(templates) → 编译模板 → 生成内部类 → 闭包保存
 *   - replace() → 基于已有内部类派生新内部类
 *   - 构造函数 / create() → 根据 when 条件选择内部类，返回内部类实例
 *   - new OuterClass({ labelPosition: 'top' }) 直接返回内部类实例（JS 规范支持）
 *
 * 【内部类基类】InnerComponent — 实现层，完整组件
 *   - 拥有完整初始化流程、能力（Ability）、el、nodeMap
 *   - 预编译产物直接挂在自己身上
 *   - 是真正被实例化的组件，外部拿到的就是这个实例
 *   - 不需要代理、不需要 forwards 转发 nodeMap
 *
 * 核心优势：
 *   - 模板与组件类解绑：同一闭包类可关联多个模板，按 when 条件选择
 *   - 逻辑复用：InputAbility 等能力跨模板共享，挂在内部类上
 *   - 零代理：外部直接操作内部类实例，所有能力方法直接可用
 *   - 动态切换：销毁旧内部实例 + 创建新内部实例 + 替换 el 位置
 *   - 预编译不变：每个内部类独立预编译，cloneNode 性能完全保留
 *
 * @example
 * ```ts
 * // 定义：闭包类关联多套模板（条件选择）
 * const InputComponent = ComponentFactory.withTemplate({
 *     tpl: [
 *         { tpl: INPUT_TOP_TEMPLATE, when: (cfg) => cfg.labelPosition === 'top' },
 *         { tpl: INPUT_LEFT_TEMPLATE, when: (cfg) => cfg.labelPosition === 'left' },
 *         { tpl: INPUT_DEFAULT_TEMPLATE },  // 兜底
 *     ],
 *     body: { type: 'input' },
 * });
 *
 * // 使用：按配置自动选择模板
 * const input = new InputComponent({ labelPosition: 'top' });
 * // → when 条件匹配 INPUT_TOP_TEMPLATE，返回对应内部类实例
 *
 * // 运行时切换模板
 * const state = { value: input.value };
 * input.dispose();
 * const newInput = new InputComponent({ labelPosition: 'left', ...state });
 * parentEl.appendChild(newInput.el);
 * ```
 *
 * ══════════════════════════════════════════════════════════════
 * 组件构建流程（新架构）
 * ══════════════════════════════════════════════════════════════
 *
 * 【定义时】withTemplate(templates) → 内部类
 *   1. templates.tpl 为 TplNode，单模板模式
 *   2. compileTemplate(template) → 生成 HTML + indexPath + nodeMetas
 *   3. 创建 <template> 元素缓存 HTML 片段
 *   4. 创建内部类（TemplateComponent 子类），挂载预编译产物 + body + 能力
 *   5. 返回内部类（真正的 class，可直接 new）
 *
 * 【实例化时】new InnerClass(props) → 组件实例
 *   管线分 4 Phase 顺序执行：
 *   Phase 1 MOUNT: ensureNodeMap → selfMount → setupNodeProps → onBeforeInit
 *   Phase 2 FILL: (预留)
 *   Phase 3 INSTANTIATE: instantiateChildComponents
 *   Phase 4 FINALIZE: bindListens → bindChildEvents → bindDomEvents → onAfterInit
 *

 * ══════════════════════════════════════════════════════════════
 * 事件机制（全委托模式：三层嵌套 tplEvents）
 * ══════════════════════════════════════════════════════════════
 *
 * 全委托模式：{ [domEvent]: { [componentPath]: { [action]: eventConfig } } }
 * 使用方在当前组件 el 上绑定 DOM 事件，通过组件路径 + action 直接定位目标，天然跨层穿透。
 *
 * tplEvents 定义：
 *   tplEvents = {
 *       click: {
 *           'toolbar.Button': {
 *               'save':   { emits: ['save'] },
 *               'create': { emits: ['create'] },
 *           },
 *       },
 *       keypress: {
 *           'toolbar.Button': {
 *               'save': { handler: true, emits: ['save'], entities: true },
 *           },
 *       },
 *   }
 *
 * 核心规则：
 *   1. tplEvents 三层嵌套：DOM事件 → 组件路径 → action → eventConfig
 *   2. 组件路径格式 [nodeName].[componentName]...，首段为 nodeName（nodeMap key）
 *   3. 按钮不需要定义 tplEvents，完全被动
 *   4. tplEvents 就是声明式监听：handler:true 本地监听，emits 转发，可共存
 *   5. 前缀匹配：prefix + eventName 组合事件名
 *
 * 详见 docs/design-decisions/2026-07-29-event-delegation-action-path-design.md
 *
 * ══════════════════════════════════════════════════════════════
 * floats / drags 机制
 * ══════════════════════════════════════════════════════════════
 *
 * 浮动层和拖拽由 body 中的 floats/drags 配置驱动，
 * 触发方式由 FloatDecl.trigger 字段控制。
 *
 * floats 配置（详见 tpl-body.ts FloatDecl）：
 *   body: {
 *       floats: {
 *           dropBtn:  { type: 'DropPanel', placement: 'bottom', trigger: 'click' },
 *           tooltip:  { type: 'Tooltip', anchor: 'self', trigger: 'hover' },
 *           badge:    { type: 'Badge', anchor: 'icon', trigger: 'always' },
 *       }
 *   }
 *
 * 浮层事件转发（FloatDecl.emits）：
 *   body: {
 *       floats: {
 *           dropBtn: {
 *               type: 'Menu', trigger: 'click', placement: 'bottom',
 *               emits: { shown: 'dropOpen', hidden: 'dropClose' },
 *           },
 *       }
 *   }
 *   浮层打开时 → 组件 emit('dropOpen', data)
 *   浮层关闭时 → 组件 emit('dropClose', data)
 *
 * 配置驱动原则：
 *   组件自身不硬编码 floats，浮层类型/配置完全由使用方在 body.floats 中声明。
 *   DropdownComponent 等语义组件只负责 UI 表现（如下拉箭头），
 *   浮层由使用方配置，实现完全的配置驱动。
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
 * name 字段与属性机制（两层架构）
 * ══════════════════════════════════════════════════════════════
 *
 * name 是 nodeMap 中的索引键。属性操作采用两层架构，
 * 不再为每个节点自动生成 xxxCls/xxxHidden 等描述符。
 *
 * 【属性映射表】纯数据，定义属性名到 DOM 操作的映射：
 *   DEFAULT_NODE_PROP_MAP = {
 *       cls:    { domAttr: 'className' },
 *       style:  { domAttr: 'style' },
 *       hidden: { domAttr: 'hidden' },
 *       width:  { domAttr: 'style', cssProp: 'width', autoPx: true },
 *       ...
 *   };
 *
 * 【统一读写】NodePropAbility 提供：
 *   _getNodeProp(nodeName, prop) — 查映射表读 DOM
 *   _setNodeProp(nodeName, prop, value) — 查映射表写 DOM
 *   _markNodeDirty(nodeName, props) — 脏追踪批量写 DOM
 *
 * ══════════════════════════════════════════════════════════════
 * Layer 1 — root 属性 + 方法
 * ══════════════════════════════════════════════════════════════
 *
 * CommonPropsAbility 在原型上生成 root getter/setter：
 *   this.cls = 'xxx'        → _markNodeDirty('root', { cls: 'xxx' })
 *   this.hidden = true      → _markNodeDirty('root', { hidden: true })
 *   this.width = 200        → _markNodeDirty('root', { width: 200 })
 *   this.border = { width: 1 } → _markNodeDirty('root', { border: ... })
 *
 * cls 相关方法（root 默认，可传 nodeName 切换到子节点）：
 *   this.addCls('active')           → root.classList.add('active')
 *   this.removeCls('active')        → root.classList.remove('active')
 *   this.toggleCls('active')        → root.classList.toggle('active')
 *   this.toggleCls('active', true)  → root.classList.toggle('active', true)
 *
 * ══════════════════════════════════════════════════════════════
 * Layer 2 — 子节点方法（nodeName 在末尾，可选）
 * ══════════════════════════════════════════════════════════════
 *
 * 方法重载：nodeName 在末尾，不传默认操作 root：
 *   this.addCls('active', 'expand')     → expand.classList.add('active')
 *   this.removeCls('active', 'expand')  → expand.classList.remove('active')
 *   this.toggleCls('active', 'expand')  → expand.classList.toggle('active')
 *
 * 属性方法：setNodeXxx(value, nodeName?)
 *   this.setNodeCls('xxx', 'expand')       → _markNodeDirty('expand', { cls: 'xxx' })
 *   this.setNodeHidden(true, 'expand')     → _markNodeDirty('expand', { hidden: true })
 *   this.setNodeWidth(200, 'expand')       → _markNodeDirty('expand', { width: 200 })
 *   this.setNodeBorder({...}, 'expand')    → _markNodeDirty('expand', { border: ... })
 *
 * 通用兜底：setNodeProp(prop, value, nodeName?)
 *   this.setNodeProp('tabIndex', 0, 'expand') → _markNodeDirty('expand', { tabIndex: 0 })
 *
 * ══════════════════════════════════════════════════════════════
 * 内容属性（addContentPropDesc）— 保留
 * ══════════════════════════════════════════════════════════════
 *
 * 【tag 自动推导内容属性】按 tag 自动决定：
 *   tag: 'div'/'span' → this.name → el.innerHTML
 *   tag: 'input'      → this.name → el.value
 *   tag: 'img'        → this.name → el.src
 *   tag: 'a'          → this.name → el.innerHTML + this.nameSrc → el.href
 *
 * 内容属性仍自动生成 getter/setter（如 this.title = 'Hello'），
 * 通用属性不再自动生成，改用 setNodeXxx 方法。
 *
 * ══════════════════════════════════════════════════════════════
 * 组件引用（addComponentRefDesc）— 保留
 * ══════════════════════════════════════════════════════════════
 *
 * 【组件子节点】name='icon' 自动生成：
 *   - this.$icon → nodeMap.icon.component（组件访问器，$ 前缀）
 *
 * 不再自动生成 iconCls/iconHidden 等属性转发，
 * 改用 this.setNodeCls('xxx', 'icon') 或 this.$icon.cls = 'xxx'
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
 * - event:     事件声明（action/data），编译时存入元数据
 * - style:     样式（cls/style），运行时由 applyStyle 应用
 * - layout:    布局（flex/grid），互斥，运行时转为内联 CSS
 * - content:   内容（i18n），运行时由 getter/setter 处理
 * - dom:       DOM 属性（role/attrs），运行时通过 setAttribute 设置
 * - state:     状态（hidden/hiddenMode），运行时映射 DOM 属性
 * - component: 组件专属（initConfig），编译时存元数据
 * - children:  子节点（children），编译时递归处理
 * - children:  模板片段（fragment），编译前展开为 children + 自动命名空间
 *
 * ══════════════════════════════════════════════════════════════
 * fragment 模板片段机制
 * ══════════════════════════════════════════════════════════════
 *
 * fragment 允许在模板中引用可复用的节点集合，编译前展开为普通 children，
 * 编译器完全不感知 fragment，展开后与手写 children 无异。
 *
 * 核心设计：
 * - TplFragment = { name, children } — 纯数据定义，无行为
 * - 编译前 expandFragments 将 fragment 展开为 children
 * - fragment.name 作为命名空间前缀，自动加到子节点 name 上
 * - 不创建组件边界，无透传问题
 *
 * @example
 * ```ts
 * const HeaderFragment: TplFragment = {
 *     name: 'header',
 *     children: [
 *         { tag: 'i', name: 'icon', cls: 'q-header__icon', hidden: true },
 *         { tag: 'div', name: 'title', cls: 'q-header__title' },
 *         { tag: 'i', name: 'action', cls: 'q-header__action', hidden: true },
 *     ],
 * };
 *
 * // 使用：fragment 的 children 展开到 div 内
 * // name 自动变为 header:icon / header:title / header:action
 * { tag: 'div', cls: 'q-card__header', fragment: HeaderFragment }
 *
 * // 等价于手写：
 * { tag: 'div', cls: 'q-card__header', children: [
 *     { tag: 'i', name: 'header:icon', cls: 'q-header__icon', hidden: true },
 *     { tag: 'div', name: 'header:title', cls: 'q-header__title' },
 *     { tag: 'i', name: 'header:action', cls: 'q-header__action', hidden: true },
 * ]}
 * ```
 *
 * 与组件（type）的区别：
 * - type: 创建组件实例，有组件边界，需要 forwards 透传
 * - fragment: 编译前展开，无组件边界，直接访问节点属性
 *
 * 与 body.nodes 配合：
 * - 展开后的节点名带命名空间，body.nodes 用全名覆盖
 * ```ts
 * body: {
 *     nodes: {
 *         'header:action': { hidden: false }
 *     }
 * }
 * ```
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

    // ─── event: 事件声明（domEvents 统一处理，详见上方事件机制章节） ───

    { field: 'action', category: 'event', toMeta: true, toRoot: false },
    { field: 'data', category: 'event', toMeta: true, toRoot: false },

    // ─── style: 样式 ───

    { field: 'cls', category: 'style', toMeta: true, toRoot: true, metaKey: 'cls' },
    { field: 'style', category: 'style', toMeta: true, toRoot: true },

    // ─── layout: 布局（flex/grid 互斥，详见上方布局机制章节） ───

    { field: 'flex', category: 'layout', toMeta: true, toRoot: true },
    { field: 'grid', category: 'layout', toMeta: true, toRoot: true },

    // ─── content: 内容 ───

    { field: 'i18n', category: 'content', toMeta: true, toRoot: false, metaKey: 'i18nKey' },
    {
        field: 'permission',
        category: 'content',
        toMeta: true,
        toRoot: false,
        metaKey: 'permission',
    },

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

    // ─── behavior: 行为配置（浮层/拖拽/放置/动画） ───

    { field: 'float', category: 'behavior', toMeta: true, toRoot: false },
    { field: 'drag', category: 'behavior', toMeta: true, toRoot: false },
    { field: 'drop', category: 'behavior', toMeta: true, toRoot: false },
    { field: 'animation', category: 'behavior', toMeta: true, toRoot: false },

    // ─── drag-drop-shorthand: 拖拽/放置快捷标记 ───

    { field: 'dragHandle', category: 'behavior', toMeta: true, toRoot: false },
    { field: 'dropZone', category: 'behavior', toMeta: true, toRoot: false },

    // ─── float-shorthand: 浮层快捷配置（float 的语法糖） ───

    { field: 'badge', category: 'behavior', toMeta: true, toRoot: false },
    { field: 'tooltip', category: 'behavior', toMeta: true, toRoot: false },
    { field: 'dialog', category: 'behavior', toMeta: true, toRoot: false },
    { field: 'popover', category: 'behavior', toMeta: true, toRoot: false },

    // ─── itemgroup: ItemGroup 专属配置 ───

    { field: 'indicator', category: 'component', toMeta: true, toRoot: false },

    // ─── children: 子节点 ───

    { field: 'children', category: 'children', toMeta: false, toRoot: false },

    // ─── fragment: 模板片段 ───

    { field: 'fragment', category: 'children', toMeta: false, toRoot: false },
] as const;

// ══════════════════════════════════════════════════════════════
// 自动拷贝工具：基于 TPL_NODE_FIELDS 定义元数据映射
// ══════════════════════════════════════════════════════════════

export interface FieldDef {
    field: string;
    category: string;
    toMeta: boolean;
    toRoot: boolean;
    metaKey?: string;
}

const ALL_FIELDS = TPL_NODE_FIELDS as readonly FieldDef[];

/** 所有需要拷贝到 NodeMetadata 的字段（含 metaKey 映射） */
export const META_FIELDS = ALL_FIELDS.filter(f => f.toMeta);

/** 所有需要拷贝到根节点的字段 */
export const ROOT_FIELDS = ALL_FIELDS.filter(f => f.toRoot);

/**
 * 从 source 节点提取所有 meta 字段到目标对象
 *
 * 自动处理 metaKey 映射（如 i18n → i18nKey），
 * 只拷贝 source 中有值的字段（跳过 undefined）。
 *
 * @param source TplNode 源
 * @param target 目标对象（通常是 NodeMetadata 正在构建的对象）
 * @returns 目标对象
 */
export function copyMetaFields(
    source: Record<string, any>,
    target: Record<string, any> = {}
): Record<string, any> {
    for (const def of META_FIELDS) {
        const val = source[def.field];
        if (val !== undefined) {
            const key = def.metaKey ?? def.field;
            target[key] = val;
        }
    }
    return target;
}

/**
 * 从 source 节点提取所有 root 级字段到目标对象
 */
export function copyRootFields(
    source: Record<string, any>,
    target: Record<string, any> = {}
): Record<string, any> {
    for (const def of ROOT_FIELDS) {
        const val = source[def.field];
        if (val !== undefined) {
            const key = def.metaKey ?? def.field;
            target[key] = val;
        }
    }
    return target;
}
