# 搜索能力重构与增强 - 编码任务规划

## 任务依赖关系

```
任务1（事件常量）─── 无依赖，最先执行
    │
    ├──▶ 任务2（搜索子能力）─── 依赖任务1
    │       │
    │       └──▶ 任务3（搜索聚合层）─── 依赖任务2
    │               │
    │               └──▶ 任务4（宿主组件集成）─── 依赖任务3
    │
    ├──▶ 任务5（事件桥接）─── 依赖任务1
    │
    ├──▶ 任务6（EntityListenAbility 修复）─── 依赖任务1
    │
    └──▶ 任务7（EntityEmitAbility 转发）─── 依赖任务1
            │
            └──▶ 任务8（端到端集成验证）─── 依赖任务4、5、6、7
```

---

## 任务1：新增搜索事件常量

**描述**：在 `component-events.ts` 和 `entity-events.ts` 中新增搜索相关事件常量定义，为后续所有搜索能力实现提供事件名引用基础。

**输入**：
- 现有 `src/events/component-events.ts` 文件
- 现有 `src/events/entity-events.ts` 文件
- spec.md 第 5.1 节搜索事件常量定义规则

**输出**：
- `component-events.ts` 新增 `SEARCH_EVENTS` 常量（CHANGE: 'searchchange', SUBMIT: 'searchsubmit'）
- `component-events.ts` 的 `ENTITY_EVENTS` 新增 `SEARCH_CHANGE: 'entity:searchchange'`
- `entity-events.ts` 新增 `ENTITY_SEARCH_EVENTS` 常量（CHANGE: 'searchChange'）

**验收标准**：
1. `SEARCH_EVENTS` 常量包含 CHANGE 和 SUBMIT 两个键，值分别为 'searchchange' 和 'searchsubmit'，使用 `as const` 断言
2. `ENTITY_SEARCH_EVENTS` 常量包含 CHANGE 键，值为 'searchChange'，使用 `as const` 断言
3. `ENTITY_EVENTS` 新增 SEARCH_CHANGE 键，值为 'entity:searchchange'，位于现有键之后
4. 新增常量的注释风格与现有 PAGINATION_EVENTS、ENTITY_CRUD_EVENTS 等保持一致
5. `src/events/index.ts` 无需修改（已通过 `export *` 自动导出）
6. TypeScript 编译无错误

**代码生成提示**：
```
在 src/events/component-events.ts 中，参照 PAGINATION_EVENTS 的格式，在 TOOLBAR_EVENTS 之前新增 SEARCH_EVENTS 常量块。在 ENTITY_EVENTS 对象中，树操作事件之后、UI 选择事件之前新增 SEARCH_CHANGE 键。
在 src/events/entity-events.ts 中，参照 ENTITY_CRUD_EVENTS 的格式，在 ENTITY_TREE_EVENTS 之后新增 ENTITY_SEARCH_EVENTS 常量块。
```

---

## 任务2：实现搜索子能力（SearchEventsAbility / SearchInputAbility / SearchButtonAbility + 位置常量）

**描述**：创建搜索能力的三个子能力文件和位置常量文件，实现搜索事件发射、关键词输入框（含防抖）、搜索按钮的核心功能。

**输入**：
- 任务1 产出的 SEARCH_EVENTS 常量
- design.md 第 1.3.1~1.3.4 节子能力设计
- 现有 `PaginationEventsAbility.ts`、`CrudAbility.ts` 作为参考模式
- 现有 `ComposableBase.debounce()` 方法

**输出**：
- `src/component-abilities/toolbar/search-positions.ts` - 搜索位置常量
- `src/component-abilities/toolbar/SearchEventsAbility.ts` - 搜索事件子能力
- `src/component-abilities/toolbar/SearchInputAbility.ts` - 搜索输入框子能力
- `src/component-abilities/toolbar/SearchButtonAbility.ts` - 搜索按钮子能力

**验收标准**：
1. `search-positions.ts` 导出 `SEARCH_POSITIONS` 常量，包含 INPUT(5) 和 BUTTON(8)
2. `SearchEventsAbility` 导出 `AbilityDefinition` 对象，包含：
   - `emitSearchChange(data)` 方法：调用 `this.emit?.(SEARCH_EVENTS.CHANGE, data)`
   - `emitSearchSubmit(data)` 方法：调用 `this.emit?.(SEARCH_EVENTS.SUBMIT, data)`
   - `emitSearch(params)` 方法：params 为空时静默返回，非空时调用 `this.emitSearchChange({ search: params })`
3. `SearchInputAbility` 导出 `AbilityDefinition` 对象，包含：
   - `keyword` getter/setter，abilityState 键名 `SearchAbility:keyword`，默认空字符串
   - `searchMode` getter/setter，abilityState 键名 `SearchAbility:searchMode`，默认 'simple'
   - `searchDebounce` getter/setter，abilityState 键名 `SearchAbility:searchDebounce`，默认 300
   - `searchPlaceholder` getter/setter，abilityState 键名 `SearchAbility:searchPlaceholder`，默认 '请输入关键词'
   - `renderSearchInput(frag: DocumentFragment)` 方法：仅在 searchMode==='simple' 时渲染 input 元素，绑定 input 事件通过 debounce 防抖后调用 emitSearchChange
   - `__initProps` 方法：从 props 初始化 keyword、searchMode、searchDebounce、searchPlaceholder
4. `SearchButtonAbility` 导出 `AbilityDefinition` 对象，包含：
   - `showSearchButton` getter/setter，abilityState 键名 `SearchAbility:showSearchButton`，默认 true
   - `searchText` getter/setter，abilityState 键名 `SearchAbility:searchText`，默认 '搜索'
   - `searchParams` getter/setter，abilityState 键名 `SearchAbility:searchParams`，默认 {}
   - `renderSearchButton(frag: DocumentFragment)` 方法：仅在 showSearchButton===true 时渲染 button 元素，点击时根据 searchMode 发射 searchsubmit + searchchange
   - `__initProps` 方法：从 props 初始化 showSearchButton、searchText、searchParams
5. 所有子能力使用 `import type { AbilityDefinition } from '@qimenjs/composable'` 导入类型
6. 所有子能力使用 `import { SEARCH_EVENTS } from '@qimenjs/events'` 引用事件常量
7. 防抖使用 `this.debounce('SearchAbility:input', fn, this.searchDebounce)` 模式
8. DOM 元素使用 `data-search` 属性标记（input 值为 'input'，button 值为 'button'）
9. TypeScript 编译无错误

**代码生成提示**：
```
参照 src/component-abilities/toolbar/PaginationEventsAbility.ts 的 AbilityDefinition 模式创建 SearchEventsAbility。
参照 src/component-abilities/toolbar/PaginationNavAbility.ts 的渲染模式创建 SearchInputAbility 和 SearchButtonAbility。
参照 src/component-abilities/toolbar/pagination-positions.ts 创建 search-positions.ts。
防抖实现参照 src/composable/ComposableBase.ts 中的 debounce() 方法签名。
```

---

## 任务3：实现搜索聚合层（SearchAbility）

**描述**：创建 SearchAbility 聚合层文件，通过 Object.assign 合并三个子能力，提供 renderSearch 统一渲染协调和 onSearch 兼容回调，更新 toolbar/index.ts 导出。

**输入**：
- 任务2 产出的三个子能力文件
- design.md 第 1.3.5 节聚合层设计
- 现有 `PaginationAbility.ts` 聚合层作为参考模式

**输出**：
- `src/component-abilities/toolbar/SearchAbility.ts` - 搜索聚合层
- `src/component-abilities/toolbar/index.ts` - 更新导出

**验收标准**：
1. `SearchAbility.ts` 导出通过 `Object.assign({}, SearchInputAbility, SearchButtonAbility, SearchEventsAbility, {...})` 创建的 AbilityDefinition
2. 聚合层包含 `renderSearch()` 方法：移除旧 `[data-search]` 元素，按顺序调用 renderSearchInput 和 renderSearchButton
3. 聚合层包含 `onSearch` getter/setter，abilityState 键名 `SearchAbility:onSearch`，默认 undefined
4. 聚合层包含 `__initProps(props)` 方法：初始化 keyword、searchMode、searchDebounce、searchPlaceholder、showSearchButton、searchText、searchParams、onSearch
5. 聚合层重新导出 `SEARCH_POSITIONS`（参照 PaginationAbility 导出 PAGINATION_POSITIONS 的模式）
6. `toolbar/index.ts` 新增导出：`SearchAbility`、`SEARCH_POSITIONS`、`SearchInputAbility`、`SearchButtonAbility`、`SearchEventsAbility`
7. TypeScript 编译无错误

**代码生成提示**：
```
参照 src/component-abilities/toolbar/PaginationAbility.ts 的 Object.assign 聚合模式。
renderSearch() 参照 PaginationAbility.renderPagination() 的实现：移除旧元素 → 创建 fragment → 按序调用子能力渲染 → appendChild。
__initProps 参照 CrudAbility.__initProps 的模式。
```

---

## 任务4：宿主组件集成（ToolbarComponent + interaction/SearchAbility 标记废弃）

**描述**：将 SearchAbility 集成到 ToolbarComponent 的 abilities 数组中，为旧的 interaction/SearchAbility 添加 @deprecated 标记。

**输入**：
- 任务3 产出的 SearchAbility 聚合层
- 现有 `src/component/components/ToolbarComponent.ts`
- 现有 `src/component-abilities/interaction/SearchAbility.ts`
- 现有 `src/component-abilities/interaction/index.ts`

**输出**：
- `ToolbarComponent.ts` - abilities 数组新增 SearchAbility
- `interaction/SearchAbility.ts` - 添加 @deprecated 注释
- `interaction/index.ts` - 添加 @deprecated 注释

**验收标准**：
1. `ToolbarComponent.ts` 的 static abilities 数组末尾新增 `SearchAbility`
2. `ToolbarComponent.ts` 新增 `import { SearchAbility } from '@qimenjs/component-abilities'`
3. `interaction/SearchAbility.ts` 文件头部 JSDoc 新增 `@deprecated` 标记，说明请使用 `toolbar/SearchAbility`
4. `interaction/index.ts` 的 SearchAbility 导出行上方添加 `@deprecated` 注释
5. `interaction/SearchAbility.ts` 的代码逻辑不做任何修改，仅添加注释
6. SelectComponent 不受影响，继续使用 interaction/SearchAbility
7. TypeScript 编译无错误

**代码生成提示**：
```
在 ToolbarComponent.ts 中，参照 CrudAbility 的导入和 abilities 数组添加方式新增 SearchAbility。
在 interaction/SearchAbility.ts 中，在现有 JSDoc 注释的描述之后添加 @deprecated 行。
```

---

## 任务5：EventBridgeAbility 新增搜索桥接

**描述**：在 EventBridgeAbility 中新增 SearchBridgeConfig 接口、search 桥接逻辑和 BUILTIN_BRIDGE_KEYS 更新，使搜索事件可通过声明式配置自动桥接。

**输入**：
- 任务1 产出的 SEARCH_EVENTS 常量
- 现有 `src/component-core/abilities/EventBridgeAbility.ts`
- design.md 第 1.3.8 节 EventBridgeAbility 修改设计

**输出**：
- `EventBridgeAbility.ts` - 新增 SearchBridgeConfig 接口、EventBridgeConfig.search 字段、search 桥接逻辑、BUILTIN_BRIDGE_KEYS 更新

**验收标准**：
1. 新增 `SearchBridgeConfig` 接口，包含 `source: string` 和 `enabled?: boolean`，与 PaginationBridgeConfig 风格一致
2. `EventBridgeConfig` 接口新增 `search?: SearchBridgeConfig | string` 字段，位于 selection 之后
3. `BUILTIN_BRIDGE_KEYS` 常量新增 `'search'`，变为 `new Set(['pagination', 'crud', 'selection', 'search'])`
4. `initEventBridge()` 方法中，选择桥接之后、自定义桥接之前，新增搜索桥接逻辑：normalizeBridgeConfig → _bridgeOn(SEARCH_EVENTS.CHANGE → onSearchChange)
5. 导入语句新增 `SEARCH_EVENTS`：`import { PAGINATION_EVENTS, CRUD_EVENTS, SELECTION_EVENTS, SEARCH_EVENTS } from '@qimenjs/events'`
6. 搜索桥接逻辑与分页桥接逻辑结构一致（normalizeBridgeConfig + enabled 检查 + _bridgeOn）
7. 现有 pagination/crud/selection 桥接行为不受影响
8. TypeScript 编译无错误

**代码生成提示**：
```
参照 EventBridgeAbility.ts 中现有的分页桥接（paginationCfg）和选择桥接（selectionCfg）的实现模式。
SearchBridgeConfig 接口参照 PaginationBridgeConfig 接口定义。
搜索桥接逻辑插入位置：选择桥接代码块之后、自定义桥接 for 循环之前。
```

---

## 任务6：EntityListenAbility 搜索监听修复

**描述**：将 EntityListenAbility 中硬编码的 'searchchange' 字符串替换为 SEARCH_EVENTS.CHANGE 常量，同时更新文件头部注释。

**输入**：
- 任务1 产出的 SEARCH_EVENTS 常量
- 现有 `src/component-abilities/entity/EntityListenAbility.ts`
- design.md 第 1.3.9 节 EntityListenAbility 修改设计

**输出**：
- `EntityListenAbility.ts` - 替换硬编码字符串、更新导入和注释

**验收标准**：
1. 导入语句新增 `SEARCH_EVENTS`：`import { CRUD_EVENTS, CRUD_ACTIONS, PAGINATION_EVENTS, SEARCH_EVENTS } from '@qimenjs/events'`
2. `_bindSearchListener()` 方法中 `this.on('searchchange', ...)` 替换为 `this.on(SEARCH_EVENTS.CHANGE, ...)`
3. 文件头部 JSDoc 注释中 `'searchchange'` 替换为 `SEARCH_EVENTS.CHANGE`
4. `_handleSearchChange()` 方法的处理逻辑不做任何修改
5. 其他 Entity 组合能力文件（EntityRemoteCrudAbility 等）的头部注释中 `'searchchange'` 也同步更新为 `SEARCH_EVENTS.CHANGE`
6. TypeScript 编译无错误

**代码生成提示**：
```
在 EntityListenAbility.ts 中：
1. 修改第 26 行 import，在 PAGINATION_EVENTS 后添加 SEARCH_EVENTS
2. 修改第 163 行，将 'searchchange' 替换为 SEARCH_EVENTS.CHANGE
3. 修改第 10 行注释，将 '- 'searchchange' → mgr.filter() / mgr.searchBy()' 替换为 '- SEARCH_EVENTS.CHANGE → mgr.filter() / mgr.searchBy()'
同步修改 EntityRemoteCrudAbility.ts、EntityRemoteReadonlyAbility.ts、EntityLocalCrudAbility.ts、EntityLocalReadonlyAbility.ts、EntityRemoteTreeAbility.ts 的头部注释。
```

---

## 任务7：EntityEmitAbility 搜索事件转发

**描述**：在 EntityEmitAbility 中新增搜索事件转发逻辑，将 EntityManager 的 searchChange 事件转发为 entity:searchchange 组件事件。

**输入**：
- 任务1 产出的 ENTITY_SEARCH_EVENTS 常量和 ENTITY_EVENTS.SEARCH_CHANGE
- 现有 `src/component-abilities/entity/EntityEmitAbility.ts`
- design.md 第 1.3.10 节 EntityEmitAbility 修改设计

**输出**：
- `EntityEmitAbility.ts` - 新增搜索事件转发逻辑和导入

**验收标准**：
1. 导入语句新增 `ENTITY_SEARCH_EVENTS`：在 `ENTITY_REQUEST_STATUS` 之后添加
2. `_forwardEntityEvents()` 方法中，树操作事件转发之后、请求状态事件转发之前，新增搜索事件转发：
   - `this._forwardEvent(mgr, ENTITY_SEARCH_EVENTS.CHANGE, ENTITY_EVENTS.SEARCH_CHANGE, (searchData) => ({ search: searchData, ...collectPaginationContext(mgr) }), 'onEntitySearchChange')`
3. 转发数据包含 `search` 字段和分页上下文（page/pageSize/total/pages/hasMore）
4. 转发前调用 `onEntitySearchChange` 钩子，钩子返回 false 阻止转发，返回对象替换数据
5. 现有 CRUD/分页/树/请求状态事件转发逻辑不受影响
6. TypeScript 编译无错误

**代码生成提示**：
```
参照 EntityEmitAbility.ts 中现有的树操作事件转发（ENTITY_TREE_EVENTS.CHILDREN_REFRESHED）的实现模式。
搜索事件转发插入位置：树操作事件转发代码块之后、请求状态事件转发 for 循环之前。
collectPaginationContext 函数已存在，直接复用。
```

---

## 任务8：端到端集成验证

**描述**：验证搜索能力从组件层到实体层的完整事件流通路，确保简单搜索、复杂搜索、事件桥接、实体监听、实体转发各环节正确联动。

**输入**：
- 任务1~7 的全部产出
- spec.md 全部验收条件

**输出**：
- 集成验证结果（通过/不通过）

**验收标准**：
1. **简单搜索事件流**：ToolbarComponent 输入关键词 → 防抖后发射 searchchange → EventBridgeAbility 搜索桥接 → EntityListenAbility 监听 → EntityManager.filter() 被调用
2. **搜索按钮事件流**：点击搜索按钮 → 发射 searchsubmit + searchchange → 同上桥接链路
3. **复杂搜索事件流**：调用 emitSearch({status:'active'}) → 发射 searchchange {search:{status:'active'}} → EntityListenAbility 监听 → EntityManager.searchBy() 被调用
4. **实体事件转发**：EntityManager 触发 searchChange → EntityEmitAbility 转发 entity:searchchange → 组件可监听
5. **硬编码消除**：全局搜索 'searchchange' 字符串字面量，除常量定义外不存在硬编码
6. **兼容性**：SelectComponent 使用 interaction/SearchAbility 的 keyword 属性不受影响
7. **TypeScript 编译**：整个项目编译无错误
8. **现有测试**：所有现有测试通过

**代码生成提示**：
```
1. 运行 TypeScript 编译检查：npx tsc --noEmit
2. 运行现有测试：npm test
3. 全局搜索硬编码：搜索 'searchchange' 字符串字面量（排除常量定义和注释）
4. 验证 SelectComponent 的 keyword 属性读写正常
```
