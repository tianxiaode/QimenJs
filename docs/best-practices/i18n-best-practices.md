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
import { i18n } from '@qimen-lab/i18n';
// 问题：i18n 模块会被打包进应用代码，增加包体积
// 问题：__qimen_i18n_register__ 在应用代码执行后才可用，语言包 JS 无法提前加载
```

**原因**：将 `@qimen-lab/i18n` 编译为独立的 `i18n.js`（IIFE 格式，约 12KB）放到 public 目录，通过 `<script>` 标签在应用代码之前加载。这样：
- `window.__qimen_i18n_register__` 在页面加载时就可用，语言包 JS 文件可以同步注册消息
- `window.qimenI18n.i18n` 在应用代码执行前就已就绪，无需等待模块编译
- 应用层不需要 import 和编译 i18n 模块，减少打包体积
- 语言包可以在 i18n.js 之后立即加载，确保首屏渲染时翻译已就绪

**安装方式**：

```bash
npm install @qimen-lab/i18n

# 一键复制 i18n.js 和语言模板到 public 目录
npx qimen-i18n-copy
```

`npx qimen-i18n-copy` 会将 `i18n.js` 和 `locales/` 目录（含中英法三种语言模板）复制到项目的 `public/` 目录。版本变化时自动更新，版本不变时跳过。

## 3. 语言模板包含区域格式配置

语言包不仅包含翻译文本，还应包含区域格式配置（日期、时间、货币、数字、单位习惯等）：

```js
// public/locales/zh-CN.js
__qimen_i18n_register__('zh-CN', {
  // 区域格式配置（_locale 是保留键名）
  _locale: {
    date: {
      short: 'yyyy/M/d',       // 2024/1/5
      medium: 'yyyy年M月d日',   // 2024年1月5日
      full: 'yyyy年M月d日EEEE', // 2024年1月5日星期五
    },
    time: {
      short: 'H:mm',           // 9:30
      medium: 'H:mm:ss',       // 9:30:00
    },
    currency: {
      code: 'CNY',
      symbol: '¥',
      position: 'prefix',      // ¥1,234.56
      decimalDigits: 2,
    },
    number: {
      decimalSeparator: '.',
      groupSeparator: ',',
      groupSize: 3,
    },
    units: {
      length: 'metric',        // 公制
      temperature: 'celsius',
    },
    weekStart: 1,              // 周一
    hourCycle: 'h23',          // 24小时制
  },

  // 翻译文本
  common: { save: '保存', cancel: '取消' },
});
```

`@qimen-lab/i18n` 内置了三种语言模板，`npx qimen-i18n-copy` 会自动复制到 `public/locales/`：

| 文件 | 语言 | 货币 | 数字千分位 | 时间制 | 单位 |
|------|------|------|-----------|--------|------|
| `zh-CN.js` | 中文简体 | ¥ 前置 | 1,234.56 | 24h | 公制 |
| `en-US.js` | English | $ 前置 | 1,234.56 | 12h | 英制 |
| `fr-FR.js` | Français | € 后置 | 1 234,56 | 24h | 公制 |

## 4. 使用格式化函数

i18n 内置了日期、时间、数字、货币格式化函数，基于语言包中的 `_locale` 配置自动适配：

```js
// 日期格式化
qimenI18n.i18n.formatDate(new Date(), 'short');   // zh-CN: '2024/1/5'  en-US: '1/5/2024'  fr-FR: '05/01/2024'
qimenI18n.i18n.formatDate(new Date(), 'medium');  // zh-CN: '2024年1月5日'  en-US: 'Jan 5, 2024'
qimenI18n.i18n.formatDate(new Date(), 'full');    // zh-CN: '2024年1月5日星期五'  en-US: 'Friday, January 5, 2024'

// 时间格式化
qimenI18n.i18n.formatTime(new Date(), 'short');   // zh-CN: '9:30'  en-US: '9:30 AM'  fr-FR: '09:30'

// 数字格式化
qimenI18n.i18n.formatNumber(1234567.89, { decimalDigits: 2 });
// zh-CN: '1,234,567.89'  fr-FR: '1 234 567,89'

// 货币格式化
qimenI18n.i18n.formatCurrency(1234.5);
// zh-CN: '¥1,234.50'  en-US: '$1,234.50'  fr-FR: '1 234,50 €'
```

格式化函数会根据当前 `i18n.locale` 自动选择对应的 `_locale` 配置。切换语言后，同样的代码输出不同格式。

### 格式化 API

| 方法 | 说明 |
|------|------|
| `formatDate(date, style, locale?)` | 日期格式化，style: short/medium/long/full |
| `formatTime(date, style, locale?)` | 时间格式化，style: short/medium/long |
| `formatNumber(num, options?, locale?)` | 数字格式化，options: { decimalDigits, groupSeparator, decimalSeparator } |
| `formatCurrency(num, options?, locale?)` | 货币格式化，options: { symbol, position, decimalDigits } |
| `getLocaleConfig(locale?)` | 获取当前语言的区域格式配置 |

### 日期格式占位符

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `yyyy` | 四位年份 | 2024 |
| `M` / `MM` | 月份 | 1 / 01 |
| `d` / `dd` | 日期 | 5 / 05 |
| `MMM` | 月份缩写 | Jan / 1月 / janv. |
| `MMMM` | 月份全称 | January / 1月 / janvier |
| `EEE` | 星期缩写 | Fri / 周五 / ven. |
| `EEEE` | 星期全称 | Friday / 星期五 / vendredi |
| `H` / `HH` | 24小时 | 9 / 09 |
| `h` / `hh` | 12小时 | 9 / 09 |
| `m` / `mm` | 分钟 | 5 / 05 |
| `s` / `ss` | 秒 | 0 / 00 |
| `a` | AM/PM | AM / 上午 |

## 5. 切换语言时先加载再切换

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

## 6. 远程资源用 @qimen-lab/http 加载，不要在 i18n 中内置网络请求

```typescript
// 正确 - 用 @qimen-lab/http 加载远程资源
import { HttpClient } from '@qimen-lab/http';
const client = new HttpClient('i18n');
const ctx = await client.get('/api/locales/business-terms').context;
i18n.inject(ctx.response.data, 'en-US');
```

```typescript
// 错误 - 在 i18n 中内置 fetch
i18n.loadRemote('/api/locales/business-terms');  // i18n 不应该管网络请求
```

**原因**：i18n 的职责是存消息和查消息，不是发网络请求。项目已有 `@qimen-lab/http` 处理所有 HTTP 通信（含拦截器、缓存、重试等），在 i18n 中再实现一套 fetch 是重复且不一致的。`inject()` 是唯一的消息入口，任何来源的消息都通过它注入。

## 7. 用 inject() 注入消息，不要直接操作内部数据

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

## 8. 语言包按模块拆分，不要把所有翻译放在一个文件

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

## 9. 监听事件刷新 UI，不要轮询

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

## 10. 语言包文件放在 public 目录，不要打包进应用代码

```
public/
  i18n.js         ← i18n 核心（IIFE，约 12KB）
  locales/
    zh-CN.js      ← 中文（启动时加载）
    en-US.js      ← 英文（切换时加载）
    fr-FR.js      ← 法文（切换时加载）
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
| 语言包不含区域格式配置 | 在 `_locale` 中定义日期/时间/货币/数字/单位格式 |
| 手动拼接日期/货币格式 | 用 `formatDate`/`formatTime`/`formatNumber`/`formatCurrency` |
| 先切换语言再加载语言包 | 先 `loadScript` 再切换 `locale` |
| 在 i18n 中内置 fetch | 用 `@qimen-lab/http` + `inject()` |
| 整体替换语言包 | `inject()` 深度合并 |
| 所有翻译放一个文件 | 基础翻译放 public，业务翻译按需加载 |
| 轮询检查语言变化 | `onLocaleChange` 事件监听 |
| 语言包打包进应用代码 | 放 public 目录动态加载 |

## 11. 组件通过 SystemAbility.i18nConfig() 获取 i18n 配置

```typescript
// 正确 - 通过 SystemAbility 内置方法，事件触发后获取保证最新
const locale = this.i18nConfig();
const ui = locale?.ui;                    // { requiredMark, labelSeparator, ... }
const weekdays = locale?.weekdaysShort;   // ['日', '一', ...] 或 ['Sun', 'Mon', ...]
const weekStart = locale?.weekStart;      // 0 或 1
const months = locale?.monthsShort;       // ['1月', ...] 或 ['Jan', ...]
```

```typescript
// 错误 - 组件自己缓存 i18n 配置，locale 切换后不会更新
const config = getI18nManager().getLocaleConfig();
this._cachedConfig = config;  // 切换语言后还是旧值
```

**原因**：`this.i18nConfig()` 每次调用都从 I18nManager 获取最新配置，不缓存。组件在 `onLocaleChange()` 钩子中调用 `this.i18nConfig()` 做刷新，保证语言切换后立即生效。

## 12. 语言包应包含完整的日期显示配置

```js
// 正确 - 包含 weekdays/months，供日期组件直接使用
__qimen_i18n_register__('zh-CN', {
  _locale: {
    date: { short: 'yyyy/M/d', medium: 'yyyy年M月d日' },
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    weekdaysShort: ['日', '一', '二', '三', '四', '五', '六'],
    weekdaysMin: ['日', '一', '二', '三', '四', '五', '六'],
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    weekStart: 1,
    hourCycle: 'h23',
    ui: { labelSeparator: '：', requiredMark: '*', requiredMarkPosition: 'after' },
  },
});
```

```js
// 错误 - 只有 date 格式字符串，没有 weekdays/months，日期组件无法显示星期/月份名
__qimen_i18n_register__('zh-CN', {
  _locale: {
    date: { short: 'yyyy/M/d' },
    weekStart: 1,
  },
});
```

**原因**：`date.short/medium/long` 是格式化模板，供 `formatDate()` 使用。但日期选择器等组件需要直接显示星期标签（日/一/.../Sun/Mon/...）和月份名（1月/.../Jan/...），这些必须通过 `weekdaysShort`/`monthsShort` 提供。
