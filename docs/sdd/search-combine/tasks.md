# 搜索组合查询增强与 toolbar 目录重组 - 编码任务规划

## 任务依赖关系

```
任务1（SearchEventsAbility 类型签名改造）─── 无依赖，最先执行
    │
    ├──▶ 任务2（SearchButtonAbility 组合数据组装）─── 依赖任务1
    │
    ├──▶ 任务3（SearchInputAbility 防抖事件携带 searchParams）─── 依赖任务1
    │
    └──▶ 任务4（EntityListenAbility 互斥分支消除）─── 依赖任务1
            │
            └──▶ 任务5（toolbar 目录重组）─── 无逻辑依赖，但建议在任务1~4完成后执行
                    │
                    └──▶ 任务6（端到端集成验证）─── 依赖任务1~5
```

---

## 任务1：SearchEventsAbility 类型签名改造

**描述**：将 SearchEventsAbility 的 emitSearchChange 和 emitSearchSubmit 方法参数类型从联合类型改为组合类型，允许 keyword 和 search 同时存在。

**输入**：
- 现有 `src/component-abilities/toolbar/SearchEventsAbility.ts`
- spec.md 第 5.1 节搜索事件数据结构统一规则
- design.md 第 1.3.1 节 SearchEventsAbility 类型签名改造

**输出**：
- `SearchEventsAbility.ts` — 类型签名变更 + JSDoc 注释更新

**验收标准**：
1. `emitSearchChange` 方法参数类型从 `{ keyword: string } | { search: Record<string, any> }` 改为 `{ keyword?: string; search?: Record<string, any> }`
2. `emitSearchSubmit` 方法参数类型同上
3. `emitSearch` 方法签名和行为不变，仍以 `{ search: params }` 格式发射
4. 文件头部 JSDoc 注释更新：事件数据格式描述从 `{ keyword } 或 { search }` 改为 `{ keyword?, search? }`
5. `emitSearchChange` 的 JSDoc 注释更新为"data 可同时携带 keyword 和 search，实现组合查询"
6. `emitSearchSubmit` 的 JSDoc 注释同上
7. TypeScript 编译无错误

**代码生成提示**：
```
在 src/component-abilities/toolbar/SearchEventsAbility.ts 中：
1. 修改第 8~9 行文件头部注释，将 "数据格式 { keyword } 或 { search }" 改为 "数据格式 { keyword?, search? }"
2. 修改第 27 行 emitSearchChange 方法签名，将联合类型改为组合类型
3. 修改第 24~26 行 emitSearchChange 的 JSDoc 注释
4. 修改第 37 行 emitSearchSubmit 方法签名，将联合类型改为组合类型
5. 修改第 33~35 行 emitSearchSubmit 的 JSDoc 注释
6. emitSearch 方法（第 48~51 行）不做任何修改
```

---

## 任务2：SearchButtonAbility 组合数据组装改造

**描述**：改造 SearchButtonAbility 的搜索按钮点击逻辑，始终组装包含 keyword 和 search 的完整事件数据，不再按 searchMode 互斥选择。

**输入**：
- 任务1 产出的组合类型签名
- 现有 `src/component-abilities/toolbar/SearchButtonAbility.ts`
- spec.md 第 5.2 节 SearchButtonAbility 组合数据组装规则
- design.md 第 1.3.2 节 SearchButtonAbility 组合数据组装改造

**输出**：
- `SearchButtonAbility.ts` — 按钮点击逻辑改造 + JSDoc 注释更新

**验收标准**：
1. 搜索按钮点击事件中移除 `if (this.searchMode === 'simple') ... else ...` 互斥分支
2. 改为始终构建 `data` 对象：keyword 非空时添加 `data.keyword`，searchParams 非空对象时添加 `data.search`
3. searchMode='simple' 且 keyword='test' 且 searchParams={status:'active'} 时，点击按钮发射 `{ keyword: 'test', search: { status: 'active' } }`
4. searchMode='complex' 且 keyword='test' 且 searchParams={status:'active'} 时，点击按钮发射 `{ keyword: 'test', search: { status: 'active' } }`
5. keyword='' 且 searchParams={status:'active'} 时，事件数据为 `{ search: { status: 'active' } }`，不含 keyword 字段
6. keyword='test' 且 searchParams={} 时，事件数据为 `{ keyword: 'test' }`，不含 search 字段
7. `searchParams` 属性的 JSDoc 注释从"仅在 searchMode === 'complex' 时使用"改为"搜索参数，与 keyword 可同时使用"
8. 文件头部 JSDoc 注释更新：移除"简单搜索模式/复杂搜索模式"的互斥描述，改为"始终组装完整数据（keyword + search）"
9. TypeScript 编译无错误

**代码生成提示**：
```
在 src/component-abilities/toolbar/SearchButtonAbility.ts 中：
1. 修改第 1~12 行文件头部 JSDoc 注释，更新描述
2. 修改第 43~46 行 searchParams 属性的 JSDoc 注释
3. 修改第 72~79 行 btn.addEventListener('click', ...) 回调：
   - 移除 if-else 分支
   - 改为：
     const data: { keyword?: string; search?: Record<string, any> } = {};
     if (this.keyword) { data.keyword = this.keyword; }
     if (this.searchParams && Object.keys(this.searchParams).length > 0) { data.search = this.searchParams; }
     this.emitSearchSubmit?.(data);
     this.emitSearchChange?.(data);
```

---

## 任务3：SearchInputAbility 防抖事件携带 searchParams 改造

**描述**：改造 SearchInputAbility 的输入框防抖逻辑，防抖后发射 searchchange 时同时携带当前 searchParams（如果非空），并更新 searchMode 语义描述。

**输入**：
- 任务1 产出的组合类型签名
- 现有 `src/component-abilities/toolbar/SearchInputAbility.ts`
- spec.md 第 5.3 节 SearchInputAbility 组合数据携带规则 + 第 5.5 节 searchMode 语义调整
- design.md 第 1.3.3 节 SearchInputAbility 防抖事件携带 searchParams 改造

**输出**：
- `SearchInputAbility.ts` — 防抖逻辑改造 + searchMode JSDoc 注释更新

**验收标准**：
1. 防抖回调中构建 `data` 对象，始终包含 `keyword`
2. searchParams 非空对象时添加 `data.search`
3. keyword='test' 且 searchParams={status:'active'} 时，防抖后发射 `{ keyword: 'test', search: { status: 'active' } }`
4. keyword='test' 且 searchParams={} 时，防抖后发射 `{ keyword: 'test' }`，行为与改造前一致
5. `searchMode` 属性的 JSDoc 注释从"搜索模式"改为"UI 渲染模式：simple=显示输入框+搜索按钮，complex=仅显示搜索按钮"
6. 文件头部 JSDoc 注释中 searchMode 描述同步更新
7. TypeScript 编译无错误

**代码生成提示**：
```
在 src/component-abilities/toolbar/SearchInputAbility.ts 中：
1. 修改第 33~38 行 searchMode 属性的 JSDoc 注释
2. 修改第 90~99 行 input.addEventListener('input', ...) 回调中的防抖逻辑：
   - 将 () => { this.emitSearchChange?.({ keyword: this.keyword }); }
   - 改为：
     () => {
         const data: { keyword: string; search?: Record<string, any> } = { keyword: this.keyword };
         if (this.searchParams && Object.keys(this.searchParams).length > 0) {
             data.search = this.searchParams;
         }
         this.emitSearchChange?.(data);
     }
```

---

## 任务4：EntityListenAbility 互斥分支消除

**描述**：将 EntityListenAbility._handleSearchChange 中 keyword 和 search 的处理从 if-else if 互斥分支改为两个独立 if 分支，允许同时执行。

**输入**：
- 任务1 产出的组合类型签名
- 现有 `src/component-abilities/entity/EntityListenAbility.ts`
- spec.md 第 5.4 节 EntityListenAbility 互斥分支消除规则
- design.md 第 1.3.4 节 EntityListenAbility 互斥分支消除

**输出**：
- `EntityListenAbility.ts` — _handleSearchChange 逻辑改造

**验收标准**：
1. `_handleSearchChange` 方法中将 `else if` 改为独立 `if`
2. 事件数据为 `{ keyword: 'test', search: { status: 'active' } }` 时，先调用 `mgr.filter('test')`，再调用 `mgr.searchBy({ status: 'active' })`
3. 事件数据为 `{ keyword: 'test' }` 时，只调用 `mgr.filter('test')`，不调用 `mgr.searchBy`，行为与改造前一致
4. 事件数据为 `{ search: { status: 'active' } }` 时，只调用 `mgr.searchBy({ status: 'active' })`，不调用 `mgr.filter`，行为与改造前一致
5. keyword 为空字符串时，`eventData?.keyword !== undefined` 为 true，但 `mgr.filter('')` 仍会被调用（与改造前行为一致，空字符串 filter 是合法操作）
6. search 为空对象 `{}` 时，`eventData?.search` 为 truthy，`mgr.searchBy({})` 仍会被调用（与改造前行为一致）
7. `onEntitySearch` 和 `afterEntitySearch` 钩子的调用位置和逻辑不变
8. TypeScript 编译无错误

**代码生成提示**：
```
在 src/component-abilities/entity/EntityListenAbility.ts 中：
1. 修改第 181~185 行 _handleSearchChange 方法中的分支逻辑：
   - 将：
     if (eventData?.keyword !== undefined && typeof this.mgr.filter === 'function') {
         this.mgr.filter(eventData.keyword);
     } else if (eventData?.search && typeof this.mgr.searchBy === 'function') {
         this.mgr.searchBy(eventData.search);
     }
   - 改为：
     if (eventData?.keyword !== undefined && typeof this.mgr.filter === 'function') {
         this.mgr.filter(eventData.keyword);
     }
     if (eventData?.search && typeof this.mgr.searchBy === 'function') {
         this.mgr.searchBy(eventData.search);
     }
   - 仅删除 else 关键字，其余代码不变
```

---

## 任务5：toolbar 目录按功能分类重组

**描述**：将 toolbar 目录下 17 个平铺文件按功能分类移入子目录，新建 pagination/index.ts 和 search/index.ts 统一导出，更新根 toolbar/index.ts 的导出路径。

**输入**：
- 现有 `src/component-abilities/toolbar/` 目录下所有文件
- spec.md 第 5.6 节 toolbar 目录按功能分类重组规则
- design.md 第 1.3.5~1.3.9 节目录重组设计

**输出**：
- `toolbar/pagination/` 子目录（9 个文件移入 + 1 个新建 index.ts）
- `toolbar/search/` 子目录（5 个文件移入 + 1 个新建 index.ts）
- `toolbar/index.ts` — 更新导出路径

**验收标准**：
1. `toolbar/pagination/` 目录包含 9 个分页文件：PaginationAbility.ts、PaginationEventsAbility.ts、PaginationInfoAbility.ts、PaginationJumperAbility.ts、PaginationNavAbility.ts、PaginationPagesAbility.ts、PaginationSizerAbility.ts、PaginationStateAbility.ts、pagination-positions.ts
2. `toolbar/search/` 目录包含 5 个搜索文件：SearchAbility.ts、SearchButtonAbility.ts、SearchEventsAbility.ts、SearchInputAbility.ts、search-positions.ts
3. `toolbar/` 根目录仅包含：index.ts、ToolbarAbility.ts、CrudAbility.ts、pagination/ 子目录、search/ 子目录
4. `pagination/index.ts` 导出所有分页公共 API：PaginationAbility、PAGINATION_POSITIONS、PaginationStateAbility、PaginationEventsAbility、PaginationNavAbility、PaginationPagesAbility、PaginationJumperAbility、PaginationSizerAbility、PaginationInfoAbility
5. `search/index.ts` 导出所有搜索公共 API：SearchAbility、SEARCH_POSITIONS、SearchInputAbility、SearchButtonAbility、SearchEventsAbility
6. `toolbar/index.ts` 从 `./pagination` 和 `./search` 重导出，加上 `./ToolbarAbility` 和 `./CrudAbility`
7. 子目录内文件的相对导入路径不变（同目录内引用仍用 `'./xxx'`）
8. `component-abilities/index.ts` 的顶层导出不变
9. 外部 `from '@qimenjs/component-abilities'` 引用路径不变
10. TypeScript 编译无错误

**代码生成提示**：
```
1. 创建目录：
   mkdir src/component-abilities/toolbar/pagination
   mkdir src/component-abilities/toolbar/search

2. 移动分页文件（9 个）：
   git mv src/component-abilities/toolbar/PaginationAbility.ts src/component-abilities/toolbar/pagination/
   git mv src/component-abilities/toolbar/PaginationEventsAbility.ts src/component-abilities/toolbar/pagination/
   git mv src/component-abilities/toolbar/PaginationInfoAbility.ts src/component-abilities/toolbar/pagination/
   git mv src/component-abilities/toolbar/PaginationJumperAbility.ts src/component-abilities/toolbar/pagination/
   git mv src/component-abilities/toolbar/PaginationNavAbility.ts src/component-abilities/toolbar/pagination/
   git mv src/component-abilities/toolbar/PaginationPagesAbility.ts src/component-abilities/toolbar/pagination/
   git mv src/component-abilities/toolbar/PaginationSizerAbility.ts src/component-abilities/toolbar/pagination/
   git mv src/component-abilities/toolbar/PaginationStateAbility.ts src/component-abilities/toolbar/pagination/
   git mv src/component-abilities/toolbar/pagination-positions.ts src/component-abilities/toolbar/pagination/

3. 移动搜索文件（5 个）：
   git mv src/component-abilities/toolbar/SearchAbility.ts src/component-abilities/toolbar/search/
   git mv src/component-abilities/toolbar/SearchButtonAbility.ts src/component-abilities/toolbar/search/
   git mv src/component-abilities/toolbar/SearchEventsAbility.ts src/component-abilities/toolbar/search/
   git mv src/component-abilities/toolbar/SearchInputAbility.ts src/component-abilities/toolbar/search/
   git mv src/component-abilities/toolbar/search-positions.ts src/component-abilities/toolbar/search/

4. 新建 pagination/index.ts：
   export { PaginationAbility, PAGINATION_POSITIONS } from './PaginationAbility';
   export { PaginationStateAbility } from './PaginationStateAbility';
   export { PaginationEventsAbility } from './PaginationEventsAbility';
   export { PaginationNavAbility } from './PaginationNavAbility';
   export { PaginationPagesAbility } from './PaginationPagesAbility';
   export { PaginationJumperAbility } from './PaginationJumperAbility';
   export { PaginationSizerAbility } from './PaginationSizerAbility';
   export { PaginationInfoAbility } from './PaginationInfoAbility';

5. 新建 search/index.ts：
   export { SearchAbility, SEARCH_POSITIONS } from './SearchAbility';
   export { SearchInputAbility } from './SearchInputAbility';
   export { SearchButtonAbility } from './SearchButtonAbility';
   export { SearchEventsAbility } from './SearchEventsAbility';

6. 更新 toolbar/index.ts：
   export { ToolbarAbility } from './ToolbarAbility';
   export { PaginationAbility, PAGINATION_POSITIONS, PaginationStateAbility, PaginationEventsAbility, PaginationNavAbility, PaginationPagesAbility, PaginationJumperAbility, PaginationSizerAbility, PaginationInfoAbility } from './pagination';
   export { CrudAbility, CRUD_POSITIONS } from './CrudAbility';
   export { SearchAbility, SEARCH_POSITIONS, SearchInputAbility, SearchButtonAbility, SearchEventsAbility } from './search';

7. 子目录内文件的 import 路径无需修改（同目录内引用仍用 './xxx'）
```

---

## 任务6：端到端集成验证

**描述**：验证组合查询改造和目录重组的完整功能，确保组合查询、向后兼容、导出路径各环节正确联动。

**输入**：
- 任务1~5 的全部产出
- spec.md 全部验收条件

**输出**：
- 集成验证结果（通过/不通过）

**验收标准**：
1. **组合查询事件流**：keyword='test' + searchParams={status:'active'} → 输入框防抖/按钮点击发射 `{ keyword: 'test', search: { status: 'active' } }` → EntityListenAbility 先 filter 后 searchBy → EntityManager.search = { keyword: 'test', status: 'active' }
2. **仅 keyword 向后兼容**：仅传 keyword 时，EntityListenAbility 只调用 filter，行为与改造前一致
3. **仅 search 向后兼容**：仅传 search 时，EntityListenAbility 只调用 searchBy，行为与改造前一致
4. **emitSearch 兼容**：调用 emitSearch({status:'active'}) 仍以 `{ search: { status: 'active' } }` 格式发射
5. **searchMode 语义**：searchMode='simple' 时输入框渲染，searchMode='complex' 时输入框不渲染，两种模式事件数据均可同时携带 keyword 和 search
6. **目录重组导出**：`import { SearchAbility, PaginationAbility } from '@qimenjs/component-abilities'` 正常工作
7. **TypeScript 编译**：整个项目编译无错误
8. **现有测试**：所有现有测试通过

**代码生成提示**：
```
1. 运行 TypeScript 编译检查：npx tsc --noEmit
2. 运行现有测试：npm test
3. 验证导出路径：在测试文件中 import { SearchAbility, PaginationAbility, SearchInputAbility, SearchButtonAbility, SearchEventsAbility, SEARCH_POSITIONS, PAGINATION_POSITIONS } from '@qimenjs/component-abilities'，确认无编译错误
4. 验证组合查询：构造 keyword + searchParams 同时存在的场景，确认 EntityListenAbility 同时调用 filter 和 searchBy
```
