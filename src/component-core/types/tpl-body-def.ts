/**
 * Body 字段定义 — 单一真相源
 *
 * 与 tpl-node-def.ts（TplNode 字段定义）对称，
 * 本文件定义 body 中所有特殊字段的分类和处理方式。
 *
 * ══════════════════════════════════════════════════════════════
 * Body 在双层架构中的位置
 * ══════════════════════════════════════════════════════════════
 *
 * 新架构下，body 挂在内部类（InnerComponent）上，不在闭包基类上：
 *
 *   闭包基类（ComponentFactory）— 纯工厂，不持有 body
 *   内部类基类（InnerComponent）— 持有 body，是真正的组件
 *
 * withTemplate(templates, body) 时：
 *   1. 为每个模板编译生成内部类
 *   2. body 中的方法/getter/setter 挂到内部类原型上
 *   3. static 类字段挂到内部类构造函数上
 *   4. 闭包类只保存内部类引用，不处理 body
 *
 * ══════════════════════════════════════════════════════════════
 * Body 字段分类
 * ══════════════════════════════════════════════════════════════
 *
 * body 只接受以下四类内容：
 *
 * 1. static 类（编译时设为内部类静态属性）：
 *    type / entityKey / eventKey / floatKey / dragKey / listens / forwards / localDataKey
 *
 * 2. init 类（运行时由 InitAbility 初始化）：
 *    floats / drags / animation / abilities / nodes / localData
 *
 * 3. 其他（编译时挂内部类原型）：
 *    - 函数 → innerProto[key] = fn
 *    - getter/setter → Object.defineProperty(innerProto, key, desc)
 *
 * 不接受纯数据值（如 _pool: []、title: 'Hello'）：
 *    - 默认属性值 → 写在 TplNode 节点定义里
 *    - 实例内部状态 → 直接在类体声明（如 _items = []）
 *
 * ══════════════════════════════════════════════════════════════
 * static 字段说明
 * ══════════════════════════════════════════════════════════════
 *
 * ┌──────────┬──────────────────────────────────────────────────┐
 * │ 字段     │ 说明                                             │
 * ├──────────┼──────────────────────────────────────────────────┤
 * │ type     │ 组件类型标识，注册到 TemplateRegistrar          │
 * │ entityKey│ 实体 key，TplNode events 中 entities 引用        │
 * │ eventKey │ 桥接事件 key，TplNode events 中 bridges 引用     │
 * │ floatKey │ 浮动层 key                                       │
 * │ dragKey  │ 拖拽 key                                         │
 * │ listens  │ 统一事件订阅数组                                 │
 * │ forwards │ 跨组件层透传，编译时存为 _forwards 静态属性      │
 * │localDataKey│ 本地数据激活 key，声明组件渲染使用的数据源     │
 * └──────────┴──────────────────────────────────────────────────┘
 *
 * ══════════════════════════════════════════════════════════════
 * init 字段说明
 * ══════════════════════════════════════════════════════════════
 *
 * ┌──────────┬──────────────────────────────────────────────────┐
 * │ 字段     │ 说明                                             │
 * ├──────────┼──────────────────────────────────────────────────┤
 * │ floats   │ 浮动层配置，key=节点name，type+配置=构造参数     │
 * │ drags    │ 拖拽配置，key=节点name，行为配置+可选影子组件    │
 * │ animation│ 组件动画配置，声明式，初始化/销毁时自动触发      │
 * │ abilities│ 附加能力，替代 .with() 的声明式注入              │
 * │ nodes    │ 节点配置，声明式覆盖节点属性，替代 nodeOverrides │
 * │ localData│ 本地数据，key→数据数组，运行时自动注入组件      │
 * └──────────┴──────────────────────────────────────────────────┘
 *
 * ══════════════════════════════════════════════════════════════

 * ══════════════════════════════════════════════════════════════
 * 动画机制
 * ══════════════════════════════════════════════════════════════
 *
 * 动画是组件行为，不是节点属性，在 body 中声明式配置：
 *
 *   body: {
 *       animation: {
 *           enter: 'slideInUp',
 *           leave: 'slideOutDown',
 *           duration: 200,
 *       }
 *   }
 *
 * 运行时自动触发：
 * - enter: 组件初始化完成后自动播放
 * - leave: 组件销毁前自动播放
 *
 * 设计要点：
 * - 动画不属于 TplNode（DOM 骨架），而是组件运行时行为
 * - CSS transition 写在 TplNode 的 cls/style 里，不需要单独字段
 * - 进入/退出动画在 body.animation 声明，由框架自动触发
 * - 浮层动画由浮层组件自己管（如 Menu），触发组件（如 Button）只管 floats 声明
 *
 * ══════════════════════════════════════════════════════════════
 * 事件数据自动收集
 * ══════════════════════════════════════════════════════════════
 *
 * 事件数据通过三层声明式配置合并而成：
 *
 * 1. defaultEventData — 组件注册时声明的基础字段
 *    registrar.register('Button', ButtonComponent, { defaultEventData: ['name', 'text'] })
 *    registrar.register('Input', InputComponent,  { defaultEventData: ['name', 'getFormValue'] })
 *
 *    编译时自动合并到每条 rule.data 中
 *
 * 2. action — 节点声明的语义动作（TplNode.action）
 *    { action: 'save' } → 事件数据中自动包含 { action: 'save' }
 *    用于 entity/route 等语义化事件的标识
 *
 * 3. data — 节点声明的额外数据字段（TplNode.data）
 *    { data: ['name', 'getFormData'] } → 自动收集并合并
 *    { data: { emit: ['name'], entity: ['getEntityData'] } } → 按事件类型区分
 *    支持属性取值和方法调用两种方式
 *
 * 最终事件数据 = defaultEventData + action + data（合并，不覆盖）
 *
 * @example
 * ```ts
 * // Button 注册
 * registrar.register('Button', ButtonComponent, { defaultEventData: ['name', 'text'] })
 *
 * // 模板节点声明（节点级 data + action）
 * { tag: 'div', name: 'saveBtn', action: 'save', data: ['getFormData'] }
 *
 * // 编译后事件数据
 * // → { name: 'Save', text: '保存', action: 'save', formData: {...} }
 * ```
 *
 * ══════════════════════════════════════════════════════════════
 * nodes 节点配置机制
 * ══════════════════════════════════════════════════════════════
 *
 * body.nodes 统一替代 nodeOverrides 和 replace() 的 cls/itemsCls，
 * 在 body 中声明式配置节点属性，编译时提取为 ctor._nodes，运行时由 initNodeProps 应用。
 *
 * 字段语义：
 * - addCls: 追加 CSS 类（与现有 cls 拼接，替代 replace 的 cls/itemsCls）
 * - cls: 替换 CSS 类（覆盖 TplNode 中的 cls）
 * - hidden: 覆盖隐藏状态
 * - type: 替换子组件类型
 * - events: 替换事件声明（全量替换，不合并）
 * - initConfig: 合并子组件初始配置
 * - style/flex/grid/role/attrs: 覆盖对应属性
 *
 * 处理流程：
 *   1. applyBodyToClass → ctor._nodes = body.nodes（init 类别）
 *   2. updateNodeMetasFromOverrides → 更新 nodeMetas 中的 componentClass
 *   3. initNodeProps → applyNodeConfig 合并到 nodeProps → _updateNode
 *
 * 与 nodeOverrides 的关系：
 *   - body.nodes 是新方案（推荐），nodeOverrides 是旧方案（向后兼容）
 *   - 运行时先应用 body.nodes，再应用 nodeOverrides
 *   - replace() 的 cls/itemsCls 自动转为 body.nodes.addCls
 *
 * @example
 * ```ts
 * body: {
 *     nodes: {
 *         root: { addCls: 'q-form' },
 *         itemContainer: { addCls: 'q-form__fields' },
 *         fieldBody: { type: InputFieldBodyComponent, events: { actionClick: { handler: true } } },
 *         dropIcon: { hidden: false },
 *     }
 * }
 * ```
 */

export interface BodyKeyDef {
    /** 字段分类：static → 编译时设为类静态属性；init → 运行时由 InitAbility 初始化；hook → 实例化时由框架调用 */
    category: 'static' | 'init' | 'hook';
    /** 静态属性别名（如 forwards → _forwards） */
    alias?: string;
}

export const BODY_SPECIAL_KEYS: Record<string, BodyKeyDef> = {
    // ─── static: 编译时设为类静态属性 ───

    type: { category: 'static' },
    entityKey: { category: 'static' },
    eventKey: { category: 'static' },
    floatKey: { category: 'static' },
    dragKey: { category: 'static' },
    listens: { category: 'static' },
    forwards: { category: 'static', alias: '_forwards' },
    localDataKey: { category: 'static' },

    // ─── init: 运行时由 InitAbility 初始化 ───

    floats: { category: 'init' },
    drags: { category: 'init' },
    animation: { category: 'init' },
    abilities: { category: 'init' },
    nodes: { category: 'init' },
    localData: { category: 'init' },

    // ─── hook: 实例化时由框架调用 ───

    // ─── overrides: 声明需要链式调用的方法名列表 ───

    overrides: { category: 'static' },

    // ─── replaces: 声明直接覆盖（不走继承链）的方法名列表 ───

    replaces: { category: 'static' },
};
