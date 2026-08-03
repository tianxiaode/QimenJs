# **1. 实现模型**

## **1.1 上下文视图**

组合查询改造后的上下文关系：

```
┌─────────────────────────────────────────────────────────────┐
│                      宿主组件层                              │
│  ToolbarComponent（组合搜索能力）                             │
│  SelectComponent（继续使用 interaction/SearchAbility）         │
└──────────┬──────────────────────────────────────────────────┘
           │ 组合
           ▼
┌─────────────────────────────────────────────────────────────┐
│                  搜索子能力层（toolbar/search/）              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │InputAbility  │  │ButtonAbility │  │EventsAbility │      │
│  │ (输入框+防抖) │  │ (搜索按钮)    │  │ (事件发射)    │      │
│  │ 携带search?  │  │ 组装完整数据  │  │ 组合类型签名  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                 │                                  │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │search-       │  │  兼容聚合层   │                        │
│  │positions.ts  │  │SearchAbility │                        │
│  │ (位置常量)    │  │(Object.assign)│                       │
│  └──────────────┘  └──────────────┘                        │
└──────────┬──────────────────────────────────────────────────┘
           │ 事件 { keyword?, search? }
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    事件桥接层                                 │
│  ComponentEventBusAbility (search 桥接)                            │
│  → EntityListenAbility (SEARCH_EVENTS.CHANGE)               │
│     改造后：两个独立 if，可同时执行 filter + searchBy          │
│  → EntityManager (filter + searchBy)                         │
│  → EntityEmitAbility (entity:searchchange 转发)              │
└─────────────────────────────────────────────────────────────┘
```

## **1.2 服务/组件总体架构**

### 文件结构（改造后）

```
src/component-abilities/toolbar/
├── index.ts                        # 更新导出路径（从子目录重导出）
├── ToolbarAbility.ts               # 保留在根目录，不变
├── CrudAbility.ts                  # 保留在根目录，不变
│
├── pagination/                     # 分页子目录（新建）
│   ├── index.ts                    # 分页统一导出
│   ├── PaginationAbility.ts        # 从根目录移入
│   ├── PaginationEventsAbility.ts  # 从根目录移入
│   ├── PaginationInfoAbility.ts    # 从根目录移入
│   ├── PaginationJumperAbility.ts  # 从根目录移入
│   ├── PaginationNavAbility.ts     # 从根目录移入
│   ├── PaginationPagesAbility.ts   # 从根目录移入
│   ├── PaginationSizerAbility.ts   # 从根目录移入
│   ├── PaginationStateAbility.ts   # 从根目录移入
│   └── pagination-positions.ts     # 从根目录移入
│
└── search/                         # 搜索子目录（新建）
    ├── index.ts                    # 搜索统一导出
    ├── SearchAbility.ts            # 从根目录移入
    ├── SearchButtonAbility.ts      # 从根目录移入，改造组合数据组装
    ├── SearchEventsAbility.ts      # 从根目录移入，改造类型签名
    ├── SearchInputAbility.ts       # 从根目录移入，改造防抖事件携带 searchParams
    └── search-positions.ts         # 从根目录移入

src/component-abilities/entity/
└── EntityListenAbility.ts          # 改造 if-else if → 两个独立 if
```

### 能力依赖关系

```
SearchInputAbility ← 依赖 SearchEventsAbility（发射 searchchange）、ComposableBase.debounce（防抖）
SearchButtonAbility ← 依赖 SearchEventsAbility（发射 searchsubmit + searchchange）
SearchEventsAbility ← 无依赖（基础层，提供事件发射方法）
SearchAbility（聚合层）← 合并 InputAbility + ButtonAbility + EventsAbility + renderSearch
EntityListenAbility ← 消费 searchchange 事件，调用 EntityManager.filter() + searchBy()
```

## **1.3 实现设计文档**

### 1.3.1 SearchEventsAbility 类型签名改造

**职责**：将事件数据类型从联合类型改为组合类型，允许 keyword 和 search 同时存在。

**改造要点**：
- `emitSearchChange(data)` 参数类型从 `{ keyword: string } | { search: Record<string, any> }` 改为 `{ keyword?: string; search?: Record<string, any> }`
- `emitSearchSubmit(data)` 参数类型同上
- `emitSearch(params)` 保持不变，仍以 `{ search: params }` 格式发射
- 更新 JSDoc 注释，反映组合类型语义

**改造后签名**：

```typescript
/**
 * 发射搜索变更事件
 *
 * data 可同时携带 keyword 和 search，实现组合查询
 */
emitSearchChange(data: { keyword?: string; search?: Record<string, any> }): void {
    this.emit?.(SEARCH_EVENTS.CHANGE, data);
},

/**
 * 发射搜索提交事件
 *
 * data 可同时携带 keyword 和 search，实现组合查询
 */
emitSearchSubmit(data: { keyword?: string; search?: Record<string, any> }): void {
    this.emit?.(SEARCH_EVENTS.SUBMIT, data);
},
```

### 1.3.2 SearchButtonAbility 组合数据组装改造

**职责**：搜索按钮点击时始终组装包含 keyword 和 search 的完整事件数据，不再按 searchMode 互斥选择。

**改造要点**：
- 移除 `if (this.searchMode === 'simple') ... else ...` 互斥分支
- 始终构建 `data` 对象，按条件添加 keyword 和 search 字段
- keyword 非空时添加 `data.keyword`
- searchParams 非空对象时添加 `data.search`
- 更新 JSDoc 注释，searchParams 描述从"仅在 complex 模式使用"改为"搜索参数，与 keyword 可同时使用"

**改造后按钮点击逻辑**：

```typescript
btn.addEventListener('click', () => {
    const data: { keyword?: string; search?: Record<string, any> } = {};
    if (this.keyword) {
        data.keyword = this.keyword;
    }
    if (this.searchParams && Object.keys(this.searchParams).length > 0) {
        data.search = this.searchParams;
    }
    this.emitSearchSubmit?.(data);
    this.emitSearchChange?.(data);
});
```

### 1.3.3 SearchInputAbility 防抖事件携带 searchParams 改造

**职责**：输入框 input 事件防抖后发射 searchchange 时，同时携带当前 searchParams（如果非空）。

**改造要点**：
- 防抖回调中构建 `data` 对象，始终包含 `keyword`
- searchParams 非空对象时添加 `data.search`
- 更新 JSDoc 注释，searchMode 语义从"互斥模式选择"调整为"UI 渲染模式"

**改造后防抖逻辑**：

```typescript
input.addEventListener('input', () => {
    this.keyword = input.value;
    const debouncedEmit = this.debounce(
        'SearchAbility:input',
        () => {
            const data: { keyword: string; search?: Record<string, any> } = { keyword: this.keyword };
            if (this.searchParams && Object.keys(this.searchParams).length > 0) {
                data.search = this.searchParams;
            }
            this.emitSearchChange?.(data);
        },
        this.searchDebounce,
    );
    debouncedEmit();
});
```

**searchMode 语义调整**：
- `searchMode` getter/setter 的 JSDoc 注释更新为"UI 渲染模式：simple=显示输入框+搜索按钮，complex=仅显示搜索按钮"
- `searchMode` 不再影响事件数据结构，仅控制输入框的显隐

### 1.3.4 EntityListenAbility 互斥分支消除

**职责**：将 `_handleSearchChange` 中 keyword 和 search 的处理从 if-else if 互斥分支改为两个独立 if 分支，允许同时执行。

**改造要点**：
- 将 `else if` 改为独立 `if`
- keyword 存在时调用 `mgr.filter(keyword)`
- search 存在时调用 `mgr.searchBy(search)`
- 两者可同时执行，执行顺序为先 filter 后 searchBy
- 空值保护：keyword 为空字符串时不调用 filter，search 为空对象时不调用 searchBy

**改造后逻辑**：

```typescript
_handleSearchChange(e: any): void {
    if (!this.mgr) return;

    const hookResult = this._callEntityHook('onEntitySearch', e);
    if (hookResult === false) return;

    const eventData = hookResult && typeof hookResult === 'object' ? hookResult : e;

    if (eventData?.keyword !== undefined && typeof this.mgr.filter === 'function') {
        this.mgr.filter(eventData.keyword);
    }
    if (eventData?.search && typeof this.mgr.searchBy === 'function') {
        this.mgr.searchBy(eventData.search);
    }

    this._callEntityHook('afterEntitySearch', eventData);
},
```

**执行语义说明**：
- `mgr.filter(keyword)` 将 keyword 写入 `this.search.keyword`
- `mgr.searchBy(search)` 用 `{ ...this.search, ...search }` 展开，不覆盖已有 keyword
- 两者组合后 `this.search = { keyword: 'test', status: 'active' }`，底层天然支持

### 1.3.5 toolbar 目录按功能分类重组

**职责**：将 toolbar 目录下 17 个平铺文件按功能分类移入子目录，改善代码组织结构。

**分页文件移入 pagination/ 子目录**（9 个文件）：

| 原路径 | 新路径 |
|--------|--------|
| toolbar/PaginationAbility.ts | toolbar/pagination/PaginationAbility.ts |
| toolbar/PaginationEventsAbility.ts | toolbar/pagination/PaginationEventsAbility.ts |
| toolbar/PaginationInfoAbility.ts | toolbar/pagination/PaginationInfoAbility.ts |
| toolbar/PaginationJumperAbility.ts | toolbar/pagination/PaginationJumperAbility.ts |
| toolbar/PaginationNavAbility.ts | toolbar/pagination/PaginationNavAbility.ts |
| toolbar/PaginationPagesAbility.ts | toolbar/pagination/PaginationPagesAbility.ts |
| toolbar/PaginationSizerAbility.ts | toolbar/pagination/PaginationSizerAbility.ts |
| toolbar/PaginationStateAbility.ts | toolbar/pagination/PaginationStateAbility.ts |
| toolbar/pagination-positions.ts | toolbar/pagination/pagination-positions.ts |

**搜索文件移入 search/ 子目录**（5 个文件）：

| 原路径 | 新路径 |
|--------|--------|
| toolbar/SearchAbility.ts | toolbar/search/SearchAbility.ts |
| toolbar/SearchButtonAbility.ts | toolbar/search/SearchButtonAbility.ts |
| toolbar/SearchEventsAbility.ts | toolbar/search/SearchEventsAbility.ts |
| toolbar/SearchInputAbility.ts | toolbar/search/SearchInputAbility.ts |
| toolbar/search-positions.ts | toolbar/search/search-positions.ts |

**根目录保留**（3 个文件）：
- `toolbar/ToolbarAbility.ts` — 保留在根目录，不变
- `toolbar/CrudAbility.ts` — 保留在根目录，不变
- `toolbar/index.ts` — 更新导出路径

### 1.3.6 pagination/index.ts 统一导出

**职责**：提供分页子目录的统一导出入口。

```typescript
export { PaginationAbility, PAGINATION_POSITIONS } from './PaginationAbility';
export { PaginationStateAbility } from './PaginationStateAbility';
export { PaginationEventsAbility } from './PaginationEventsAbility';
export { PaginationNavAbility } from './PaginationNavAbility';
export { PaginationPagesAbility } from './PaginationPagesAbility';
export { PaginationJumperAbility } from './PaginationJumperAbility';
export { PaginationSizerAbility } from './PaginationSizerAbility';
export { PaginationInfoAbility } from './PaginationInfoAbility';
```

### 1.3.7 search/index.ts 统一导出

**职责**：提供搜索子目录的统一导出入口。

```typescript
export { SearchAbility, SEARCH_POSITIONS } from './SearchAbility';
export { SearchInputAbility } from './SearchInputAbility';
export { SearchButtonAbility } from './SearchButtonAbility';
export { SearchEventsAbility } from './SearchEventsAbility';
```

### 1.3.8 toolbar/index.ts 导出路径更新

**职责**：更新根 index.ts 的导出路径，从子目录重导出所有公共 API，确保外部引用路径不变。

**改造后导出**：

```typescript
export { ToolbarAbility } from './ToolbarAbility';
export { PaginationAbility, PAGINATION_POSITIONS, PaginationStateAbility, PaginationEventsAbility, PaginationNavAbility, PaginationPagesAbility, PaginationJumperAbility, PaginationSizerAbility, PaginationInfoAbility } from './pagination';
export { CrudAbility, CRUD_POSITIONS } from './CrudAbility';
export { SearchAbility, SEARCH_POSITIONS, SearchInputAbility, SearchButtonAbility, SearchEventsAbility } from './search';
```

### 1.3.9 子目录内部导入路径调整

**分页子目录内部**：
- `PaginationAbility.ts` 中从 `'./PaginationStateAbility'` 等同目录导入，路径不变
- `PaginationAbility.ts` 中从 `'./pagination-positions'` 导入，路径不变

**搜索子目录内部**：
- `SearchAbility.ts` 中从 `'./SearchInputAbility'` 等同目录导入，路径不变
- `SearchAbility.ts` 中从 `'./search-positions'` 导入，路径不变
- `SearchInputAbility.ts` 中从 `'./search-positions'` 导入，路径不变
- `SearchButtonAbility.ts` 中从 `'./search-positions'` 导入，路径不变

**跨目录引用**：
- 无跨子目录引用（分页和搜索能力相互独立）
- `ToolbarAbility.ts` 和 `CrudAbility.ts` 保留在根目录，不引用子目录文件

# **2. 接口设计**

## **2.1 总体设计**

改造遵循项目现有的 AbilityDefinition 模式，仅修改事件数据类型签名和分支逻辑，不改变能力组合方式。

## **2.2 接口清单**

### SearchEventsAbility（改造后）

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| emitSearchChange(data) | method | 发射 searchchange 事件，data 为 `{ keyword?, search? }` 组合类型 |
| emitSearchSubmit(data) | method | 发射 searchsubmit 事件，data 为 `{ keyword?, search? }` 组合类型 |
| emitSearch(params) | method | 复杂搜索手动触发，params 为 `Record<string, any>`，为空则静默返回（不变） |

### SearchInputAbility（改造后）

| 属性/方法 | 类型 | 默认值 | 说明 |
|-----------|------|--------|------|
| keyword | getter/setter | '' | 搜索关键词（不变） |
| searchMode | getter/setter | 'simple' | UI 渲染模式：simple=显示输入框+搜索按钮，complex=仅显示搜索按钮 |
| searchDebounce | getter/setter | 300 | 防抖等待时间（ms），0 禁用（不变） |
| searchPlaceholder | getter/setter | '请输入关键词' | 输入框占位文本（不变） |
| renderSearchInput(frag) | method | - | 渲染搜索输入框，防抖事件携带 searchParams |
| __initProps | method | - | 从 props 初始化（不变） |

### SearchButtonAbility（改造后）

| 属性/方法 | 类型 | 默认值 | 说明 |
|-----------|------|--------|------|
| showSearchButton | getter/setter | true | 搜索按钮显隐（不变） |
| searchText | getter/setter | '搜索' | 搜索按钮文本（不变） |
| searchParams | getter/setter | {} | 搜索参数，与 keyword 可同时使用 |
| renderSearchButton(frag) | method | - | 渲染搜索按钮，始终组装完整数据 |
| __initProps | method | - | 从 props 初始化（不变） |

### EntityListenAbility._handleSearchChange（改造后）

| 输入 | 输出 | 说明 |
|------|------|------|
| eventData.keyword 存在 | mgr.filter(keyword) | 独立 if，不再被 else if 截断 |
| eventData.search 存在 | mgr.searchBy(search) | 独立 if，可与 filter 同时执行 |
| 两者均存在 | 先 filter 后 searchBy | 执行顺序保证 |

### 目录导出接口

| 文件 | 导出项 | 说明 |
|------|--------|------|
| pagination/index.ts | PaginationAbility, PAGINATION_POSITIONS, PaginationStateAbility, PaginationEventsAbility, PaginationNavAbility, PaginationPagesAbility, PaginationJumperAbility, PaginationSizerAbility, PaginationInfoAbility | 分页子目录统一导出 |
| search/index.ts | SearchAbility, SEARCH_POSITIONS, SearchInputAbility, SearchButtonAbility, SearchEventsAbility | 搜索子目录统一导出 |
| toolbar/index.ts | 从 ./pagination 和 ./search 重导出 + ToolbarAbility + CrudAbility | 根目录统一导出（外部引用不变） |

# **3. 事件流设计**

## **3.1 组合查询事件流（改造后核心场景）**

```
用户输入 "test" + searchParams={status:'active'}
    │
    ▼
SearchInputAbility: keyword = "test"
    │
    ▼ debounce(300ms)
    │
SearchEventsAbility: emitSearchChange({ keyword: "test", search: { status: "active" } })
    │
    ├──▶ emit('searchchange', { keyword: "test", search: { status: "active" } })
    │       │
    │       ▼
    │   ComponentEventBusAbility (search 桥接)
    │       │
    │       ▼
    │   EntityListenAbility: _handleSearchChange({ keyword: "test", search: { status: "active" } })
    │       │
    │       ├──▶ mgr.filter("test")          ← 独立 if #1
    │       │       search.keyword = "test"
    │       │
    │       └──▶ mgr.searchBy({ status: "active" })  ← 独立 if #2
    │               search = { keyword: "test", status: "active" }  ← 展开合并不覆盖
    │
    └──▶ onSearch?.("test")  [兼容旧版回调]
```

## **3.2 搜索按钮组合事件流**

```
用户点击搜索按钮（keyword="test", searchParams={status:'active'}）
    │
    ▼
SearchButtonAbility: click handler
    │
    │  组装 data = { keyword: "test", search: { status: "active" } }
    │
    ├──▶ SearchEventsAbility: emitSearchSubmit(data)
    │       └──▶ emit('searchsubmit', data)
    │
    └──▶ SearchEventsAbility: emitSearchChange(data)
            └──▶ emit('searchchange', data)
                    │
                    ▼ (同 3.1 事件流)
```

## **3.3 仅 keyword 向后兼容事件流**

```
用户输入 "test"（searchParams 为空）
    │
    ▼
SearchInputAbility: keyword = "test"
    │
    ▼ debounce(300ms)
    │
SearchEventsAbility: emitSearchChange({ keyword: "test" })
    │
    ▼
EntityListenAbility: _handleSearchChange({ keyword: "test" })
    │
    ├──▶ mgr.filter("test")    ← 独立 if #1，命中
    │
    └──▶ search 不存在，跳过    ← 独立 if #2，不命中

行为与改造前完全一致
```

## **3.4 仅 search 向后兼容事件流**

```
开发人员调用 emitSearch({ status: 'active' })
    │
    ▼
SearchEventsAbility: emitSearchChange({ search: { status: 'active' } })
    │
    ▼
EntityListenAbility: _handleSearchChange({ search: { status: 'active' } })
    │
    ├──▶ keyword 不存在，跳过   ← 独立 if #1，不命中
    │
    └──▶ mgr.searchBy({ status: 'active' })  ← 独立 if #2，命中

行为与改造前完全一致
```

# **4. 数据模型**

## **4.1 事件数据结构变更**

### 改造前

```typescript
/** 联合类型，互斥 */
type SearchEventData = { keyword: string } | { search: Record<string, any> };
```

### 改造后

```typescript
/** 组合类型，可共存 */
interface SearchEventData {
    keyword?: string;
    search?: Record<string, any>;
}
```

### 向后兼容性

| 场景 | 改造前事件数据 | 改造后事件数据 | 兼容性 |
|------|---------------|---------------|--------|
| 仅 keyword | `{ keyword: 'test' }` | `{ keyword: 'test' }` | 完全一致 |
| 仅 search | `{ search: { status: 'active' } }` | `{ search: { status: 'active' } }` | 完全一致 |
| 组合查询 | 不支持 | `{ keyword: 'test', search: { status: 'active' } }` | 新增能力 |

## **4.2 abilityState 键名规范**

无变更，保持现有键名：

| 子能力 | 键名 | 值类型 |
|--------|------|--------|
| SearchInputAbility | SearchAbility:keyword | string |
| SearchInputAbility | SearchAbility:searchMode | 'simple' \| 'complex' |
| SearchInputAbility | SearchAbility:searchDebounce | number |
| SearchInputAbility | SearchAbility:searchPlaceholder | string |
| SearchButtonAbility | SearchAbility:showSearchButton | boolean |
| SearchButtonAbility | SearchAbility:searchText | string |
| SearchButtonAbility | SearchAbility:searchParams | Record<string, any> |
| SearchAbility（聚合） | SearchAbility:onSearch | ((keyword: string) => void) \| undefined |

## **4.3 目录结构数据模型**

### 改造前

```
toolbar/
├── index.ts
├── ToolbarAbility.ts
├── CrudAbility.ts
├── PaginationAbility.ts
├── PaginationEventsAbility.ts
├── PaginationInfoAbility.ts
├── PaginationJumperAbility.ts
├── PaginationNavAbility.ts
├── PaginationPagesAbility.ts
├── PaginationSizerAbility.ts
├── PaginationStateAbility.ts
├── pagination-positions.ts
├── SearchAbility.ts
├── SearchButtonAbility.ts
├── SearchEventsAbility.ts
├── SearchInputAbility.ts
└── search-positions.ts
```

### 改造后

```
toolbar/
├── index.ts                    # 更新导出路径
├── ToolbarAbility.ts           # 保留
├── CrudAbility.ts              # 保留
├── pagination/
│   ├── index.ts                # 新建
│   ├── PaginationAbility.ts
│   ├── PaginationEventsAbility.ts
│   ├── PaginationInfoAbility.ts
│   ├── PaginationJumperAbility.ts
│   ├── PaginationNavAbility.ts
│   ├── PaginationPagesAbility.ts
│   ├── PaginationSizerAbility.ts
│   ├── PaginationStateAbility.ts
│   └── pagination-positions.ts
└── search/
    ├── index.ts                # 新建
    ├── SearchAbility.ts
    ├── SearchButtonAbility.ts
    ├── SearchEventsAbility.ts
    ├── SearchInputAbility.ts
    └── search-positions.ts
```

# **5. 兼容性设计**

## **5.1 事件数据向后兼容**

- 仅传 `{ keyword }` 的事件数据仍可正常处理，EntityListenAbility 独立 if #1 命中，行为与改造前一致
- 仅传 `{ search }` 的事件数据仍可正常处理，EntityListenAbility 独立 if #2 命中，行为与改造前一致
- `emitSearch(params)` 方法行为不变，仍以 `{ search: params }` 格式发射

## **5.2 searchMode 语义兼容**

- searchMode 的 abilityState 键名和值域不变（`'simple' | 'complex'`）
- searchMode 对 UI 渲染的控制不变（simple=显示输入框，complex=隐藏输入框）
- 变更仅限于语义描述和事件数据组装逻辑，不影响现有使用方

## **5.3 目录重组导出兼容**

- `toolbar/index.ts` 从子目录重导出所有公共 API
- `component-abilities/index.ts` 的顶层导出不变
- 外部 `from '@qimenjs/component-abilities'` 引用路径不变
- 外部 `from '@qimenjs/component-abilities/toolbar'` 引用路径不变

## **5.4 不受影响的文件**

- `entity/abilities/search/SearchAbility.ts` — 底层实体层，已天然支持组合
- `component-abilities/index.ts` — 顶层导出不变
- `ToolbarAbility.ts` — 保留在根目录，逻辑不变
- `CrudAbility.ts` — 保留在根目录，逻辑不变
- `ComponentEventBusAbility.ts` — 桥接逻辑不变
- `EntityEmitAbility.ts` — 转发逻辑不变
