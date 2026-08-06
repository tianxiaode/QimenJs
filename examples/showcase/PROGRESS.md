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
- [ ] **验证首页可运行** — 阻塞于 props 传递架构问题

**已知问题**：
- TypeScript 静态类型无法识别 Ability 注入的方法（`nodeMap`/`routeOn`/`routeEmit`），运行时正常

**当前阻塞点 — 组件内容为空**：

通过 console.log 调试定位到以下根因：

1. **Navbar 子组件已创建成功** — Button/ToggleIcon/Spacer 通过 `_createItem` 正确创建并收到 props，但 Button 的 `text` 值为 `"i18n:nav.home"` 原始字符串，**i18n 前缀在运行时属性设置时未被解析**。

2. **Hero 的 `onAfterInit` 只收到 `{parent, slotName}`** — 没有 title/subtitle/desc。因为 TplNode 中 Hero 节点没有 `initConfig`，Hero 的内容依赖 `hero.update()` 在 HomePage 的 `onAfterInit` 中手动设置，时序脆弱。

3. **Footer 的 `i18n` 字段** — TplNode 的 `i18n` 属性在编译/运行时可能未被正确处理。

**根因分析 — Props 传递链路混乱**：

当前 props 有三种传递途径，容易出错：

| 途径 | 示例 | 问题 |
|------|------|------|
| `initConfig` | Navbar 的 items | 只在 instantiateChildComponents 展开，编译时无类型约束 |
| 构造函数 props | `new HeroComponent({title})` | 模板模式下无法传递，必须走 initConfig |
| `onAfterInit` 后手动 `update()` | `hero.update({title})` | 时序脆弱，依赖 nodeMap 就绪 |

**计划方案 — ExtJS 风格声明式 Props**：

参考 ExtJS 的 `config` 机制：TplNode 节点上随便写属性，编译引擎把非框架字段全传给组件，组件按 `static propsDef` 自行提取，不认识的忽略。

```ts
// 现在（乱）
{ name: 'hero', type: HeroComponent, cls: '...' }
// 然后 onAfterInit 里手动 hero.update({title: ...})

// 改进后（ExtJS 风格 — 扁平放，组件自取）
{ name: 'hero', type: HeroComponent, title: 'QimenJS', subtitle: '...', cls: 'q-hero' }

// 组件声明自己要什么
class HeroComponent extends Component {
    static propsDef = { title: String, subtitle: String, desc: String, actionText: String };
    onAfterInit(props) {
        // props 已包含 title/subtitle/desc/actionText，自动提取
    }
}
```

改进要点：
1. **TplNode 无需区分 initConfig/props** — 扁平放，组件自取
2. **组件自文档化** — `propsDef` 就是接口文档
3. **i18n 统一处理** — 提取时自动 resolve `i18n:` 前缀
4. **向后兼容** — 不认识的字段直接忽略，不报错
5. **统一传递** — 编译引擎把非框架字段（排除 name/type/children/cls/hidden/flex 等）全传入构造函数，不再有 initConfig/update/onAfterInit 三条路

**明天首先要做的事**：

1. **定义框架字段白名单** — 在 `tpl-node-def.ts` 的 `TPL_NODE_FIELDS` 中标记哪些字段是框架内部字段（编译引擎消费），剩余字段自动归为 props 传给组件
2. **修改 CompileEngine** — 编译时将非框架字段收集到 `nodeMetas[name].props` 中，对 `i18n:` 前缀的值调用 `resolveI18nValue`
3. **修改 instantiateChildComponents** — 用 `nodeMetas[name].props` 替代 `initConfig`，传入构造函数
4. **给 HeroComponent/ButtonComponent 添加 `static propsDef`** — 声明组件接受的属性
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
