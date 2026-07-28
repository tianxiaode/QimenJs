# 事件委托新方案：action 路径 + 监听驱动 + 前缀匹配

> 日期：2026-07-29
> 状态：设计确认，待实施

## 问题背景

旧方案中事件委托存在以下问题：

1. **emits 写在 TplNode 节点上**，事件定义分散在模板各处，难以全局把握
2. **action 只是事件数据**，不能驱动事件，必须配合 emits 才能工作
3. **COMPONENT_ROOT 阻断委托穿透**，父组件委托无法跨子组件边界
4. **无条件绑定**，tplEvents 声明了就绑定，不管有没有人监听
5. **ItemContainer 模式**靠 `$items` + `keyProp` 特殊处理，与普通节点逻辑不统一

## 新方案核心

### 三条规则

| 规则 | 说明 |
|------|------|
| **tplEvents 是唯一事件定义入口** | 节点上不写 emits/action，所有事件委托在 tplEvents 统一声明 |
| **监听驱动绑定** | 没有 `on()` 就不绑定 DOM 事件，首次 on 时懒绑定，最后 off 时解绑 |
| **action 路径定位** | tplEvents 的 key 是 action 路径（`'toolbar.save'`），沿 nodeMap + action 逐层定位目标组件 |

### tplEvents 定义

```ts
// Button 组件 — 声明节点前缀
tplEvents = {
    root: { prefix: '' },          // click → 'click', keypress → 'keypress'
    dropIcon: { prefix: 'drop' },  // click → 'dropClick', keypress → 'dropKeypress'
}

// 使用方 — 按 action 路径声明委托
tplEvents = {
    'toolbar.save': { click: { emits: ['save'] } },
    'toolbar.create': { click: { emits: ['create'] } },
    'toolbar.search': { change: { emits: ['searchChange'] } },
}
```

### 前缀机制

节点声明 `prefix`，事件名 = prefix + eventName（首字母大写）：

| prefix | DOM 事件 | 组合事件名 |
|--------|---------|-----------|
| `''` | click | `click` |
| `''` | keypress | `keypress` |
| `'drop'` | click | `dropClick` |
| `'drop'` | keypress | `dropKeypress` |
| `'search'` | change | `searchChange` |

前缀解决**同一组件内多节点**的同事件区分（root vs dropIcon）。

### action 路径

tplEvents 的 key 是 action 路径，从外到内逐层定位：

```ts
'toolbar.save'
  → nodeMap 中找 action='toolbar' 的子组件
  → 在该子组件内找 action='save' 的子组件
  → 绑定 click 委托到该组件的 el
```

**统一用 action 定位，不用 name。** action 是语义标识，name 是结构标识，action 更适合事件路由。

action 路径解决**同类型多实例**区分（两个 Button，一个 save 一个 create）。

### 监听驱动

```ts
// 没人 on → 不绑定
// 有人 on('save', handler) → 懒绑定 'toolbar.save' 的 click 委托
// 全部 off('save') → 解绑
```

子组件自带的 tplEvents 声明 + 使用方追加的 tplEvents 声明，运行时合并，按需激活。

### 两条事件通道

| 通道 | 机制 | 范围 | 示例 |
|------|------|------|------|
| **节点通道** | DOM 事件委托（tplEvents） | 组件内部，可跨组件边界穿透 | Button click → emit('save') |
| **组件通道** | `child.on()` 显式监听 | 跨组件边界，层层转发 | a.on('save') → b.emit('save') |

节点通道用委托，组件通道用 on，各管各的。

### 跨层转发

每层显式 `on` 监听 + 转发，不自动穿透：

```ts
// b 模板
class B extends Component {
    onInit() {
        this.nodeMap.x.on('save', (ctx) => this.emit('save', ctx));
    }
}
```

action 作为事件数据跟着 ctx 走，不丢失。

### 组件事件能力声明

组件通过 `static actions` 声明对外暴露的事件，使用方据此知道能 on 什么：

```ts
class EntityToolbar extends ToolbarComponent {
    static type = 'EntityToolbar';
    static actions = ['create', 'edit', 'delete', 'save', 'refresh', 'search'];
}
```

### tplEvents 配置项

```ts
tplEvents: {
    // 路径式：跨层穿透到目标组件
    'toolbar.save': { click: { emits: ['save'] } },

    // 节点式：同层直接委托
    saveBtn: { click: { emits: ['save'] } },

    // 本地监听：handler: true 调用组件方法 onSaveBtnClick()
    saveBtn: { click: { handler: true } },

    // 两者都要
    saveBtn: { click: { emits: ['save'], handler: true } },

    // 前缀声明（组件定义时）
    root: { prefix: '' },
    dropIcon: { prefix: 'drop' },
}
```

| 配置 | 行为 |
|------|------|
| `emits: ['save']` | 转发为组件事件 |
| `handler: true` | 调用组件方法 `onSaveBtnClick()` |
| 两者都有 | 先转发，再调方法 |
| `prefix: 'drop'` | 声明节点事件前缀 |

## 运行时流程

### 委托绑定（懒绑定）

```
component.on('save', handler)
  → 查 tplEvents 找到 'toolbar.save'
  → 路径解析：action='toolbar' → action='save'
  → 找到目标组件实例 → 在其 el 上绑定 click 监听
  → 后续 click 触发 → el.contains(event.target) 匹配
  → 查前缀：event.target 在 root 还是 dropIcon？
  → 组合事件名：prefix + eventName
  → emit('save', data)
```

### 事件匹配

```
DOM 事件触发 → event.target
  → 沿 parentElement 向上找
  → 每个元素检查是否在已绑定的目标组件 el 内（el.contains）
  → 找到 → 确定触发节点 → 查前缀 → 组合事件名
  → 与 tplEvents 声明对比 → 匹配则执行
```

## 删除的东西

- ~~TplNode.emits~~ — 事件定义移到 tplEvents
- ~~TplNode.action~~（作为事件驱动器）— action 路径在 tplEvents key 中
- ~~compileNodeEmits~~ — 改为按需编译
- ~~NODE_EVENT_META 遍历匹配~~ — 改为 el.contains + 前缀匹配

## 新增的东西

- `tplEvents` 中 `prefix` 字段 — 节点事件前缀
- `tplEvents` 中 action 路径 key — 跨层定位
- `static actions` — 组件事件能力声明
- 路径解析逻辑 — `'a.b.c'` → nodeMap + action 逐层查找
- 监听驱动懒绑定 — on 时绑定，off 时解绑
- 前缀匹配 — prefix + eventName 组合事件名

## 与旧方案的对比

| 维度 | 旧方案 | 新方案 |
|------|--------|--------|
| 事件定义位置 | TplNode 节点上 emits | tplEvents 统一声明 |
| action 角色 | 事件数据 | 路径定位 key |
| 绑定时机 | 声明即绑定 | 监听驱动懒绑定 |
| 跨层 | COMPONENT_ROOT 阻断 | action 路径穿透 |
| ItemContainer | $items + keyProp 特殊处理 | action 路径统一 |
| 同组件多节点 | emits 枚举 | prefix 自动组合 |
| 同类型多实例 | 无法区分 | action 路径区分 |

## EntityToolbar 示例

```ts
// EntityToolbar 组件
class EntityToolbar extends ToolbarComponent {
    static type = 'EntityToolbar';
    static actions = ['create', 'edit', 'delete', 'save', 'refresh', 'search',
                      'firstPage', 'prevPage', 'nextPage', 'lastPage'];

    tplEvents = {
        root: { prefix: '' },
    };
}

// 使用方
tplEvents = {
    'toolbar.create': { click: { emits: ['create'] } },
    'toolbar.save': { click: { emits: ['save'] } },
    'toolbar.search': { change: { emits: ['searchChange'] } },
}

// 监听
toolbar.on('create', (ctx) => { /* 创建 */ });
toolbar.on('save', (ctx) => { /* 保存 */ });
toolbar.on('searchChange', (ctx) => { /* 搜索 */ });
```

无需 `_setupSemanticEvents`，无需 `data.name` 判断，tplEvents + action 路径自动路由。