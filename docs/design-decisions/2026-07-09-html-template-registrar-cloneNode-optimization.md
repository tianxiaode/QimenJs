# TemplateRegistrar cloneNode 优化 + 原型预热

> 日期：2026-07-09（初版） | 2026-07-10（追加原型预热）

## 1. 背景

当前 `HtmlTemplateRegistrar` 存储的是 `Map<string, string>`（HTML 模板字符串），每次获取模板后消费方通过 `el.innerHTML = templateHtml` 注入 DOM，再通过 `querySelectorAll('[data-content]')` / `querySelector('[data-ref="xxx"]')` 查找锚点元素。

**每次创建组件实例，都要重复执行：**
1. HTML 字符串解析（`innerHTML` 赋值触发浏览器 HTML parser 构建完整 DOM 树）
2. DOM 树遍历查询锚点（`querySelectorAll` / `querySelector`）
3. 事件属性读取（`getAttribute('data-event')` / `getAttribute('data-emit')`）
4. 内容属性定义（`Object.defineProperty` 在实例上定义 getter/setter）

对于频繁创建的组件（如 Table 行、Toast、Dropdown），这些开销是可避免的。

## 2. 决策

### 2.1 cloneNode 优化（已实施）

在 `HtmlTemplateRegistrar` 中新增 `getFragment(id)` 方法：

- `register` 时预创建 `<template>` 元素缓存，跳过运行时 HTML 解析
- `getFragment` 返回 `tpl.content.cloneNode(true)` 的 `DocumentFragment`

### 2.2 原型预热优化（已实施）

在 `ComponentBase.buildNodeMap()` 中实现原型预热：

- **首次实例化**：走完整路径（querySelectorAll + 生成索引表 + 模板元数据 + 原型属性），将结果存到类原型
- **后续实例化**：用索引表 + `el.children` 直接定位节点，跳过 querySelectorAll；从模板元数据读取事件信息，跳过 getAttribute；getter/setter 已在原型上，跳过 Object.defineProperty

## 3. 原因

### 3.1 为什么用 `<template>` 而非 `div` 做缓存容器

- `<template>.content` 天然是 `DocumentFragment`，不会触发渲染、不加载图片/脚本
- `div` 作为缓存容器，如果挂载到 document 会触发副作用；不挂载则 `innerHTML` 解析行为可能与实际 DOM 环境有差异（如 `<td>` 等元素会被修正）

### 3.2 为什么最终采用了路径索引方案

最初评估时认为路径索引是"过度优化"（方案 B），但后续实践发现：

1. **Table 行组件场景**：表格可能有数百行，每行都是独立组件实例。querySelectorAll 在高频实例化时开销不可忽略
2. **路径索引的"心智负担"问题不存在**：索引表由框架自动生成和维护，开发者无需手动编写。模板结构变化时，只需清除原型缓存，下次实例化自动重建
3. **原型预热是零成本抽象**：首次实例化生成的东西（索引表、模板元数据、getter/setter）存到原型后，后续实例直接继承，不增加 API 复杂度

最终方案将路径索引从注册器层移到了组件层，更合理：

| 方案 | innerHTML 解析 | querySelectorAll | getAttribute | defineProperty | 评估 |
|------|---------------|-----------------|-------------|---------------|------|
| 现状 | 每次解析 | 每次查询 | 每次读取 | 每次定义 | - |
| C: cloneNode | 消除 | 每次查询 | 每次读取 | 每次定义 | 只解决解析 |
| **D: cloneNode + 原型预热** | 消除 | 首次查询 | 首次读取 | 首次定义 | **采用** |

### 3.3 原型预热实现思路

```
首次实例化                                    后续实例化
─────────────────────────────────────────────────────────────
querySelectorAll → nodeMap                    findByPath → nodeMap
computeNodePath → _nodeIndexPath (原型)       直接使用原型上的 _nodeIndexPath
getAttribute → _nodeTemplateMetas (原型)      直接使用原型上的 _nodeTemplateMetas
buildContentPropertiesOnProto (原型)          原型上已有 getter/setter
```

关键数据结构：

- **`_nodeIndexPath`**：`Record<string, number[]>` — 节点位置索引表，key 为 `"group:name"`，value 为 `el.children` 路径（如 `[0, 1]` 表示 `el.children[0].children[1]`）
- **`_nodeTemplateMetas`**：`Record<string, NodeTemplateMeta>` — 模板元数据，包含 raw/group/name/mode/eventAttr/emitAttr 等信息，快速路径无需再读 DOM 属性
- **`_contentPropNames`**：`string[]` — 内容属性名列表，`initContentFromProps` 使用

使用 `el.children`（而非 `childNodes`）避免文本节点干扰。

### 3.4 性能对比

- `innerHTML = htmlString`：浏览器需经过 HTML parser → 构建 DOM 树 → 插入文档
- `appendChild(fragment)`：`cloneNode` 是内存中的结构复制，跳过 HTML 解析阶段
- `el.children[0].children[1]`：O(1) 直接索引访问，跳过 querySelectorAll 树遍历
- 对于同一模板多次实例化的场景（如列表项、Toast、Table 行），收益随实例数线性增长

## 4. 影响范围

### 4.1 HtmlTemplateRegistrar 变更

```typescript
export class HtmlTemplateRegistrar extends RegistrarBase<Map<string, string>> {
    protected storage = new Map<string, string>();
    private templateCache = new Map<string, HTMLTemplateElement>();

    register(id: string, template: string): void {
        this.checkLock();
        this.storage.set(id, template);
        this.templateCache.delete(id);
    }

    get(id: string): string {
        return this.storage.get(id)!;
    }

    getFragment(id: string): DocumentFragment {
        let tpl = this.templateCache.get(id);
        if (!tpl) {
            const html = this.storage.get(id);
            if (!html) throw new Error(`Template "${id}" not found`);
            tpl = document.createElement('template');
            tpl.innerHTML = html;
            this.templateCache.set(id, tpl);
        }
        return tpl.content.cloneNode(true) as DocumentFragment;
    }
}
```

### 4.2 ComponentBase 变更

`buildNodeMap()` 新增原型预热逻辑：

```typescript
buildNodeMap(): void {
    const proto = (this.constructor as typeof ComponentBase).prototype;

    // 后续实例化：原型上已有索引表，走快速路径
    if (proto._nodeIndexPath && proto._nodeTemplateMetas) {
        this.injectTemplates();
        this.buildNodeMapFast(proto._nodeIndexPath, proto._nodeTemplateMetas);
        return;
    }

    // 首次实例化：完整路径
    this.injectTemplates();
    const els = Array.from(this.el.querySelectorAll('[data-content]'));
    // ... 构建 nodeMap + eventMap + 索引表 + 模板元数据 ...
    this.buildContentPropertiesOnProto(templateMetas, isMultiArea);
    proto._nodeIndexPath = indexPath;
    proto._nodeTemplateMetas = templateMetas;
}
```

`NodeTemplateMeta` 包含 `eventAttr`/`emitAttr`，快速路径无需再读 DOM 属性：

```typescript
interface NodeTemplateMeta {
    raw: string; group: string; name: string;
    delegateTarget?: string; jsonRef?: string; jsonMode?: 'replace' | 'child';
    templateRef?: string; mode: 'value' | 'src' | 'html';
    eventAttr?: string;   // data-event 原始值
    emitAttr?: string;    // data-emit 原始值
}
```

### 4.3 消费方迁移

| 文件 | 当前写法 | 迁移后写法 |
|------|---------|-----------|
| `ComponentBase.initElement()` | `this.el.innerHTML = registrar.get(id)` | `this.el.appendChild(registrar.getFragment(id))` |
| `createOverlayManager()` | `overlayEl.innerHTML = registrar.get(id)` | `overlayEl.appendChild(registrar.getFragment(id))` |
| `ToastManager.create()` | `overlayEl.innerHTML = registrar.get(template)` | `overlayEl.appendChild(registrar.getFragment(template))` |
| `MsgboxManager.create()` | `overlayEl.innerHTML = registrar.get('Msgbox')` | `overlayEl.appendChild(registrar.getFragment('Msgbox'))` |

### 4.4 向后兼容

- `get(id)` 方法保持不变，返回 `string`，现有代码无需立即迁移
- `getFragment(id)` 是新增方法，可逐步迁移
- 原型预热对组件代码透明，无需任何改动

## 5. 替代方案

### 5.1 在注册器层缓存锚点映射

在 `register` 时预扫描模板中的 `data-content` 元素，记录树路径索引，`getFragment` 时一并返回。

未采用原因：路径索引与组件的 `isMultiArea`、事件推导等逻辑耦合，放在组件层更内聚。注册器只负责模板存储和克隆，不关心组件如何使用模板。

### 5.2 使用 `<template>` 标签替代字符串存储

将 `storage` 从 `Map<string, string>` 改为 `Map<string, HTMLTemplateElement>`，彻底移除字符串存储。

未采用原因：`get(id)` 返回 `string` 是现有 API 契约，直接移除会破坏兼容性。当前方案通过新增 `templateCache` 并行缓存，保持 `get()` 不变，渐进迁移更安全。

## 6. 实施细节

1. 在 `HtmlTemplateRegistrar` 中新增 `templateCache` 字段和 `getFragment()` 方法
2. `register()` 中同步创建 `<template>` 缓存
3. `unregister()` / `clear()` 中同步清理 `templateCache`
4. 逐个迁移消费方：`ComponentBase` → `createOverlayManager` → `ToastManager` → `MsgboxManager`
5. 在 `ComponentBase.buildNodeMap()` 中实现原型预热：首次生成索引表 + 模板元数据 + 原型属性，后续走快速路径
6. `NodeTemplateMeta` 新增 `eventAttr`/`emitAttr`，快速路径免读 DOM

## 7. 后续工作

- [x] 实施步骤 1-3：`HtmlTemplateRegistrar` 新增 `templateCache`、`getFragment()`、重写 `clear()`
- [x] 实施步骤 5-6：`ComponentBase` 原型预热 + `NodeTemplateMeta` 事件信息缓存
- [ ] 逐个迁移消费方：`ComponentBase` → `createOverlayManager` → `ToastManager` → `MsgboxManager`
- [ ] 补充 `getFragment` 的单元测试
- [ ] 性能基准测试：对比 `innerHTML` vs `cloneNode` + 原型预热在不同模板大小和实例数量下的表现
