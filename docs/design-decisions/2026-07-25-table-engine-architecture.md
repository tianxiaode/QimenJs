# Table 引擎架构设计决策

> 日期：2026-07-25
> 状态：**部分过时** — 决策 1（五引擎分离）和决策 3（WeakMap 缓存）中的"引擎动态生成类"模式已过时，改为组件模式（见 2026-07-27-compile-engine-refactoring.md）。决策 2/4/5/6 仍有效。

## 决策 1：五引擎分离，同源消费 ColumnDef[]

**背景**：Table 需要数据行、表头、编辑浮层、分组统计行、整表统计行五种组件，它们共享列定义但结构不同。

**决策**：每个关注点一个独立引擎，统一接收 ColumnMetaManager：

```
ColumnDef[]
    │
    ├── HeaderEngine.compile(mgr)        → headerTpl → HeaderComponent
    ├── RowEngine.compile(mgr)           → rowTpl    → RowComponent
    ├── EditOverlayEngine.compile(mgr)   → editTpl   → EditOverlayComponent
    ├── GroupSummaryEngine.compile(mgr)  → summaryTpl → GroupSummaryComponent
    └── TableSummaryEngine.compile(mgr)  → totalTpl   → TableSummaryComponent
```

> **注意**：引擎现在只负责生成模板（tpl），不再动态生成类。
> 组件类（RowComponent 等）是预定义的，引擎产出的 tpl 作为参数注入。
> 详见 [2026-07-27-compile-engine-refactoring.md](./2026-07-27-compile-engine-refactoring.md)

**理由**：
- 单一职责，逻辑链路清晰
- 引擎不依赖引擎，都依赖 ColumnMetaManager
- 有配置才生成（editable 列才生成 editor slot，有 groupAggregator 才生成统计行）

## 决策 2：ColumnMetaManager 采用 NodeMapManager 模式

**背景**：列元数据需要集中管理、按需查询、懒缓存筛选。

**决策**：参照 NodeMapManager 模式——持有数据 + 提供查询 + 管理生命周期：

```ts
class ColumnMetaManager {
    compile(columns): void      // ColumnDefOrGroup[] → ColumnMeta[]
    get(name): ColumnMeta       // 按名称查询
    getAll(): ColumnMeta[]       // 全量
    getEditable(): ColumnMeta[] // 懒缓存筛选
    getGroupable(): ColumnMeta[]
    getSummarizable(): ColumnMeta[]
    dispose(): void
}
```

**理由**：逻辑内聚，引擎和 Table body 都通过 Manager 访问列信息，而非裸数组。

## 决策 3：引擎编译产物用 WeakMap 缓存

**背景**：同一套列定义反复调用 `Component.withTemplate` 编译是浪费。

**决策**：每个引擎静态持有 `WeakMap<ColumnDefOrGroup[], any>`，compile 时先查缓存：

```ts
class RowEngine {
    private static _cache = new WeakMap<ColumnDefOrGroup[], any>();
    static compile(mgr) {
        const cached = RowEngine._cache.get(mgr.rawColumns);
        if (cached) return cached;
        const compiled = RowEngine._doCompile(mgr);
        RowEngine._cache.set(mgr.rawColumns, compiled);
        return compiled;
    }
}
```

**理由**：
- 列定义通常是模块级常量，引用稳定 → 缓存永在
- 动态创建的列定义不可达时自动 GC
- 不使用 ComponentRegistrar，避免全局注册表膨胀
- 不使用 Map + string key，避免 JSON.stringify 对函数字段的问题
- 对外 API 不变：`Engine.compile(mgr)`

## 决策 4：Header resize 统一走 body.drags 声明式

**背景**：LeafHeaderCell 原生 mousedown/mousemove/mouseup 绕过框架拖拽系统。

**决策**：改用 `body.drags: { resizeHandle: { axis: 'x', activeClass } }` + `onResizeHandleDragStart/Move/End` 回调。

**理由**：
- 与框架 drag 系统一致，走 DragProcessor → DragDispatchCenter
- activeClass 由 DragDispatchCenter 自动管理
- 为后续列重排序（同样走 drags + DragEventBus）统一基础设施

## 决策 5：GroupHeaderCell resize 代理到最右子列

**背景**：Group 宽度 = `calc(子列 CSS 变量之和)`，Group 本身无独立宽度。

**决策**：Group 右边缘 resizeHandle 拖拽时，emit 的 colName 指向 `_childNames` 最后一个子列，上层 Table 更新 CSS 变量后 Group 宽度自动跟随。

**理由**：
- 不引入新的宽度管理机制
- 用户拖 Group 右边缘是直觉操作
- 最右子列的 CSS 变量更新后，Group 的 calc() 自动重算

## 决策 6：EditOverlay 走 OverlayDispatchCenter，彻底解耦

**背景**：内联编辑层需要浮动在单元格上方，但不应该耦合 Table/Row。

**决策**：EditOverlay 由 EditOverlayEngine 编译，运行时通过 OverlayDispatchCenter 定位（anchor 到目标 cell），与 Table 完全解耦。

**理由**：
- overlay 不知道 table 的存在，只知道"我被锚定到某个元素"
- 不需要镜像行布局（无 slot），只包含 input + save/cancel + error
- 列宽变化通过 anchor 自动跟随
- 可复用于非 table 场景