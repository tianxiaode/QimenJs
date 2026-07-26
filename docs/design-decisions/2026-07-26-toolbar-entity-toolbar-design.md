# Toolbar + EntityToolbar 工具栏设计

## 背景

原有 ToolbarComponent 是 ItemGroupStatic 的简单派生，缺少分页/CRUD 场景的内置支持。用户每次使用都需要手动添加按钮、绑定事件、管理分页状态，重复工作量大。

## 决策

拆为两层组件：

1. **ToolbarComponent** — 极简空容器，用户自由添加任意子组件
2. **EntityToolbarComponent** — 从 Toolbar 派生，内置分页+CRUD 按钮定义，按 items 配置点菜构建

## 原因

- 空 Toolbar 有独立用途（纯自定义按钮组、导航栏等），不应被实体逻辑污染
- EntityToolbar 面向实体场景，内置定义减少重复配置，但不应强制所有工具栏都带分页/CRUD
- 扁平 items 定义比嵌套 group 结构更直观：`{ create: true }` 比 `{ group: { crud: { create: true } } }` 简洁

## 影响

- 新增 `src/component/entity-toolbar/` 目录
- ToolbarComponent 回归极简（仅 nodes + tplEvents）
- register.ts 新增 EntityToolbar 注册
- component-events.ts 新增 PAGINATION_EVENTS / CRUD_EVENTS

## 替代方案

1. **单组件 + group 嵌套配置** — `{ group: { pagination: {...}, crud: {...} } }`：层级深，配置冗长
2. **运行时动态创建按钮** — 不用 BUILTIN_DEFS，每次 onAfterInit 都 new Button()：性能差，无法利用 tplEvents 声明式

## 实施细节

### items 扁平定义

```typescript
// EntityToolbarItems = Record<string, boolean | EntityToolbarItemDef>
new EntityToolbarComponent({
    items: {
        // 内置名：true 启用默认配置
        create: true,
        // 内置名：对象合并覆盖
        edit: { iconCls: 'fa-pen-to-square' },
        // 内置名：false 屏蔽
        delete: false,
        // 自定义名：自由定义
        filter: { type: 'Select', name: 'filter', order: 195, options: [...] },
    },
    entityKey: 'user',
    eventKey: 'userToolbar',
})
```

### order 布局

| 区间 | 用途 | order 示例 |
|------|------|-----------|
| <100 | 分页前插入 | 50 |
| 100-180 | 分页组 | firstPage=100, search=180 |
| 190-199 | 分页与CRUD之间 | 195 |
| 200-300 | CRUD组 | create=200, help=300 |
| >300 | CRUD后插入 | 400 |

### tplEvents 声明式

```typescript
tplEvents: {
    itemContainer: {
        $items: {
            Button: { click: {@{ emits: ['action'], entities: true, bridges: ['action'], keyProp: 'name' } },
            Input: { input: { emits: ['inputChange'], keyProp: 'name', data: ['getFormValue'] } },
            NumberInput: { input: { emits: ['inputChange'], keyProp: 'name', data: ['getFormValue'] } },
            Select: { 'select:change': { emits: ['selectChange'], keyProp: 'name', data: ['getFormValue'] } },
        },
    },
},
```

- `entities: true` + `keyProp: 'name'` → Button(name='save') click 自动 entityEmit('save')
- `bridges: ['action']` → 自动 bridgeEmit
- `data: ['getFormValue']` → 自动调用 instance.get*FormValue() 合入事件数据
- search 的 input 事件自动转发为 `searchInputChange`，外部直接监听即可

### DomainAbility

EntityToolbar 通过 `.with([DomainAbility])` 注入域能力，pageSize/pagesizes 直接从 `this.domainConfig` 读取默认值。

## 后续工作

- [ ] 补充 EntityToolbarComponent 单元测试
- [ ] download 按钮功能实现（当前仅预留位置）
- [ ] 考虑 toolbar 折叠模式（q-collapsed 隐藏文本只显示图标）