# QimenJS Showcase 实施计划与进度

## 项目目标

在 `examples/showcase` 下创建一个示范项目，充分体现 QimenJS 的模板驱动 + Ability 架构 + Extends 继承模式特性，让 AI 能轻松复制并实施新项目。

## 整体架构

```
examples/showcase/
├── package.json          # 依赖全部指向 ../../src/* (file: 协议)
├── vite.config.ts        # alias + server.fs.allow: ['..']
├── tsconfig.json         # paths 映射 @qimenjs/* → ../../src/*
├── index.html            # 入口 HTML (FontAwesome CDN)
└── src/
    ├── main.ts           # 入口：Router 注册 + 挂载 ShowcaseApp
    ├── ShowcaseApp.ts    # 应用外壳：Navbar + RouteContainer + Footer
    ├── styles/
    │   └── showcase.css  # 全局样式 (CSS 变量 + dark 模式)
    ├── pages/
    │   ├── HomePage.ts       # 首页：Hero + 特性卡片网格
    │   ├── ComponentsPage.ts # 组件页：侧栏导航 + 组件展示
    │   ├── TemplatesPage.ts  # 模板页：Admin 布局 + 登录 (未实现)
    │   └── DocsPage.ts       # 文档页：JSDoc API 文档 (未实现)
    └── components/          # 应用级子组件 (预留)
```

## 技术要点

- **全部使用模板模式**：`Component.useTemplate(TPL)`，不使用 `new` 模式创建子组件
- **Ability 注入**：`ShowcaseApp.use(RouteEventBusAbility)` 提供路由能力
- **TplNode text 属性**：已添加，编译时直接写入 HTML，运行时通过 contentMode getter/setter 操作
- **FlexConfig 扩展**：已添加 `flex`/`minHeight`/`maxHeight`/`minWidth`/`maxWidth`/`height`/`width`/`overflow`
- **CSS 注入**：组件 CSS 通过 `xxxCSS` 导出 + 动态创建 `<style>` 标签注入
- **路由**：`RouteContainerComponent` + `Router` hash 路由

## 源码修改记录

### 已修改的框架源码

1. **`src/component-core/types/tpl-node-types.ts`**
   - `FlexConfig` 新增：`flex`/`minHeight`/`maxHeight`/`minWidth`/`maxWidth`/`height`/`width`/`overflow`
   - `TplNode` 新增：`text` 属性（编译时写入 HTML）

2. **`src/component-core/types/tpl-node-def.ts`**
   - `TPL_NODE_FIELDS` 新增：`text` 字段定义（category='content', toMeta=true）

3. **`src/component-core/engine/CompileEngine.ts`**
   - `buildTagHtml` 方法：支持 `text` 属性，编译时写入 HTML（含 XSS 转义）
   - 新增 `escapeHtml` 工具函数

4. **`src/component-core/abilities/NodePropAbility.ts`**
   - `applyFlexGrid` 函数：支持 FlexConfig 扩展属性

### 已修改的测试文件

1. **`test/unit/component-core/engine/CompileEngine.test.ts`**
   - 新增：`text` 属性编译测试、HTML 转义测试、text+children 共存测试

2. **`test/unit/component-core/abilities/NodePropAbility.test.ts`**
   - 新增：FlexConfig 扩展属性测试（flex/minH/maxH/minW/maxW/height/width/overflow）
   - 新增：数字自动加 px 测试

3. **`test/unit/component-core/types/tpl-body-def.test.ts`**
   - 新增：`text` 字段定义测试
   - 新增：`copyMetaFields`/`copyRootFields` 对 text 字段的处理测试

## 阶段进度

### 阶段一：清理 + 首页骨架 — 阻塞中

- [x] 删除 `examples/component-demo` 和 `examples/full-stack`
- [x] 创建 `examples/showcase` 项目骨架
- [x] 实现 `ShowcaseApp`（Navbar + RouteContainer + Footer）
- [x] 实现 `HomePage`（Hero + 特性卡片）
- [x] 实现 `ComponentsPage` 占位页
- [x] 全局样式（CSS 变量 + dark 模式 + 响应式）
- [x] 修复 Vite @fs/ MIME 问题 → 添加 `server.fs.allow: ['..']`
- [x] 框架增强：TplNode 添加 `text` 属性
- [x] 框架增强：FlexConfig 扩展 flex/minH/maxH/minW/maxW/height/width/overflow
- [x] 更新单元测试（CompileEngine + NodePropAbility + tpl-node-def）
- [x] i18n 集成：复制 qimen-i18n.js + 语言包到 public/
- [x] 导航菜单使用 i18n key（nav.home/nav.components 等）
- [x] Footer 使用 i18n key（footer.copyright/footer.tagline）
- [x] Hero 内容通过 t() 函数获取 i18n 翻译
- [x] 组件页分类标题使用 i18n key
- [x] **验证首页可运行** — 已修复 props 传递 + i18n resolve 问题

**已知问题**：
- TypeScript 静态类型无法识别 Ability 注入的方法（`nodeMap`/`routeOn`/`routeEmit`），运行时正常

**已修复 — 组件内容为空问题**：

根因：
1. **Hero TplNode 缺少声明式属性** — Hero 节点没有写 `title`/`subtitle`/`desc`/`actionText`，`meta.props` 为空
2. **ButtonComponent `onAfterInit` 未 resolve i18n** — `_rawProps.text` 值为 `i18n:nav.home` 原始字符串，直接赋值未解析
3. **HeroComponent `onAfterInit` 未 resolve i18n** — 同上，且未处理 hidden 状态
4. **HomePage `hero.update()` 时序脆弱** — 依赖 nodeMap 就绪，异步时序不可靠

修复方案（已实施）：
1. **TplNode 添加索引签名** — `[key: string]: any`，允许自定义属性（ExtJS 风格声明式 Props）
2. **HomePage TplNode** — Hero 节点直接写 `title: 'i18n:hero.title'` 等声明式属性
3. **HeroComponent** — `onAfterInit` 改为从 `_rawProps` 读取，自动 resolve i18n 前缀，处理 hidden
4. **ButtonComponent** — `onAfterInit` 对 `_rawProps.text` 做 i18n resolve
5. **HomePage** — 删除 `onAfterInit` 中的 `hero.update()`，保留 action 事件绑定

Props 传递链路（修复后统一为一条路）：
TplNode 自定义属性 → collectExtraFields → meta.props → instantiateChildComponents → 构造函数 → _rawProps → applyConfig(自动resolve i18n) → onAfterInit(补充hidden处理)
5. **修改 showcase TplNode** — Hero 节点直接写 `title`/`subtitle`/`desc`，Button 的 `text` 写 `i18n:nav.home`
6. **验证首页可运行**

### 阶段二：组件页

- [ ] 侧栏组件导航可点击切换展示组件
- [ ] 右侧组件展示区：Button、Badge、Card、Alert、Avatar、Tag 等
- [ ] 每个组件附带示例代码展示
- [ ] 尽量使用模板模式

### 阶段三：模板页

- [ ] Admin 模板布局（侧栏 + 头部 + 内容区）
- [ ] 登录页模板
- [ ] 使用模板模式组合

### 阶段四：文档页

- [ ] 切换到 JSDoc 生成的 API 文档区
- [ ] 可考虑 iframe 嵌入或 Markdown 渲染
