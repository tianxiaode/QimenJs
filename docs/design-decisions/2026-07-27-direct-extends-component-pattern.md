# Direct Extends 组件模式重构

> 日期：2026-07-27
> 状态：已决定，实施中

## 1. 背景

当前组件通过 `Component.withTemplate({ tpl, body, tplEvents })` 创建，`createInnerClass` 内部生成匿名类并展开 body。问题：

- **body 是间接定义**：方法、getter、生命周期钩子全塞在 body 对象里，IDE 无法 Go to Definition，重构困难
- **匿名类**：`createInnerClass` 返回的 InnerClass 无名，TS 推导弱，调试栈难读
- **overrides/BodyMerger 模拟继承**：`wrapOverrideMethodsOnProto` + `collectOverrideHooks` + `BodyMerger.merge` 本质是在模拟 `super()`，复杂且脆弱
- **单测困难**：必须走 `createInnerClass` 管线才能拿到可实例化的类，无法直接测方法

## 2. 决策

### 组件直接 extends TemplateComponent，声明式定义 + 显式 compile()

```ts
// 之前
export let ButtonComponent = Component.withTemplate({
    tpl: { tag: 'div', cls: 'q-button', children: [...] },
    tplEvents: { '': { click: { emits: ['click'] } } },
    body: {
        type: 'Button',
        onAfterInit(props) { this.update(props); },
        update(props) { ... },
    },
}).with([SizeAbility]);

// 之后
class ButtonComponent extends TemplateComponent {
    type = 'Button';

    static tpl = {
        tag: 'div', cls: 'q-button',
        children: [
            { tag: 'i', name: 'icon', cls: 'q-button__icon' },
            { tag: 'span', name: 'text', cls: 'q-button__text' },
            { tag: 'i', name: 'dropIcon', cls: 'q-expand-arrow ...', hidden: true },
        ],
    };
    static events = { '': { click: { emits: ['click'] } } };
    static use = [SizeAbility];

    onAfterInit(props?: ButtonProps): void {
        this.initSize();
        this.update(props);
    }

    update(props?: Partial<ButtonProps>): void {
        if (props?.icon !== undefined) this.icon = props.icon;
        if (props?.text !== undefined) this.text = props.text;
        this.size = props?.size || 'md';
    }
}
ButtonComponent.compile();
```

### 核心原则

1. **具名 class**：组件是具名类，不是匿名 InnerClass
2. **body 消除**：方法直接写在 class 里，元数据按归属分布
3. **原生继承**：方法/逻辑派生用 `extends`，super() 自然调用，overrides/BodyMerger 删除
4. **声明式定义**：tpl/events/use/replaceTpl 全部在类内 static 声明
5. **显式 compile()**：类定义后调 `Xxx.compile()` 触发预编译，框架组件全部预编译
6. **两条腿走路**：预编译型调 compile()，运行时型不调（引擎现场遍历 tpl）

## 3. 元数据归属

body 中每个字段按语义归到最自然的位置，**不设 static config**：

| 原 body 字段 | 新归属 | 理由 |
|-------------|--------|------|
| `type` | 实例属性 `type = 'Button'` | 组件类型标识，实例级，注册靠 `register('button', Cls)` |
| `entityKey` | 实例属性，运行时从 props 传入 | 声明"我要发实体事件"，同一类不同实例 key 不同 |
| `eventKey` | 实例属性，运行时从 props 传入 | 声明"我要发桥接事件"，同 entityKey |
| `forwards` | `static tpl` 内 `forwards` 字段 | 预编译生成 getter/setter，属于模板结构 |
| `floats` | 实例属性，运行时从 props 传入 | tooltip 等运行时能力，按实例配置 |
| `drags` | 实例属性，运行时从 props 传入 | 拖放运行时能力 |
| `animation` | 实例属性，运行时从 props 传入 | 动画运行时能力 |
| `nodes` | 合并进 `static replaceTpl` | 本质是节点替换/覆盖，模板层的事 |
| `overrides` | **删除** | 原生 super 替代 |
| `replaces` | **删除** | 原生 super 替代 |

### 类内三区

```ts
class XxxComponent extends TemplateComponent {
    // ── 实例属性（运行时配置）──
    type = 'Xxx';

    // ── static 声明（模板 + 能力）──
    static tpl = { ... };
    static events = { ... };
    static use = [SomeAbility];
    // 或派生时：
    static replaceTpl = { cls: '...', nodeOverrides: { ... } };

    // ── 方法（逻辑）──
    onAfterInit(props) { ... }
    update(props) { ... }
}
XxxComponent.compile();
```

## 4. compile() 实现

```ts
static compile(this: any): any {
    // 校验：tpl/events/use/replaceTpl 必须是 static
    const proto = this.prototype;
    for (const key of ['tpl', 'events', 'use', 'replaceTpl']) {
        if (Object.prototype.hasOwnProperty.call(proto, key)) {
            throw new Error(`${this.name}: ${key} must be static, did you forget 'static'?`);
        }
    }

    // 全编译模式：own tpl（遮蔽父类）
    if (Object.prototype.hasOwnProperty.call(this, 'tpl')) {
        const { cache, nodeMetas } = TemplateCompiler.compile(this.tpl, this);
        this._tpl = this.tpl;
        this._cache = cache;
        this._nodeMetas = nodeMetas;
        this._i18nNodes = cache.i18nNodes;
        applyChildNodeProps(this, nodeMetas, cache.i18nNodes);
    }

    // 派生模式：replaceTpl（基于继承的 _cache 派生）
    if (this.replaceTpl) {
        const { cls, itemsCls, nodeOverrides, tplReplaces } = this.replaceTpl;
        const hasTplReplaces = tplReplaces && Object.keys(tplReplaces).length > 0;

        let cache, nodeMetas;
        if (hasTplReplaces) {
            ({ cache, nodeMetas } = TemplateDeriver.deriveWithTplReplaces(
                this._cache, this._nodeMetas, tplReplaces, nodeOverrides, this
            ));
        } else if (nodeOverrides && Object.keys(nodeOverrides).length > 0) {
            ({ cache, nodeMetas } = TemplateDeriver.derive(
                this._cache, this._nodeMetas, nodeOverrides
            ));
        }

        if (cache) {
            this._cache = cache;
            this._nodeMetas = nodeMetas;
            this._i18nNodes = cache.i18nNodes;
            applyChildNodeProps(this, nodeMetas, cache.i18nNodes);
        }

        // cls/itemsCls → _nodes
        if (cls || itemsCls) {
            const nodesConfig: Record<string, any> = this._nodes ? { ...this._nodes } : {};
            if (cls) nodesConfig.root = { ...(nodesConfig.root || {}), addCls: cls };
            if (itemsCls) nodesConfig.itemContainer = { ...(nodesConfig.itemContainer || {}), addCls: itemsCls };
            this._nodes = nodesConfig;
        }
    }

    // 继承模式：无 own tpl 也无 replaceTpl → 复用父类编译产物

    // 编译 events（与父类 _tplEvents 合并）
    if (this.events) {
        const parentEvents = this._tplEvents;
        const merged = parentEvents ? mergeTplEvents(parentEvents, this.events) : this.events;
        this._tplEvents = merged;
        this._delegatedEventRules = DelegatedEventEngine.compileTplEvents(merged);
    }

    // 注入能力
    if (this.use) {
        withAbilities(this, this.use);
    }

    this._compiled = true;
    this._templateCompiled = true;
    return this;
}
```

### 三种编译模式

| 模式 | 触发条件 | 行为 |
|------|---------|------|
| 全编译 | `this.hasOwnProperty('tpl')` | 编译 own tpl，遮蔽父类 |
| 派生 | `this.replaceTpl` 存在 | 基于继承的 _cache 派生 |
| 继承 | 两者皆无 | 复用父类编译产物，零开销 |

### static 覆盖机制

JS static 属性通过原型链继承：
- 子类定义 `static tpl` → 创建 own property，**遮蔽**父类 tpl（全编译模式）
- 子类定义 `static replaceTpl` → 不同属性名，不遮蔽父类 tpl（派生模式）
- `compile()` 写 `this._cache = ...` → 在子类自身创建 own property，**不污染**父类

## 5. 派生示例

```ts
// 场景1：只改方法，模板不变 — 纯 extends
class DropdownButton extends ButtonComponent {
    type = 'Dropdown';
    onAfterInit(props) { super.onAfterInit(props); this._initDropdown(); }
}
DropdownButton.compile(); // 继承模式，复用父类编译产物

// 场景2：方法 + 模板都要改 — extends + replaceTpl
class ButtonGroupComponent extends ItemGroupPooledComponent {
    type = 'ButtonGroup';
    static replaceTpl = {
        cls: 'q-button-group',
        itemsCls: 'q-button-group__items',
    };
    static events = {
        itemContainer: { $items: { Toggle: { toggle: { emits: ['toggle'] } } } },
    };
    onAfterInit(props) { super.onAfterInit(props); this._initGroup(); }
}
ButtonGroupComponent.compile(); // 派生模式

// 场景3：只改模板，方法不变 — 纯 replaceTpl
class CustomDialogComponent extends DialogComponent {
    static replaceTpl = {
        nodeOverrides: { header: { type: CustomHeaderComponent } },
        tplReplaces: { body: { tag: 'div', cls: 'custom-body' } },
    };
}
CustomDialogComponent.compile();
```

## 6. 构造函数

TemplateComponent 基类构造函数统一处理初始化：

```ts
class TemplateComponent extends ComposableBase {
    constructor(props?: Record<string, any>) {
        super();
        RuntimeEngine.init(this, props);
    }
}
```

子类**不需要写 constructor**，除非有特殊初始化需求。

## 7. RuntimeEngine 适配

### 双模式过渡

迁移期间 RuntimeEngine 同时支持新旧两种模式：

```ts
// type：新模式读实例属性，旧模式读 ctor.type
instance.type = instance.type ?? ctor.type;

// floats/drags：新模式读实例属性，旧模式读 ctor._floats / ctor._drags
const floats = instance.floats ?? ctor._floats;
const drags = instance.drags ?? ctor._drags;

// 生命周期钩子：新模式直接调用，旧模式走 overrideQueue
if (ctor._compiled) {
    // 新模式：直接调用实例方法（原生 super 链）
    instance.onInitState?.();
} else {
    // 旧模式：overrideQueue
    executeOverrideQueue(instance, 'onInitState');
}
```

### 最终状态（旧模式删除后）

- `instance.type` 直接可用（实例属性）
- `instance.floats` / `instance.drags` 直接可用
- 生命周期钩子直接调用，无 overrideQueue（step-on-init-state / step-on-before-init / step-on-after-init 三个独立步骤）
- `ctor._cache` / `ctor._nodeMetas` / `ctor._tplEvents` 不变
- 管线异步化：`InitStep` 支持 `void | Promise<void>`，`runPhase` 为 async
- 子组件 self-mount：MOUNT 阶段 buildDOM 后自行挂载到父占位符，骨架立即可见
- INSTANTIATE 阶段通过 GlobalTaskQueue 队列化子组件创建

## 8. 可删除的代码

| 模块/函数 | 原因 |
|----------|------|
| `Component` 类 | 工厂层不再需要 |
| `createInnerClass` | 不再创建匿名内部类 |
| `createDerivedInnerClass` | replaceTpl 在 compile() 中处理 |
| `applyBodyToClass` | body 不存在，方法直接在 class 里 |
| `BodyMerger` | body 不存在，无需合并 |
| `collectOverrideHooks` | 原生 super 替代 |
| `wrapOverrideMethodsOnProto` | 原生 super 替代 |
| `executeOverrideQueue` | 原生 super 替代，已删除 step-override-queue.ts，拆为 3 个独立步骤 |
| `validateBodyKey` | body 不存在 |
| `BODY_SPECIAL_KEYS` | body 不存在 |
| `extractBodyFromOptions` | replace 不再从 options 提取 body |
| `attachStaticMethods` | compile/create 积入 TemplateComponent |

**保留**：`TemplateCompiler`、`TemplateDeriver`、`DelegatedEventEngine`、`RuntimeEngine`、`applyChildNodeProps`

## 9. 优势总结

| 维度 | 之前 | 之后 |
|------|------|------|
| 组件定义 | body 对象间接定义 | class 直接定义，声明内聚 |
| 类型推导 | 匿名 InnerClass，推导弱 | 具名 class，推导完整 |
| IDE 支持 | Go to Definition 断 | 完整支持 |
| 单测 | 必须走 createInnerClass | 直接 new ClassName() |
| 派生 | replace + BodyMerger + overrides | extends 管方法 + replaceTpl 管模板 |
| 元数据 | body 特殊字段散落 | 实例属性 + static tpl/events/use，各归各位 |
| 编译 | 隐式（withTemplate 内） | 显式 compile()，两条腿走路 |
| 代码量 | createInnerClass + ... ≈ 200行 | 删除，TemplateComponent 新增 compile ≈ 50行 |

## 10. 实施步骤

### Phase 1：TemplateComponent 增加 compile/create + 构造函数

1. TemplateComponent 添加 `constructor(props)` 调用 `RuntimeEngine.init(this, props)`
2. TemplateComponent 添加 `static compile()`
3. TemplateComponent 添加 `static create()`
4. TemplateFactory 旧模式构造函数改为 `super(props)` 避免双重初始化
5. RuntimeEngine 适配双模式（instance.type / instance.floats / 直接调用钩子）

### Phase 2：迁移 ButtonComponent

6. 改为 `class ButtonComponent extends TemplateComponent` + 实例属性 + static 声明 + `compile()`
7. 跑通 ButtonComponent 所有单测

### Phase 3：迁移 ButtonGroupComponent（replace 场景）

8. 改为 `class extends ItemGroupPooledComponent` + `static replaceTpl` + `compile()`
9. 跑通 ButtonGroupComponent 所有单测

### Phase 4：迁移所有组件

10. 逐个迁移现有组件
11. 每迁移一个，跑对应单测

### Phase 5：清理旧代码

12. 删除 Component / createInnerClass / createDerivedInnerClass / BodyMerger / overrides 机制
13. 删除 applyBodyToClass / validateBodyKey / BODY_SPECIAL_KEYS
14. RuntimeEngine 移除旧模式分支

### Phase 6：文档更新

15. 更新 withtemplate-best-practices.md
16. 更新 ui-component-design.md
17. 更新 component-core.md

## 11. 风险与注意事项

- **双重初始化**：TemplateComponent 构造函数调 RuntimeEngine.init，旧模式 InnerClass 也有构造函数。需将旧模式改为 `super(props)` 避免双重调用
- **static 遗漏**：compile() 中校验 `prototype.hasOwnProperty('tpl')` 等，漏写 static 必被抓到
- **replaceTpl 就地修改**：compile() 写 `this._cache` 在子类自身创建 own property，不污染父类
- **events 合并**：子类 `static events` 与父类 `_tplEvents` 合并（加法语义），tpl 是替换语义
- **现有单测**：大量测试基于旧 API，需同步迁移
- **ComponentRegistrar 注册**：注册逻辑不变，`register('button', ButtonComponent)` 照常
