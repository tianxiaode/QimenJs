# HtmlTemplateRegistrar cloneNode 优化

> 日期：2026-07-09

## 1. 背景

当前 `HtmlTemplateRegistrar` 存储的是 `Map<string, string>`（HTML 模板字符串），每次获取模板后消费方通过 `el.innerHTML = templateHtml` 注入 DOM，再通过 `querySelectorAll('[data-content]')` / `querySelector('[data-ref="xxx"]')` 查找锚点元素。

**每次创建组件实例，都要重复执行：**
1. HTML 字符串解析（`innerHTML` 赋值触发浏览器 HTML parser 构建完整 DOM 树）
2. DOM 树遍历查询锚点（`querySelectorAll` / `querySelector`）

对于频繁创建的组件（如 Table 行、Toast、Dropdown），这些开销是可避免的。

## 2. 决策

在 `HtmlTemplateRegistrar` 中新增 `getFragment(id)` 方法：

- `register` 时预创建 `<template>` 元素缓存，跳过运行时 HTML 解析
- `getFragment` 返回 `tpl.content.cloneNode(true)` 的 `DocumentFragment`
- 锚点查询（`querySelectorAll` / `querySelector`）保持在组件层，不在注册器层缓存

## 3. 原因

### 3.1 为什么用 `<template>` 而非 `div` 做缓存容器

- `<template>.content` 天然是 `DocumentFragment`，不会触发渲染、不加载图片/脚本
- `div` 作为缓存容器，如果挂载到 document 会触发副作用；不挂载则 `innerHTML` 解析行为可能与实际 DOM 环境有差异（如 `<td>` 等元素会被修正）

### 3.2 为什么锚点查询保持在组件层

讨论中考虑了三种方案：

| 方案 | innerHTML 解析 | querySelectorAll | 实现复杂度 | 评估 |
|------|---------------|-----------------|-----------|------|
| 现状 | 每次解析 | 每次查询 | - | - |
| A: cloneNode + 缓存选择器 | 消除 | 每次查询（挪了位置） | 低 | 无实际收益 |
| B: cloneNode + 路径索引 | 消除 | O(1) 索引 | 中 | 过度优化 |
| C: cloneNode，锚点不变 | 消除 | 每次查询 | 低 | **推荐** |

**方案 A**：缓存 CSS 选择器字符串，克隆后还是要 `querySelector`，和消费方自己做没区别，只是把查询逻辑从消费方挪到了注册器。

**方案 B**：缓存树路径索引（如 `childNodes[0].childNodes[1].childNodes[2]`），克隆后按路径直接索引访问，O(1) 取到元素。但代价是：
- 代码可读性降低，调试时不如 `querySelector('[data-ref="input"]')` 直观
- 模板结构变化时路径失效（运行时模板不变，所以实际不会出问题，但维护时心智负担高）

**方案 C（采用）**：`innerHTML` 解析是真正的性能瓶颈，`cloneNode` 消除了它。`querySelectorAll` 在组件级模板（通常几十个节点）上开销微乎其微，不值得用路径索引来优化。消费方改动也很小。

### 3.3 性能对比

- `innerHTML = htmlString`：浏览器需经过 HTML parser → 构建 DOM 树 → 插入文档
- `appendChild(fragment)`：`cloneNode` 是内存中的结构复制，跳过 HTML 解析阶段
- 对于同一模板多次实例化的场景（如列表项、Toast），收益随实例数线性增长

## 4. 影响范围

### 4.1 HtmlTemplateRegistrar 变更

```typescript
export class HtmlTemplateRegistrar extends RegistrarBase<Map<string, string>> {
    protected storage = new Map<string, string>();
    // 新增：模板元素缓存
    private templateCache = new Map<string, HTMLTemplateElement>();

    register(id: string, template: string): void {
        this.checkLock();
        this.storage.set(id, template);
        // 预创建 <template> 缓存
        const tpl = document.createElement('template');
        tpl.innerHTML = template;
        this.templateCache.set(id, tpl);
    }

    unregister(id: string): void {
        this.checkLock();
        this.storage.delete(id);
        this.templateCache.delete(id);
    }

    /** 原有方法保持不变，返回字符串 */
    get(id: string): string {
        return this.storage.get(id)!;
    }

    /** 新增：返回克隆的 DocumentFragment，性能更优 */
    getFragment(id: string): DocumentFragment {
        const tpl = this.templateCache.get(id);
        if (!tpl) throw new Error(`Template "${id}" not found`);
        return tpl.content.cloneNode(true) as DocumentFragment;
    }
}
```

### 4.2 消费方迁移

涉及 4 处生产代码：

| 文件 | 当前写法 | 迁移后写法 |
|------|---------|-----------|
| `ComponentBase.initElement()` | `this.el.innerHTML = registrar.get(id)` | `this.el.appendChild(registrar.getFragment(id))` |
| `ComponentBase.reinitElement()` | `this.el.innerHTML = registrar.get(id)` | `this.el.appendChild(registrar.getFragment(id))` |
| `createOverlayManager()` | `overlayEl.innerHTML = registrar.get(id)` | `overlayEl.appendChild(registrar.getFragment(id))` |
| `ToastManager.create()` | `overlayEl.innerHTML = registrar.get(template)` | `overlayEl.appendChild(registrar.getFragment(template))` |
| `MsgboxManager.create()` | `overlayEl.innerHTML = registrar.get('Msgbox')` | `overlayEl.appendChild(registrar.getFragment('Msgbox'))` |

锚点查询代码（`querySelectorAll` / `querySelector`）无需任何改动。

### 4.3 向后兼容

- `get(id)` 方法保持不变，返回 `string`，现有代码无需立即迁移
- `getFragment(id)` 是新增方法，可逐步迁移

## 5. 替代方案

### 5.1 在注册器层缓存锚点映射（方案 B）

在 `register` 时预扫描模板中的 `data-content` / `data-ref` 元素，记录树路径索引，`getFragment` 时一并返回。克隆后按路径索引直接取元素，跳过 `querySelectorAll`。

未采用原因：组件级模板节点数少（通常 < 50），`querySelectorAll` 开销可忽略；路径索引增加代码复杂度和维护心智负担，收益不成比例。如果未来有性能数据证明 `querySelectorAll` 是瓶颈，可再追加此优化。

### 5.2 使用 `<template>` 标签替代字符串存储

将 `storage` 从 `Map<string, string>` 改为 `Map<string, HTMLTemplateElement>`，彻底移除字符串存储。

未采用原因：`get(id)` 返回 `string` 是现有 API 契约，直接移除会破坏兼容性。当前方案通过新增 `templateCache` 并行缓存，保持 `get()` 不变，渐进迁移更安全。

## 6. 实施细节

1. 在 `HtmlTemplateRegistrar` 中新增 `templateCache` 字段和 `getFragment()` 方法
2. `register()` 中同步创建 `<template>` 缓存
3. `unregister()` / `clear()` 中同步清理 `templateCache`
4. 逐个迁移消费方：`ComponentBase` → `createOverlayManager` → `ToastManager` → `MsgboxManager`
5. 迁移完成后，`get(id)` 标记为 `@deprecated`，引导使用 `getFragment(id)`

## 7. 后续工作

- [x] 实施步骤 1-3：`HtmlTemplateRegistrar` 新增 `templateCache`、`getFragment()`、重写 `clear()`
- [ ] 逐个迁移消费方：`ComponentBase` → `createOverlayManager` → `ToastManager` → `MsgboxManager`
- [ ] 补充 `getFragment` 的单元测试
- [ ] 性能基准测试：对比 `innerHTML` vs `cloneNode` 在不同模板大小和实例数量下的表现
- [ ] 评估是否需要追加路径索引优化（方案 B）
