# **1. 实现模型**

## **1.1 上下文视图**

搜索能力重构后的上下文关系：

```
┌─────────────────────────────────────────────────────────────┐
│                      宿主组件层                              │
│  ToolbarComponent（组合搜索能力）                             │
│  SelectComponent（继续使用 interaction/SearchAbility）         │
└──────────┬──────────────────────────────────────────────────┘
           │ 组合
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    搜索子能力层                               │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │InputAbility  │  │ButtonAbility │  │EventsAbility │      │
│  │ (输入框+防抖) │  │ (搜索按钮)    │  │ (事件发射)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                 │                                  │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │search-       │  │  兼容聚合层   │                        │
│  │positions.ts  │  │SearchAbility │                        │
│  │ (位置常量)    │  │(Object.assign)│                       │
│  └──────────────┘  └──────────────┘                        │
└──────────┬──────────────────────────────────────────────────┘
           │ 事件
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    事件常量层                                 │
│  SEARCH_EVENTS (component-events.ts)                        │
│  ENTITY_SEARCH_EVENTS (entity-events.ts)                    │
│  ENTITY_EVENTS.SEARCH_CHANGE (component-events.ts)          │
└──────────┬──────────────────────────────────────────────────┘
           │ 桥接/监听/转发
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    事件桥接层                                 │
│  ComponentEventBusAbility (search 桥接)                            │
│  → EntityListenAbility (SEARCH_EVENTS.CHANGE)               │
│  → EntityManager (filter/searchBy)                           │
│  → EntityEmitAbility (entity:searchchange 转发)              │
└─────────────────────────────────────────────────────────────┘
```

## **1.2 服务/组件总体架构**

### 文件结构

```
src/component-abilities/toolbar/
├── SearchInputAbility.ts       # 搜索输入框子能力（关键词输入、防抖 change 触发）
├── SearchButtonAbility.ts      # 搜索按钮子能力（按钮渲染、点击事件）
├── SearchEventsAbility.ts      # 搜索事件子能力（searchchange/searchsubmit 发射、emitSearch）
├── SearchAbility.ts            # 兼容聚合层（Object.assign 合并子能力）
├── search-positions.ts         # 搜索位置常量
├── PaginationAbility.ts        # 不变
├── CrudAbility.ts              # 不变
├── ToolbarAbility.ts           # 不变
└── index.ts                    # 导出更新

src/events/
├── component-events.ts         # 新增 SEARCH_EVENTS、ENTITY_EVENTS.SEARCH_CHANGE
└── entity-events.ts            # 新增 ENTITY_SEARCH_EVENTS

src/component-core/abilities/
└── ComponentEventBusAbility.ts       # 新增 SearchBridgeConfig、search 桥接逻辑

src/component-abilities/entity/
├── EntityListenAbility.ts      # 替换硬编码 'searchchange' → SEARCH_EVENTS.CHANGE
└── EntityEmitAbility.ts        # 新增搜索事件转发

src/component-abilities/interaction/
├── SearchAbility.ts            # 保留，标记 @deprecated
└── index.ts                    # 保留导出，添加 @deprecated 注释
```

### 能力依赖关系

```
SearchInputAbility ← 依赖 SearchEventsAbility（发射 searchchange）、ComposableBase.debounce（防抖）
SearchButtonAbility ← 依赖 SearchEventsAbility（发射 searchsubmit + searchchange）
SearchEventsAbility ← 无依赖（基础层，提供事件发射方法）
SearchAbility（聚合层）← 合并 InputAbility + ButtonAbility + EventsAbility + renderSearch
```

注意：依赖关系是逻辑上的，Ability 之间通过宿主组件的属性访问（`this.keyword` 等），不需要显式 import。

## **1.3 实现设计文档**

### 1.3.1 search-positions.ts（搜索位置常量）

**职责**：定义搜索 UI 元素的位置权重，用于 ToolbarAbility 排序。

**实现要点**：
- `INPUT` 位置 5，在 CRUD 按钮之前
- `BUTTON` 位置 8，紧跟输入框之后
- 位置值与 CRUD_POSITIONS、PAGINATION_POSITIONS 协调，确保搜索区域在工具栏左侧

```typescript
export const SEARCH_POSITIONS = {
    INPUT: 5,
    BUTTON: 8,
} as const;
```

### 1.3.2 SearchEventsAbility（搜索事件子能力）

**职责**：提供搜索事件发射方法，是搜索能力的核心基础层。

**实现要点**：
- `emitSearchChange(data)` - 发射 `SEARCH_EVENTS.CHANGE` 事件
  - 简单搜索：`{ keyword: string }`
  - 复杂搜索：`{ search: Record<string, any> }`
- `emitSearchSubmit(data)` - 发射 `SEARCH_EVENTS.SUBMIT` 事件
  - 简单搜索：`{ keyword: string }`
  - 复杂搜索：`{ search: Record<string, any> }`
- `emitSearch(params)` - 复杂搜索手动触发入口
  - 校验 params 非空，为空则静默返回
  - 内部调用 `emitSearchChange({ search: params })`
- 事件数据构建逻辑统一在此能力中，InputAbility 和 ButtonAbility 委托调用

### 1.3.3 SearchInputAbility（搜索输入框子能力）

**职责**：管理关键词输入框 UI 和防抖 change 触发。

**实现要点**：
- `keyword` getter/setter - 兼容现有 interaction/SearchAbility 的 keyword 属性
  - getter：从 `abilityState('SearchAbility:keyword', () => '')` 读取
  - setter：更新 `abilityState`，触发 `renderSearch()`
- `searchDebounce` getter/setter - 防抖等待时间，默认 300ms
- `searchPlaceholder` getter/setter - 输入框占位文本，默认 "请输入关键词"
- `searchMode` getter/setter - 搜索模式，'simple' | 'complex'，默认 'simple'
- `renderSearchInput(frag)` - 渲染搜索输入框到 DocumentFragment
  - 仅在 `searchMode === 'simple'` 时渲染
  - 创建 `<input>` 元素，绑定 input 事件
  - input 事件通过 `this.debounce()` 防抖后调用 `this.emitSearchChange({ keyword })`
  - 使用 `data-search` 属性标记 DOM 元素
- `__initProps` - 从 props 初始化 keyword、searchDebounce、searchPlaceholder、searchMode

**防抖实现**：
```typescript
// 在 input 事件处理中
const debouncedEmit = this.debounce(
    'SearchAbility:input',
    () => {
        this.emitSearchChange?.({ keyword: this.keyword });
    },
    this.searchDebounce
);
debouncedEmit();
```

当 `searchDebounce === 0` 时，`this.debounce()` 的 wait 参数为 0，防抖函数立即执行（setTimeout(fn, 0)），等效于无防抖。

### 1.3.4 SearchButtonAbility（搜索按钮子能力）

**职责**：管理搜索按钮 UI 和点击事件。

**实现要点**：
- `showSearchButton` getter/setter - 搜索按钮显隐，默认 true
- `searchText` getter/setter - 搜索按钮文本，默认 "搜索"
- `searchParams` getter/setter - 复杂搜索参数，默认 `{}`
- `renderSearchButton(frag)` - 渲染搜索按钮到 DocumentFragment
  - 仅在 `showSearchButton === true` 时渲染
  - 创建 `<button>` 元素，绑定 click 事件
  - 简单搜索模式：点击时发射 `searchsubmit { keyword }` + `searchchange { keyword }`
  - 复杂搜索模式：点击时发射 `searchsubmit { search: searchParams }` + `searchchange { search: searchParams }`
  - 使用 `data-search` 属性标记 DOM 元素
- `__initProps` - 从 props 初始化 showSearchButton、searchText、searchParams

**按钮点击逻辑**：
```typescript
btn.addEventListener('click', () => {
    if (this.searchMode === 'simple') {
        this.emitSearchSubmit?.({ keyword: this.keyword });
        this.emitSearchChange?.({ keyword: this.keyword });
    } else {
        this.emitSearchSubmit?.({ search: this.searchParams });
        this.emitSearchChange?.({ search: this.searchParams });
    }
});
```

### 1.3.5 SearchAbility（兼容聚合层）

**职责**：组合所有搜索子能力，提供与现有 SearchAbility 兼容的 keyword/onSearch 接口。

**实现方式**：与 PaginationAbility 聚合层模式一致，通过 `Object.assign` 合并所有子能力，保持单个 `AbilityDefinition` 形式：

```typescript
export const SearchAbility: AbilityDefinition = Object.assign({},
    SearchInputAbility,
    SearchButtonAbility,
    SearchEventsAbility,
    {
        /**
         * 统一渲染协调
         */
        renderSearch(): void {
            if (!this.el) return;

            // 移除旧搜索元素
            const oldItems = this.el.querySelectorAll('[data-search]');
            oldItems.forEach((el: Element) => el.remove());

            const frag = document.createDocumentFragment();

            // 按位置顺序渲染
            this.renderSearchInput?.(frag);
            this.renderSearchButton?.(frag);

            this.el.appendChild(frag);
        },

        /**
         * 从 props 初始化（委托各子能力）
         */
        __initProps(props: Record<string, any>): void {
            // 搜索相关 props
            if (props.keyword !== undefined) this.keyword = props.keyword;
            if (props.searchMode) this.searchMode = props.searchMode;
            if (props.searchDebounce !== undefined) this.searchDebounce = props.searchDebounce;
            if (props.searchPlaceholder) this.searchPlaceholder = props.searchPlaceholder;
            if (props.showSearchButton !== undefined) this.showSearchButton = props.showSearchButton;
            if (props.searchText) this.searchText = props.searchText;
            if (props.searchParams) this.searchParams = props.searchParams;

            // 兼容旧 onSearch 回调
            if (props.onSearch) this.onSearch = props.onSearch;
        },
    },
);
```

**兼容性处理**：
- `keyword` 属性由 SearchInputAbility 提供，getter/setter 行为与旧版一致
- `onSearch` 回调保留在聚合层，作为 `SEARCH_EVENTS.CHANGE` 事件的便捷替代
  - 当 `onSearch` 被设置时，自动监听 `searchchange` 事件并调用回调
  - 这确保了 SelectComponent 等现有使用方的兼容性

### 1.3.6 component-events.ts 修改

**新增内容**：

```typescript
// ============================================
// 搜索事件（SearchAbility 发射）
// ============================================
export const SEARCH_EVENTS = {
    /** 搜索变更（关键词输入防抖后 / 搜索按钮点击 / 手动触发） */
    CHANGE: 'searchchange',
    /** 搜索提交（搜索按钮点击） */
    SUBMIT: 'searchsubmit',
} as const;
```

**ENTITY_EVENTS 新增**：

```typescript
// ---- 搜索变更 ----
/** 搜索变更（对应 ENTITY_SEARCH_EVENTS.CHANGE） */
SEARCH_CHANGE: 'entity:searchchange',
```

### 1.3.7 entity-events.ts 修改

**新增内容**：

```typescript
// ============================================
// 搜索事件（SearchAbility 触发）
// ============================================
export const ENTITY_SEARCH_EVENTS = {
    /** 搜索条件变更 */
    CHANGE: 'searchChange',
} as const;
```

### 1.3.8 ComponentEventBusAbility.ts 修改

**新增接口**：

```typescript
/**
 * 搜索桥接配置
 */
export interface SearchBridgeConfig {
    /** 事件源组件 id */
    source: string;
    /** 是否启用，默认 true */
    enabled?: boolean;
}
```

**ComponentEventBusConfig 接口新增**：

```typescript
export interface ComponentEventBusConfig {
    /** 分页桥接 */
    pagination?: PaginationBridgeConfig | string;
    /** CRUD 桥接 */
    crud?: CrudBridgeConfig | string;
    /** 选择桥接 */
    selection?: SelectionBridgeConfig | string;
    /** 搜索桥接 */
    search?: SearchBridgeConfig | string;  // 新增
    /** 自定义桥接 */
    [key: string]: any;
}
```

**BUILTIN_BRIDGE_KEYS 更新**：

```typescript
const BUILTIN_BRIDGE_KEYS = new Set(['pagination', 'crud', 'selection', 'search']);
```

**initComponentEvents 新增搜索桥接逻辑**：

```typescript
// 搜索桥接
const searchCfg = normalizeBridgeConfig(config.search);
if (searchCfg && searchCfg.enabled !== false) {
    this._componentOn(searchCfg.source, SEARCH_EVENTS.CHANGE, (e: any) => {
        if (typeof this.onSearchChange === 'function') {
            this.onSearchChange(e);
        }
    }, mgr);
}
```

**导入更新**：

```typescript
import { PAGINATION_EVENTS, CRUD_EVENTS, SELECTION_EVENTS, SEARCH_EVENTS } from '@qimenjs/events';
```

### 1.3.9 EntityListenAbility.ts 修改

**导入更新**：

```typescript
import { CRUD_EVENTS, CRUD_ACTIONS, PAGINATION_EVENTS, SEARCH_EVENTS } from '@qimenjs/events';
```

**_bindSearchListener 修改**：

```typescript
_bindSearchListener(): void {
    if (typeof this.on === 'function') {
        const off = this.on(SEARCH_EVENTS.CHANGE, (e: any) => {  // 替换硬编码 'searchchange'
            this._handleSearchChange(e);
        });
        if (typeof off === 'function') this.onCleanup(off);
    }
},
```

**注释更新**：将文件头部注释中的 `'searchchange'` 替换为 `SEARCH_EVENTS.CHANGE`。

### 1.3.10 EntityEmitAbility.ts 修改

**导入更新**：

```typescript
import {
    ENTITY_DATA_EVENTS,
    ENTITY_CRUD_EVENTS,
    ENTITY_LIST_EVENTS,
    ENTITY_TREE_EVENTS,
    ENTITY_REQUEST_STATUS,
    ENTITY_SEARCH_EVENTS,  // 新增
    buildRequestEvent,
    ENTITY_EVENTS,
} from '@qimenjs/events';
```

**_forwardEntityEvents 新增搜索事件转发**：

```typescript
// ---- 搜索变更事件 ----
this._forwardEvent(mgr, ENTITY_SEARCH_EVENTS.CHANGE, ENTITY_EVENTS.SEARCH_CHANGE, (searchData: any) => ({
    search: searchData,
    ...collectPaginationContext(mgr),
}), 'onEntitySearchChange');
```

### 1.3.11 interaction/SearchAbility.ts 修改

**保留现有代码**，在文件头部添加 `@deprecated` 注释：

```typescript
/**
 * SearchAbility 搜索能力
 *
 * @deprecated 请使用 toolbar/SearchAbility，支持简单搜索/复杂搜索两种模式、
 * 防抖 change 触发、搜索按钮、事件发射等完整功能。
 * 本文件仅为 SelectComponent 等现有使用方保留兼容。
 *
 * 提供 keyword 和 onSearch 回调
 */
```

### 1.3.12 ToolbarComponent.ts 修改

**abilities 数组新增 SearchAbility**：

```typescript
import { SearchAbility } from '@qimenjs/component-abilities';

export class ToolbarComponent extends ComponentBase {
    static override readonly abilities = [
        LayoutAbility, ChildrenAbility, AnimationAbility,
        ToolbarAbility, PaginationAbility, CrudAbility,
        SearchAbility,  // 新增
    ];
    // ...
}
```

# **2. 接口设计**

## **2.1 总体设计**

搜索能力遵循项目现有的 AbilityDefinition 模式：
- 每个子能力是一个普通对象，属性/方法通过 `Object.defineProperty` 复制到宿主
- getter/setter 对象直接作为 descriptor 的 get/set
- 方法 bind 到宿主后注入
- 私有状态通过 `abilityState(key, creator)` 管理
- 防抖通过 `ComposableBase.debounce()` 管理，宿主 dispose 时自动 cancel
- 清理通过 `onCleanup()` 注册

## **2.2 接口清单**

### SearchEventsAbility

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| emitSearchChange(data) | method | 发射 searchchange 事件，data 为 `{ keyword }` 或 `{ search }` |
| emitSearchSubmit(data) | method | 发射 searchsubmit 事件，data 为 `{ keyword }` 或 `{ search }` |
| emitSearch(params) | method | 复杂搜索手动触发，params 为 `Record<string, any>`，为空则静默返回 |

### SearchInputAbility

| 属性/方法 | 类型 | 默认值 | 说明 |
|-----------|------|--------|------|
| keyword | getter/setter | '' | 搜索关键词 |
| searchMode | getter/setter | 'simple' | 搜索模式 |
| searchDebounce | getter/setter | 300 | 防抖等待时间（ms），0 禁用 |
| searchPlaceholder | getter/setter | '请输入关键词' | 输入框占位文本 |
| renderSearchInput(frag) | method | - | 渲染搜索输入框 |
| __initProps | method | - | 从 props 初始化 |

### SearchButtonAbility

| 属性/方法 | 类型 | 默认值 | 说明 |
|-----------|------|--------|------|
| showSearchButton | getter/setter | true | 搜索按钮显隐 |
| searchText | getter/setter | '搜索' | 搜索按钮文本 |
| searchParams | getter/setter | {} | 复杂搜索参数 |
| renderSearchButton(frag) | method | - | 渲染搜索按钮 |
| __initProps | method | - | 从 props 初始化 |

### SearchAbility（聚合）

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| renderSearch() | method | 统一渲染协调 |
| onSearch | getter/setter | 兼容旧版搜索回调 |
| __initProps | method | 从 props 初始化（委托各子能力） |

### search-positions.ts

| 常量 | 值 | 说明 |
|------|-----|------|
| SEARCH_POSITIONS.INPUT | 5 | 搜索输入框位置 |
| SEARCH_POSITIONS.BUTTON | 8 | 搜索按钮位置 |

### ComponentEventBusAbility 新增

| 属性/接口 | 类型 | 说明 |
|-----------|------|------|
| SearchBridgeConfig | interface | 搜索桥接配置（source, enabled） |
| ComponentEventBusConfig.search | SearchBridgeConfig \| string | 搜索桥接配置项 |

### 事件常量新增

| 常量 | 值 | 所在文件 |
|------|-----|---------|
| SEARCH_EVENTS.CHANGE | 'searchchange' | component-events.ts |
| SEARCH_EVENTS.SUBMIT | 'searchsubmit' | component-events.ts |
| ENTITY_SEARCH_EVENTS.CHANGE | 'searchChange' | entity-events.ts |
| ENTITY_EVENTS.SEARCH_CHANGE | 'entity:searchchange' | component-events.ts |

# **3. 事件流设计**

## **3.1 简单搜索事件流**

```
用户输入 "test"
    │
    ▼
SearchInputAbility: keyword = "test"
    │
    ▼ debounce(300ms)
    │
SearchEventsAbility: emitSearchChange({ keyword: "test" })
    │
    ├──▶ emit('searchchange', { keyword: "test" })
    │       │
    │       ▼
    │   ComponentEventBusAbility (search 桥接)
    │       │
    │       ▼
    │   EntityListenAbility: onSearchChange({ keyword: "test" })
    │       │
    │       ▼
    │   EntityManager: filter("test")
    │       │
    │       ▼
    │   EntityEmitAbility: 转发 entity:searchchange
    │
    └──▶ onSearch?.("test")  [兼容旧版回调]
```

## **3.2 搜索按钮事件流**

```
用户点击搜索按钮
    │
    ▼
SearchButtonAbility: click handler
    │
    ├──▶ SearchEventsAbility: emitSearchSubmit({ keyword/search })
    │       └──▶ emit('searchsubmit', { keyword/search })
    │
    └──▶ SearchEventsAbility: emitSearchChange({ keyword/search })
            └──▶ emit('searchchange', { keyword/search })
                    │
                    ▼ (同上事件流)
```

## **3.3 复杂搜索事件流**

```
开发人员调用 emitSearch({ status: 'active' })
    │
    ▼
SearchEventsAbility: emitSearchChange({ search: { status: 'active' } })
    │
    ▼
emit('searchchange', { search: { status: 'active' } })
    │
    ▼
ComponentEventBusAbility → EntityListenAbility → EntityManager.searchBy({ status: 'active' })
```

# **4. 数据模型**

## **4.1 设计目标**

- 搜索状态通过 `abilityState` 管理，与现有 ComposableBase 模式一致
- 事件数据格式统一，简单搜索用 `keyword` 字段，复杂搜索用 `search` 字段
- 无需新增数据库或持久化模型

## **4.2 模型实现**

### abilityState 键名规范

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

注意：键名保持 `SearchAbility:` 前缀，确保与旧版 `abilityState` 键名兼容（keyword 属性的键名 `SearchAbility:keyword` 与旧版一致）。

### 事件数据模型

```typescript
/** 简单搜索 searchchange/searchsubmit 事件数据 */
interface SimpleSearchEventData {
    keyword: string;
}

/** 复杂搜索 searchchange/searchsubmit 事件数据 */
interface ComplexSearchEventData {
    search: Record<string, any>;
}

/** entity:searchchange 转发事件数据 */
interface EntitySearchChangeEventData {
    search: Record<string, any>;
    page?: number;
    pageSize?: number;
    total?: number;
    pages?: number;
    hasMore?: boolean;
}
```

### DOM 数据属性

| 属性 | 值 | 说明 |
|------|-----|------|
| data-search | 'input' | 搜索输入框 |
| data-search | 'button' | 搜索按钮 |
| data-position | number | 位置权重 |

### 搜索桥接配置模型

```typescript
/** 搜索桥接配置 */
interface SearchBridgeConfig {
    source: string;
    enabled?: boolean;
}

/** ComponentEventBusConfig 新增 search 字段 */
interface ComponentEventBusConfig {
    // ... 现有字段
    search?: SearchBridgeConfig | string;
}
```

# **5. 兼容性设计**

## **5.1 SelectComponent 兼容**

SelectComponent 继续使用 `interaction/SearchAbility`，该文件保留不变（仅添加 @deprecated 注释）。keyword 属性的 abilityState 键名 `SearchAbility:keyword` 保持一致。

## **5.2 EntityListenAbility 兼容**

`_bindSearchListener` 中将硬编码 `'searchchange'` 替换为 `SEARCH_EVENTS.CHANGE`，事件名字符串值仍为 `'searchchange'`，行为完全兼容。

## **5.3 ComponentEventBusAbility 兼容**

新增 search 桥接类型不影响现有 pagination/crud/selection 桥接。BUILTIN_BRIDGE_KEYS 新增 'search' 后，自定义桥接逻辑中 `search` key 不再走自定义路径，而是走内置搜索桥接路径。如果现有代码中有使用 `search` 作为自定义桥接 key 的情况，需要迁移到内置搜索桥接配置格式。

## **5.4 EntityEmitAbility 兼容**

新增搜索事件转发在 `_forwardEntityEvents` 方法末尾追加，不影响现有 CRUD/分页/树等事件转发逻辑。

## **5.5 ToolbarComponent 兼容**

ToolbarComponent 的 abilities 数组新增 SearchAbility，由于 SearchAbility 的 `__initProps` 只处理搜索相关 props，不影响现有 PaginationAbility 和 CrudAbility 的初始化。
