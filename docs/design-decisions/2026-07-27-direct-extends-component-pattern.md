# Direct Extends 组件模式重构

> 日期：2026-07-27
> 状态：已决定，待实施

## 1. 背景

当前组件通过 `Component.withTemplate({ tpl, body, tplEvents })` 创建，`createInnerClass` 内部生成匿名类并展开 body。问题：

- **body 是间接定义**：方法、getter、生命周期钩子全塞在 body 对象里，IDE 无法 Go to Definition，重构困难
- **匿名类**：`createInnerClass` 返回的 InnerClass 无名，TS 推导弱，调试栈难读
- **overrides/BodyMerger 模拟继承**：`wrapOverrideMethodsOnProto` + `collectOverrideHooks` + `BodyMerger.merge` 本质是在模拟 `super()`，复杂且脆弱
- **单测困难**：必须走 `createInnerClass` 管线才能拿到可实例化的类，无法直接测方法

## 2. 决策

### 组件直接 extends TemplateComponent，body 彻底消除

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
    static type = 'Button';

    onAfterInit(props?: ButtonProps): void {
        this.update(props);
    }

    update(props?: Partial<ButtonProps>): void {
        if (props?.icon !== undefined) this.icon = props.icon;
        if (props?.text !== undefined) this.text = props.text;
        this.size = props?.size || 'md';
    }
}

ButtonComponent
    .withTemplate({ tpl, tplEvents })
    .with([SizeAbility]);
```

### 核心原则

1. **具名 class**：组件是具名类，不是匿名 InnerClass
2. **body 消除**：方法直接写在 class 里，元数据用 static 字段
3. **原生继承**：方法/逻辑派生用 `extends`，super() 自然调用，overrides/BodyMerger 删除
4. **replace 保留**：模板派生（tplReplaces/nodeOverrides/cls）仍用 `replace()`，与 extends 正交
5. **withTemplate/with/replace 内置为 static**：在 TemplateComponent 上定义，子类直接调用

## 3. 新 API 设计

### 3.1 TemplateComponent 新增 static 方法

```ts
class TemplateComponent extends ComposableBase {
    // ... 现有实例属性和方法 ...

    /**
     * 编译模板并注入到类静态属性
     *
     * 不创建新类，只编译 tpl → 挂 _cache/_nodeMetas → 生成子节点属性 → 编译 tplEvents
     * 返回 this（类本身），支持链式调用
     */
    static withTemplate(this: any, templates: { tpl: TplNode; tplEvents?: TplEvents }): any {
        const { cache, nodeMetas } = TemplateCompiler.compile(templates.tpl, this);

        this._tpl = templates.tpl;
        this._cache = cache;
        this._nodeMetas = nodeMetas;
        this._i18nNodes = cache.i18nNodes;
        this._templateCompiled = true;

        applyChildNodeProps(this, nodeMetas, cache.i18nNodes);

        if (templates.tplEvents && Object.keys(templates.tplEvents).length > 0) {
            this._tplEvents = templates.tplEvents;
            this._delegatedEventRules = DelegatedEventEngine.compileTplEvents(templates.tplEvents);
        }

        return this;
    }

    /**
     * 追加能力，返回 this 支持链式调用
     */
    static with(this: any, abilities: AbilityDefinition[]): any {
        withAbilities(this, abilities);
        return this;
    }

    /**
     * 工厂方法
     */
    static create(this: any, props?: Record<string, any>): any {
        return new this(props);
    }

    /**
     * 模板派生 — 基于当前类的编译产物派生新模板
     *
     * 只处理模板层面：TemplateDeriver + nodeOverrides + tplEvents 合并 + cls
     * 不碰 body（body 不存在），不碰方法（方法继承用 extends）
     * 返回 this（类本身），就地替换编译产物
     */
    static replace(this: any, options: {
        cls?: string;
        itemsCls?: string;
        nodeOverrides?: Record<string, Record<string, any>>;
        tplReplaces?: Record<string, TplNode>;
        tplEvents?: TplEvents;
    }): any {
        const { cls, itemsCls, nodeOverrides, tplReplaces, tplEvents } = options;
        const hasTplReplaces = tplReplaces && Object.keys(tplReplaces).length > 0;

        let cache, nodeMetas;
        if (hasTplReplaces) {
            ({ cache, nodeMetas } = TemplateDeriver.deriveWithTplReplaces(
                this._cache, this._nodeMetas, tplReplaces, nodeOverrides, this
            ));
        } else {
            ({ cache, nodeMetas } = TemplateDeriver.derive(
                this._cache, this._nodeMetas, nodeOverrides
            ));
        }

        this._cache = cache;
        this._nodeMetas = nodeMetas;
        this._i18nNodes = cache.i18nNodes;

        if (hasTplReplaces) {
            applyChildNodeProps(this, nodeMetas, cache.i18nNodes);
        }

        if (tplEvents) {
            const merged = mergeTplEvents(this._tplEvents, tplEvents);
            this._tplEvents = merged;
            this._delegatedEventRules = DelegatedEventEngine.compileTplEvents(merged);
        }

        if (cls) {
            this._nodes = { ...(this._nodes || {}), root: { addCls: cls } };
        }
        if (itemsCls) {
            this._nodes = { ...(this._nodes || {}), itemContainer: { addCls: itemsCls } };
        }

        return this;
    }
}
```

### 3.2 元数据用 static 字段

body 中所有结构性数据改为 static 字段：

| 原 body 字段 | 新写法 | 引擎读取位置（不变） |
|-------------|--------|-------------------|
| `body.type` | `static type = 'Button'` | `ctor.type` |
| `body.entityKey` | `static entityKey = 'btn'` | `ctor.entityKey` |
| `body.eventKey` | `static eventKey = 'btn'` | `ctor.eventKey` |
| `body.forwards` | `static _forwards = { title: 'header.title' }` | `ctor._forwards` |
| `body.floats` | `static _floats = [...]` | `ctor._floats` |
| `body.drags` | `static _drags = [...]` | `ctor._drags` |
| `body.animation` | `static _animation = {...}` | `ctor._animation` |
| `body.nodes` | `static _nodes = { root: { addCls: '...' } }` | `ctor._nodes` |
| `body.overrides` | **删除** | 原生 super 替代 |
| `body.replaces` | **删除** | 原生 super 替代 |

### 3.3 派生：extends 管方法，replace 管模板

**extends 和 replace 正交**：
- `extends` — 方法/逻辑继承，super() 自然调用
- `replace` — 模板派生（nodeOverrides/tplReplaces/cls），就地替换编译产物

```ts
// 场景1：只改方法，模板不变 — 纯 extends
class DropdownButton extends ButtonComponent {
    static type = 'Dropdown';
    onAfterInit(props) { super.onAfterInit(props); this._initDropdown(); }
}
// 无需调 replace，继承父类模板

// 场景2：方法 + 模板都要改 — extends + replace
class ButtonGroupComponent extends ItemGroupPooledComponent {
    static type = 'ButtonGroup';
    onAfterInit(props) { super.onAfterInit(props); this._initGroup(); }
}
ButtonGroupComponent.replace({
    cls: 'q-button-group',
    itemsCls: 'q-button-group__items',
    tplEvents: { itemContainer: { $items: { Toggle: { toggle: { emits: ['toggle'] } } } } },
});

// 场景3：只改模板，方法不变 — 纯 replace
CustomDialogComponent.replace({
    nodeOverrides: { header: { type: CustomHeaderComponent } },
    tplReplaces: { body: { tag: 'div', cls: 'custom-body' } },
});
```

**replace 不再创建新类**，就地修改当前类的 `_cache/_nodeMetas/_tplEvents`，返回 this 支持链式。

### 3.4 构造函数

TemplateComponent 基类构造函数统一处理初始化：

```ts
class TemplateComponent extends ComposableBase {
    constructor(props?: Record<string, any>) {
        super();
        RuntimeEngine.init(this, props);
    }
}
```

子类**不需要写 constructor**，除非有特殊初始化需求：

```ts
class ButtonComponent extends TemplateComponent {
    // 不写 constructor → 自动走 TemplateComponent 构造函数
    // ...
}

class SpecialComponent extends TemplateComponent {
    constructor(props?: any) {
        super(props);  // 显式传递
        // 额外初始化
    }
}
```

## 4. 可删除的代码

| 模块/函数 | 原因 |
|----------|------|
| `Component` 类 | 工厂层不再需要，withTemplate/with/replace 移入 TemplateComponent |
| `createInnerClass` | 不再创建匿名内部类 |
| `createDerivedInnerClass` | replace 不再创建新类，就地修改编译产物 |
| `applyBodyToClass` | body 不存在，方法直接在 class 里 |
| `BodyMerger` | body 不存在，无需合并 |
| `collectOverrideHooks` | 原生 super 替代 |
| `wrapOverrideMethodsOnProto` | 原生 super 替代 |
| `executeOverrideQueue` | 原生 super 替代 |
| `validateBodyKey` | body 不存在 |
| `BODY_SPECIAL_KEYS` | body 不存在 |
| `extractBodyFromOptions` | replace 不再从 options 提取 body |
| `attachStaticMethods` | withTemplate/with/replace/create 积入 TemplateComponent |

**保留**：`TemplateCompiler`、`TemplateDeriver`、`DelegatedEventEngine`、`RuntimeEngine`、`applyChildNodeProps` — 这些引擎/工具函数不变。

## 5. RuntimeEngine 适配

RuntimeEngine.init 读取元数据的位置**完全不变**：

```ts
// 之前从 InnerClass 静态属性读
const ctor = instance.constructor;
ctor._cache      // ← 不变
ctor._nodeMetas  // ← 不变
ctor._forwards   // ← 不变
ctor._floats     // ← 不变
ctor.type        // ← 不变
```

唯一变化：`ctor._body` 不再存在。RuntimeEngine 中读 `_body` 的地方需逐个检查，改为读 static 字段或 class 原型。

## 6. 优势总结

| 维度 | 之前 | 之后 |
|------|------|------|
| 组件定义 | body 对象间接定义 | class 直接定义 |
| 类型推导 | 匿名 InnerClass，推导弱 | 具名 class，推导完整 |
| IDE 支持 | Go to Definition 断 | 完整支持 |
| 单测 | 必须走 createInnerClass | 直接 new ClassName() |
| 派生 | replace + BodyMerger + overrides | extends 管方法 + replace 管模板 |
| 元数据 | body 特殊字段 | static 字段，直觉清晰 |
| 代码量 | createInnerClass + createDerivedInnerClass + BodyMerger + overrides 机制 ≈ 200行 | 删除，TemplateComponent 新增 withTemplate/with ≈ 30行 |

## 7. 实施步骤

### Phase 1：TemplateComponent 增加 static 方法

1. 在 TemplateComponent 上实现 `static withTemplate`（编译 + 挂载，不创建新类）
2. 在 TemplateComponent 上实现 `static with`（链式追加能力）
3. 在 TemplateComponent 上实现 `static create`（工厂方法）
4. 在 TemplateComponent 上实现 `static replace`（模板派生，就地替换编译产物）
5. TemplateComponent 构造函数加入 `RuntimeEngine.init(this, props)`

### Phase 2：迁移一个简单组件验证

6. 选 ButtonComponent 作为首个迁移目标
7. 改为 `class ButtonComponent extends TemplateComponent` + static 字段 + `.withTemplate().with()`
8. 跑通 ButtonComponent 所有单测
9. 验证 RuntimeEngine.init 流程完整

### Phase 3：迁移一个 replace 场景验证

10. 选 ButtonGroupComponent（当前用 ItemGroupPooledComponent.replace）作为 replace 验证目标
11. 改为 `class extends ItemGroupPooledComponent` + `.replace({ cls, itemsCls, tplEvents })`
12. 跑通 ButtonGroupComponent 所有单测

### Phase 4：迁移所有组件

13. 逐个迁移现有组件（Input、Dialog、Header、Tab 等）
14. 每迁移一个，跑对应单测

### Phase 5：清理旧代码

15. 删除 Component 类
16. 删除 createInnerClass / createDerivedInnerClass
17. 删除 BodyMerger
18. 删除 overrides 相关（collectOverrideHooks / wrapOverrideMethodsOnProto / executeOverrideQueue）
19. 删除 applyBodyToClass / validateBodyKey / BODY_SPECIAL_KEYS
20. 清理 RuntimeEngine 中对 `_body` 的引用

### Phase 6：文档更新

21. 更新 withtemplate-best-practices.md
22. 更新 ui-component-design.md
23. 更新 component-core.md

## 8. 风险与注意事项

- **RuntimeEngine.init 中读 `_body` 的地方**：需逐个排查，改为读 static 字段或跳过
- **replace 就地修改**：replace 不再创建新类，就地修改 `_cache/_nodeMetas`。如果多个派生类基于同一个父类 replace，会互相覆盖。需要确认：replace 是在子类上调还是父类上调？**答案：在子类上调**，子类先 extends 继承方法，再 replace 修改自己的模板，互不影响。
- **现有单测**：大量测试基于旧 API，需同步迁移
- **ComponentRegistrar 注册**：注册逻辑不变，`register('button', ButtonComponent)` 照常