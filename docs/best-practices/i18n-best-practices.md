# i18n 最佳实践

## 1. 语言包用 .js 文件，不要用 .json 文件

```js
// 正确 - .js 文件，通过 script 标签同步加载
// public/locales/zh-CN.js
__qimen_i18n_register__('zh-CN', {
  common: { save: '保存' },
});
```

```json
// 错误 - .json 文件无法通过 script 标签加载
// public/locales/zh-CN.json
{
  "common": { "save": "保存" }
}
```

**原因**：JSON 文件无法通过 `<script>` 标签加载。如果用 `fetch` 异步加载 JSON，页面启动时会有语言闪烁（先显示 key，再显示翻译）。`.js` 文件通过 `__qimen_i18n_register__` 全局函数同步注入消息，页面渲染时语言就已就绪。

## 2. 将 i18n 编译为独立 JS 预加载，不要在应用层 import 编译

```html
<!-- 正确 - i18n 核心编译为独立 JS，通过 script 标签预加载 -->
<script src="/i18n.js"></script>
<script>
  // i18n 核心已就绪，自动加载检测到的语言包
  qimenI18n.i18n.loadScript('/locales/' + qimenI18n.i18n.locale + '.js');
</script>
<script type="module" src="/src/main.ts"></script>
```

```typescript
// 正确 - 应用层从全局获取 i18n 实例
const i18n = (window as any).qimenI18n?.i18n;
i18n.t('common.save');
```

```typescript
// 错误 - 在应用层 import 编译 i18n 模块
import { i18n } from '@qimenjs/i18n';
// 问题：i18n 模块会被打包进应用代码，增加包体积
// 问题：__qimen_i18n_register__ 在应用代码执行后才可用，语言包 JS 无法提前加载
```

**原因**：将 `@qimenjs/i18n` 编译为独立的 `i18n.js`（IIFE 格式，约 2.5KB）放到 public 目录，通过 `<script>` 标签在应用代码之前加载。这样：
- `window.__qimen_i18n_register__` 在页面加载时就可用，语言包 JS 文件可以同步注册消息
- `window.qimenI18n.i18n` 在应用代码执行前就已就绪，无需等待模块编译
- 应用层不需要 import 和编译 i18n 模块，减少打包体积
- 语言包可以在 i18n.js 之后立即加载，确保首屏渲染时翻译已就绪

**编译方法**：使用 Vite 的 lib 模式编译 i18n 包：

```typescript
// vite.config.i18n.ts
import { defineConfig } from 'vite';
import path from 'path';

const SRC = path.resolve(__dirname, '../../../src');

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(SRC, 'i18n/index.ts'),
            name: 'qimenI18n',
            formats: ['iife'],
            fileName: () => 'i18n.js',
        },
        outDir: path.resolve(__dirname, 'public'),
        emptyOutDir: false,
    },
    resolve: {
        alias: { '@': SRC },
    },
});
```

```bash
# 编译 i18n.js
npx vite build --config vite.config.i18n.ts
```

## 3. 切换语言时先加载再切换

```typescript
// 正确 - 先加载语言包，再切换语言
await i18n.loadScript('/locales/en-US.js');
i18n.locale = 'en-US';
```

```typescript
// 错误 - 先切换语言，此时 en-US 没有消息
i18n.locale = 'en-US';
await i18n.loadScript('/locales/en-US.js');
// 切换和加载之间，t() 全部返回 key
```

**原因**：`i18n.locale = 'en-US'` 只是切换语言标识，不会自动加载语言包。如果 en-US 的消息还没注入，`t()` 会返回 key 本身。先 `loadScript` 确保消息就绪，再切换语言，避免中间状态。

## 4. 远程资源用 @qimenjs/http 加载，不要在 i18n 中内置网络请求

```typescript
// 正确 - 用 @qimenjs/http 加载远程资源
import { HttpClient } from '@qimenjs/http';
const client = new HttpClient('i18n');
const ctx = await client.get('/api/locales/business-terms').context;
i18n.inject(ctx.response.data, 'en-US');
```

```typescript
// 错误 - 在 i18n 中内置 fetch
i18n.loadRemote('/api/locales/business-terms');  // i18n 不应该管网络请求
```

**原因**：i18n 的职责是存消息和查消息，不是发网络请求。项目已有 `@qimenjs/http` 处理所有 HTTP 通信（含拦截器、缓存、重试等），在 i18n 中再实现一套 fetch 是重复且不一致的。`inject()` 是唯一的消息入口，任何来源的消息都通过它注入。

## 5. 用 inject() 注入消息，不要直接操作内部数据

```typescript
// 正确 - 通过 inject 注入，支持深度合并
i18n.inject({ common: { save: '保存' } });
i18n.inject({ common: { cancel: '取消' } });
// common.save 和 common.cancel 都存在
```

```typescript
// 错误 - 假设可以整体替换语言包
i18n.setMessages('zh-CN', { common: { save: '保存' } });
i18n.setMessages('zh-CN', { common: { cancel: '取消' } });
// common.save 丢失了
```

**原因**：`inject()` 内部使用 `mergeDeep` 深度合并，新消息合并到已有消息中，不会覆盖整个语言包。这保证了不同模块注入的消息可以共存，不会互相覆盖。

## 6. 语言包按模块拆分，不要把所有翻译放在一个文件

```js
// public/locales/zh-CN.js - 基础翻译（启动时加载）
__qimen_i18n_register__('zh-CN', {
  common: { save: '保存', cancel: '取消' },
  validation: { required: '{field}不能为空' },
});
```

```typescript
// 远程加载业务模块翻译（按需加载）
const ctx = await httpClient.get('/api/locales/order').context;
i18n.inject(ctx.response.data, 'zh-CN');
// order 模块的翻译合并到 zh-CN，不影响 common 和 validation
```

**原因**：基础翻译（按钮、验证、分页）随页面启动加载，保证首屏无闪烁。业务模块翻译按需从后端加载，减少首屏体积。`inject()` 的深度合并保证两者共存。

## 7. 监听事件刷新 UI，不要轮询

```typescript
// 正确 - 事件驱动
const off = i18n.onLocaleChange(() => {
  // 触发 Vue/React 重渲染
});
```

```typescript
// 错误 - 轮询检查
setInterval(() => {
  if (currentLocale !== i18n.locale) {
    currentLocale = i18n.locale;
    // 手动刷新
  }
}, 100);
```

**原因**：`onLocaleChange` 和 `onMessagesUpdate` 返回取消函数，用完即销毁，无性能开销。轮询浪费 CPU，且响应有延迟。

## 8. 语言包文件放在 public 目录，不要打包进应用代码

```
public/
  locales/
    zh-CN.js    ← 随页面加载
    en-US.js    ← 切换时加载
    ja-JP.js    ← 切换时加载
```

**原因**：语言包放在 public 目录，通过 `loadScript` 动态加载，好处是：
- 首屏只加载当前语言，减少包体积
- 切换语言时按需加载，不预加载所有语言
- 语言包可以独立更新，不需要重新构建应用
- 运维可以直接修改 public 目录的语言包，不需要开发介入

## 反模式清单

| 反模式 | 正确做法 |
|--------|----------|
| 用 .json 语言包 | 用 .js 文件 + `__qimen_i18n_register__` |
| 在应用层 import 编译 i18n 模块 | 编译为独立 i18n.js 预加载，从 `window.qimenI18n` 获取 |
| 先切换语言再加载语言包 | 先 `loadScript` 再切换 `locale` |
| 在 i18n 中内置 fetch | 用 `@qimenjs/http` + `inject()` |
| 整体替换语言包 | `inject()` 深度合并 |
| 所有翻译放一个文件 | 基础翻译放 public，业务翻译按需加载 |
| 轮询检查语言变化 | `onLocaleChange` 事件监听 |
| 语言包打包进应用代码 | 放 public 目录动态加载 |
