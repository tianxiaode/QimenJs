# 模板复用 + 动态 nodeMap 注册 — 设计评估

## 背景

当前组件体系中，模板（TemplateDecl）通过 `get tpl()` getter 定义，由 `TemplateManager.get(tpl)` 编译缓存，`InitAbility._buildDOM()` 中 `cloneNode` 克隆 DOM 并注册到 nodeMap。动态插入的 DOM（如搜索框）不在组件模板中，无法使用 nodeMap 便捷方法。

目标：充分利用 TemplateManager 复用模板，减少重复定义，支持动态注册 nodeMap。

## 当前机制分析

### nodeMap 注册流程

1. `TemplateManager.compileTemplate(tpl)` → `TemplateCache`（含 `indexs`、`nodes`、`names`）
2. `InitAbility._buildDOM()` → `cloneNode(true)` 克隆 DOM
3. `_applyNodeMeta()` 遍历 `cache.names`，通过 `_findByPath(indexPath)` 从 `this.el` 定位 → `_setNodeEl(name, el)` 缓存
4. `createChildren()` 遍历 `cache.childComponents`，实例化子组件并替换占位符

### 关键发现

- `getNodeEl(name)` **优先查 `this.nodeElements[name]` 缓存**，没有才 `_findByPath`
- 所有 NodeAbility/AttributeAbility/OptionAbility 方法（`setNodeAttr`、`setNodeText`、`addCls`、`setNodeHidden` 等）都通过 `getNodeEl` 访问节点
- **只要 `_setNodeEl(name, el)` 缓存了 DOM 引用，所有 nodeMap 功能就能正常工作**
- TemplateManager 缓存以 TemplateDecl 对象引用为 key，同一模板只编译一次

### TemplateManager 缓存机制

```typescript
static get(tpl: TemplateDecl): TemplateCache {
    const cached = this.tplCache.get(tpl);  // 对象引用为 key
    if (cached) return cached;
    const newCached = this.compileTemplate(tpl);
    this.tplCache.set(tpl, newCached);
    return newCached;
}
```

- 编译产物 `TemplateCache` 包含 `<template>` 元素，运行时 `cloneNode(true)` 高效克隆
- 多个组件实例用同一个 TemplateDecl → 同一个 TemplateCache → 各自独立 cloneNode

## mountTemplate 方案设计

### 核心 API

```typescript
mountTemplate(tpl: TemplateDecl, parent: HTMLElement, insertBefore?: Node | null): HTMLElement
```

### 工作流程

1. `TemplateManager.get(tpl)` 获取编译缓存
2. `cache.templateCache.content.cloneNode(true)` 克隆 DOM
3. `parent.insertBefore(rootEl, insertBefore)` 插入 DOM
4. 遍历 `cache.names`，从 `rootEl` 按 indexPath 查找命名节点 → `_setNodeEl(name, el)`
5. 遍历 `cache.childComponents`，实例化子组件并替换占位符

### 搜索框改造示例

改造前：
```typescript
const cache = TemplateManager.get(SEARCH_BAR_TPL);
const fragment = cache.templateCache!.content.cloneNode(true);
const wrapper = fragment.firstElementChild as HTMLElement;
container.insertBefore(wrapper, container.firstChild);
const inputEl = wrapper.querySelector('input') as HTMLInputElement;  // 手动 querySelector
this._searchInputEl = inputEl;
```

改造后：
```typescript
this.mountTemplate(SEARCH_BAR_TPL, container, container.firstChild);
const inputEl = this.getNodeEl('input') as HTMLInputElement;  // 走 nodeMap
```

## 风险与对策

| 风险 | 对策 |
|------|------|
| 节点命名冲突 | mountTemplate 时可选加前缀 |
| DOM 移除后缓存 stale | unmountTemplate 时清理对应 nodeElements |
| indexPath 相对性 | mountTemplate 内部从 rootEl 查找，不依赖 this.el |

## Nav/TreeNav 统一评估

### 结构差异对比

| 差异点 | Nav（扁平） | TreeNav（树形） |
|--------|------------|----------------|
| 数据模型 | items 直接用 | items → `_flattenTree` → `_flatData` |
| pathIndex | `href → number` | `href → number[]` |
| 点击行为 | 直接选中 | 有子节点→展开/折叠，叶子→选中 |
| 选中语义 | activeIndex = 扁平 index | activeIndex + `_selectedPath` |
| 展开/折叠 | 全局 mode | 逐节点 `_expandedPaths` |
| 路由 | 声明式 `router: 'switch'` | 手动 `routeEmit` + 祖先展开 |
| 容器模板 | NAV_TPL（含 collapseToggle） | 继承父类默认模板 |
| Item 模板 | 结构相同，CSS 前缀不同 | 结构相同，CSS 前缀不同 |

### 统一可行性

- **模板层面**：✅ 可统一。`get tpl()` 根据 `tree` option 返回不同 TemplateDecl
- **行为层面**：需要能力拆分或策略模式，不能仅靠模板切换
- **推荐**：模板切换 + 能力组合（或策略模式），而非简单模板切换

### 推荐架构

```
NavComponent（统一入口）
  ├── option: tree (true/false)
  ├── 模板选择: tree ? NAV_TREE_TPL : NAV_FLAT_TPL
  ├── 能力组合:
  │   ├── 共享: NavBaseAbility（路由监听、pathIndex 接口、selectAt 接口）
  │   ├── tree: false → FlatNavAbility（折叠、子菜单、扁平选中）
  │   └── tree: true  → TreeNavAbility（扁平化、展开/折叠、树形选中）
  └── 状态: activeIndex、pathIndex 由组件管理
```

## 能力+模板结合模式（核心设计）

### 核心理念

**能力 = 模板 + 操控方法**，引入能力就同时获得结构和行为。状态由组件管理。

### 当前模式 vs 新模式

**当前模式**（继承驱动）：
```
ListComponent extends ItemGroupPooledComponent
  → 在组件类中定义模板、搜索逻辑、事件处理
  → 搜索框模板和逻辑硬编码在组件中
```

**新模式**（能力+模板）：
```
ListComponent = ItemGroupPooledComponent + SearchAbility
  → SearchAbility 自带搜索模板（getter）+ 操控方法
  → 组件只管理状态（_searchKeyword、_allItemsData）
  → 引入能力 = 获得模板 + 行为
```

### 能力+模板的具体设计

```typescript
// SearchAbility — 自包含：模板 + 操控方法
export const SearchAbility: AbilityDefinition = {
    // 1. 能力提供模板
    get searchTpl(): TemplateDecl {
        return SEARCH_BAR_TPL;
    },

    // 2. 能力提供初始化（mountTemplate + 注册 nodeMap + 绑定事件）
    initSearch(): void {
        const container = this.getNodeEl('itemContainer');
        if (!container) return;
        this.mountTemplate(this.searchTpl, container, container.firstChild);
        const inputEl = this.getNodeEl('input') as HTMLInputElement;
        DomEventsEngine.addEventRule(this, {
            event: 'input', path: inputEl, handler: 'onSearchInput',
        });
    },

    // 3. 能力提供事件处理
    onSearchInput(): void {
        this._searchKeyword = this.getNodeEl('input')?.value?.trim()?.toLowerCase() ?? '';
        this.filterSearchItems();
    },

    // 4. 能力提供过滤逻辑
    filterSearchItems(): void {
        if (!this._searchKeyword) {
            super.setItems(this._allItemsData);
            return;
        }
        const filtered = this._allItemsData.filter((item: any) => {
            if (item.classes === 'q-list__group-title') return true;
            const label = String(item.label ?? '').toLowerCase();
            return label.includes(this._searchKeyword);
        });
        super.setItems(filtered);
    },

    // 5. 能力提供重置（show 时清空搜索）
    resetSearch(): void {
        if (this._searchKeyword) {
            this._searchKeyword = '';
            const inputEl = this.getNodeEl('input') as HTMLInputElement;
            if (inputEl) inputEl.value = '';
            super.setItems(this._allItemsData);
        }
    },
};

// ListComponent — 只管理状态和编排
class ListComponent extends ItemGroupPooledComponent {
    use([SearchAbility]);

    // 状态由组件管理
    _searchKeyword: string = '';
    _allItemsData: any[] = [];

    onAfterInit(): void {
        this.addCls('q-list');
        this.addCls(`q-list--${this.getData('size')}`);
        super.onAfterInit();
        if (this.getData('searchable')) {
            this.initSearch();  // 来自 SearchAbility
        }
    }

    setItems(items: any[]): void {
        this._allItemsData = items;
        if (this._searchKeyword) {
            this.filterSearchItems();  // 来自 SearchAbility
        } else {
            super.setItems(items);
        }
    }

    show(): void {
        this.resetSearch();  // 来自 SearchAbility
        super.show();
    }
}
```

### Nav/TreeNav 用能力+模板模式统一

```typescript
// NavBaseAbility — 共享逻辑
export const NavBaseAbility: AbilityDefinition = {
    selectAt(index: number, silent = false): void { ... },
    clearSelection(): void { ... },
    onRouteChange(event: any): void { ... },  // 框架
};

// NavFlatAbility — 扁平导航（自带模板+操控）
export const NavFlatAbility: AbilityDefinition = {
    get flatNavTpl(): TemplateDecl {
        return NAV_FLAT_TPL;  // 含 collapseToggle
    },
    _onFlatItemClick(domEvt: any): void { ... },
    _onCollapseToggle(): void { ... },
    setMode(value: string): void { ... },
    _syncItemConfig(): void { ... },
};

// NavTreeAbility — 树形导航（自带模板+操控）
export const NavTreeAbility: AbilityDefinition = {
    get treeNavTpl(): TemplateDecl {
        return NAV_TREE_TPL;  // 无 collapseToggle
    },
    _flattenTree(items: any[], depth: number, basePath: number[]): any[] { ... },
    _reflow(): void { ... },
    _toggleExpand(path: number[]): void { ... },
    _onTreeItemClick(domEvt: any): void { ... },
    _expandAncestors(path: number[]): void { ... },
};

// NavComponent — 统一入口，状态管理+编排
class NavComponent extends ItemGroupPooledComponent {
    use([NavBaseAbility, NavFlatAbility, NavTreeAbility]);

    // 状态由组件管理
    activeIndex: number = -1;
    pathIndex: Record<string, any> | null = null;
    _selectedPath: number[] | null = null;
    _expandedPaths: Set<string> = new Set();
    _flatData: any[] = [];

    get tpl(): TemplateDecl {
        return this.getData('tree') ? this.treeNavTpl : this.flatNavTpl;
    }

    onAfterInit(): void {
        this.addCls('q-nav');
        if (this.getData('tree')) {
            this._flatData = this._flattenTree(this.getData('items'), 0, []);
            this._scanInitialExpanded(this.getData('items'));
        } else {
            this._syncItemConfig();
        }
    }

    _onItemClick(domEvt: any): void {
        if (this.getData('tree')) {
            this._onTreeItemClick(domEvt);
        } else {
            this._onFlatItemClick(domEvt);
        }
    }
}
```

### 关键设计原则

1. **能力自带模板**：通过 getter 返回 TemplateDecl，引入能力即获得结构
2. **能力自带操控**：操控方法基于模板节点名设计，通过 `this.getNodeEl()` 访问
3. **状态归组件**：能力不维护状态，通过 `this` 访问组件的状态属性
4. **组件只编排**：组件管理状态、选择模板、委托行为

### 优势

| 优势 | 说明 |
|------|------|
| 自包含 | 引入能力 = 模板 + 行为，不需要额外定义 |
| 复用粒度细 | 不需要继承整个组件类，只需引入能力 |
| 状态清晰 | 状态统一由组件管理，避免能力间状态冲突 |
| 模板复用 | 多组件引入同一能力，共享模板定义 |

### 限制

| 限制 | 说明 |
|------|------|
| use() 静态 | 不能根据运行时 option 动态选择能力，需同时引入+方法内分叉 |
| 方法名冲突 | 多能力可能有同名方法，需加前缀区分 |
| 生命周期 | onAfterInit 等生命周期方法不能进能力，需在组件中调用能力方法 |
| this 上下文 | 能力方法通过 this 访问组件，需 nodeMap 就绪 |

## 多个相同模板对象的 nodeMap 处理

### 问题

一个组件中有多个相同模板实例（如 3 个搜索框），都用 `SEARCH_BAR_TPL`，每个都有 `input` 和 `icon` 命名节点，`getNodeEl('input')` 只能返回一个。

### 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| A: 命名空间前缀 | 简单直观 | 前缀管理手动 |
| B: 返回节点引用对象 | 不污染 nodeMap | 无法用 setNodeAttr 便捷方法 |
| C: 子组件实例化 | 完全隔离 | 回到组件实例化模式 |
| D: 返回独立 NodeMap 子集 | 多实例隔离+便捷方法 | 需定义返回对象接口 |

### 推荐：方案 D

```typescript
const searchBar1 = this.mountTemplate(SEARCH_BAR_TPL, container);
// searchBar1.getNodeEl('input'), searchBar1.setNodeAttr('input', ...)
const searchBar2 = this.mountTemplate(SEARCH_BAR_TPL, container);
// searchBar2.getNodeEl('input'), ...
```

`mountTemplate` 返回轻量 NodeMap 子集对象，绑定到本次克隆的 DOM 子树。

## 场景适配评估

### 判断标准

```
子项有独立状态？
  ├── 是 → 组件+option（子项是独立组件实例）
  └── 否 → 结构固定？
            ├── 是 → 能力+模板（能力自带模板+操控方法）
            └── 否 → 组件+option（子项类型可配置）
```

### 逐场景评估

| 场景 | 当前模式 | 适合能力+模板？ | 理由 |
|------|----------|----------------|------|
| **搜索框** | 手动 DOM 创建 | ✅ 非常适合 | 结构固定（input+icon）、行为统一（输入过滤）、状态简单、多组件可复用 |
| **Nav/TreeNav** | 两个派生组件 | ✅ 适合 | 模板可切换（扁平/树形）、行为可拆分，但树形逻辑复杂需策略辅助 |
| **Toolbar** | 组件+option | ✅ 适合（重新评估） | 子项功能基本与其他组件无关，事件可桥接转发，状态可归 Toolbar |
| **TableRow** | 手动 DOM 创建 | ❌ 不适合能力+模板 | 但应改为组件+option，走 ItemGroup 标准化流程 |
| **Table Cell** | 组件+option | ❌ 不适合 | Cell 有独立状态（checkbox checked、tree expanded） |
| **ButtonGroup** | 组件+option | ❌ 不适合 | 按钮有 pressed 态等独立状态 |
| **MenuItem** | 组件+option | ❌ 不适合 | 子菜单展开/折叠有独立状态 |
| **FormField** | 组件+option | ❌ 不适合 | 已是组件化模板，子组件需独立状态 |
| **Dialog** | 组件+option | ❌ 不适合 | 已是组件化模板，结构固定 |

### 两条路径的适用边界

**路径 A：能力+模板** — 适合结构固定、行为统一、状态可归父组件的场景
**路径 B：组件+option** — 适合结构可变、类型多样、子项需独立状态的场景
**路径 C：需要优化的** — 从手动 DOM 创建改为组件+option（如 TableRow）

## Toolbar 模板+能力模式评估

### 为什么 Toolbar 不适合

Toolbar 子项类型多样，可能包含 Select、DatePicker 等复杂组件。这些组件需要完整的组件实例来提供功能（下拉面板、日期计算、月份切换等）。模板渲染只能提供静态 DOM 结构，无法提供这些动态行为。

即使部分子项（按钮）可以用模板渲染，混合使用模板和组件实例会增加复杂度。

### 修正后的适用范围

**适合能力+模板的场景**：子项结构简单、行为统一、不需要组件级功能
- **搜索框** — input + icon，输入过滤
- **Nav/TreeNav** — 导航项（icon + text + expand），点击选中/展开
- **Tags** — 标签（text + close），点击删除/选中

**不适合的场景**：子项需要组件级功能（下拉面板、日期计算等）
- **Toolbar** — 可能包含 Select、DatePicker 等复杂组件
- **Table Cell** — checkbox、tree 等有独立状态
- **FormField** — 子组件需独立状态

### 核心判断标准（修正）

```
子项需要组件级功能（下拉面板、日期计算等）？
  ├── 是 → 组件+option（必须是独立组件实例）
  └── 否 → 子项有独立状态？
            ├── 是 → 组件+option
            └── 否 → 能力+模板（结构简单、行为统一）
```

## 状态

评估阶段，未实施。搜索框作为首个验证用例待定。
