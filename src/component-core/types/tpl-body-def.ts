/**
 * Body 字段定义 — 单一真相源
 *
 * 与 tpl-node-def.ts（TplNode 字段定义）对称，
 * 本文件定义 body 中所有特殊字段的分类和处理方式。
 *
 * ══════════════════════════════════════════════════════════════
 * Body 字段分类
 * ══════════════════════════════════════════════════════════════
 *
 * body 只接受以下三类内容：
 *
 * 1. static 类（编译时设为类静态属性）：
 *    type / entityKey / eventKey / floatKey / dragKey / listens / forwards
 *
 * 2. init 类（运行时由 InitAbility 初始化）：
 *    floats / drags / abilities
 *
 * 3. 其他（编译时挂原型）：
 *    - 函数 → proto[key] = fn
 *    - getter/setter → Object.defineProperty(proto, key, desc)
 *
 * 不接受纯数据值（如 _pool: []、title: 'Hello'）：
 *    - 默认属性值 → 写在 TplNode 节点定义里
 *    - 实例内部状态 → 推荐使用 _applyState 模式
 *
 * ══════════════════════════════════════════════════════════════
 * static 字段说明
 * ══════════════════════════════════════════════════════════════
 *
 * ┌──────────┬──────────────────────────────────────────────────┐
 * │ 字段     │ 说明                                             │
 * ├──────────┼──────────────────────────────────────────────────┤
 * │ type     │ 组件类型标识，注册到 ComponentRegistrar          │
 * │ entityKey│ 实体 key，TplNode events 中 entities 引用        │
 * │ eventKey │ 桥接事件 key，TplNode events 中 bridges 引用     │
 * │ floatKey │ 浮动层 key                                       │
 * │ dragKey  │ 拖拽 key                                         │
 * │ listens  │ 统一事件订阅数组                                 │
 * │ forwards │ 跨组件层透传，编译时存为 _forwards 静态属性      │
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
 * └──────────┴──────────────────────────────────────────────────┘
 *
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
 */

export interface BodyKeyDef {
    /** 字段分类：static → 编译时设为类静态属性；init → 运行时由 InitAbility 初始化 */
    category: 'static' | 'init';
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

    // ─── init: 运行时由 InitAbility 初始化 ───

    floats: { category: 'init' },
    drags: { category: 'init' },
    animation: { category: 'init' },
    abilities: { category: 'init' },
};
