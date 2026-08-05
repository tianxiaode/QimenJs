# 主题系统

> QimenJS 主题系统基于 **CSS 变量驱动**，通过 ThemeRegistrar 管理主题注册与切换。切换主题时更新 `:root` CSS 变量，所有组件自动生效，零 JS 开销。

## 概述

主题系统的核心设计：

- **CSS 变量驱动**：主题 token 扁平化为 CSS 变量，组件通过 `var(--q-colors-primary)` 引用
- **零 JS 开销**：切换主题只需更新 `:root` CSS 变量，组件无需重新渲染
- **事件通知**：主题切换时通过 `GlobalEventBus` 广播 `theme:change`，声明 `themeAware` 的组件可响应
- **中国传统色**：内置 10 个中国传统色主题（朱砂、青瓷、水墨、紫檀等）

## 架构

```
ThemeRegistrar (单例, extends RegistrarBase)
  → register(theme)       → storage.set(name, themeDef)
  → apply(name)           → flattenTokens → applyCSSVariables → emitChange
  → getToken(path)        → 读取当前主题的 token 值
  → initEventBus(eventBus) → 注入全局事件总线
```

## 主题注册

### 注册自定义主题

```typescript
import { ThemeRegistrar } from '@qimenjs/theme';

const tr = ThemeRegistrar.getInstance();

tr.register({
    name: 'my-theme',
    tokens: {
        colors: {
            primary: '#ff0000',
            secondary: '#00ff00',
            background: '#ffffff',
        },
        spacing: {
            base: '8px',
        },
    },
});
```

### DesignTokens 结构

```typescript
interface DesignTokens {
    colors?: Record<string, string | Record<string, string>>;
    spacing?: Record<string, string | Record<string, string>>;
    typography?: Record<string, string | Record<string, string>>;
    borderRadius?: Record<string, string>;
    shadow?: Record<string, string>;
    // ... 自定义 token
}
```

支持任意深度的嵌套对象，`flattenTokens` 会递归扁平化。

## 主题切换

### 切换流程

```
ThemeRegistrar.apply('dark')
  → flattenTokens(tokens)              // 嵌套 → 扁平
  → applyCSSVariables()                // 写入 :root CSS 变量
  → GlobalEventBus.emit('theme:change', payload)  // 通知组件
```

### flattenTokens 扁平化

```typescript
// 输入
{ colors: { primary: '#1890ff', success: { light: '#52c41a', dark: '#389e0d' } } }

// 输出
{
    '--q-colors-primary': '#1890ff',
    '--q-colors-success-light': '#52c41a',
    '--q-colors-success-dark': '#389e0d',
}
```

嵌套 key 用 `-` 连接，统一加 `--q-` 前缀。

### applyCSSVariables

将扁平化的 CSS 变量写入 `document.documentElement.style`：

```typescript
document.documentElement.style.setProperty('--q-colors-primary', '#1890ff');
```

所有组件通过 CSS `var(--q-colors-primary)` 引用，切换主题时自动生效。

## 组件如何感知主题变化

### CSS 层面（自动生效）

组件样式使用 CSS 变量，无需任何 JS 代码：

```css
.q-btn {
    background: var(--q-colors-primary);
    color: var(--q-colors-white);
    padding: var(--q-spacing-base);
}
```

### JS 层面（需要声明 themeAware）

组件声明 `static themeAware = true` 后，主题切换时触发 `onThemeChange`：

```typescript
class ChartComponent extends Component {
    static themeAware = true;

    onThemeChange(event) {
        // 重新渲染图表颜色
        this.reRenderWithTheme(event.tokens);
    }
}
```

**ThemeAbility** 在组件初始化时检查 `static themeAware`：
- `true` → 订阅 `theme:change` 事件，触发 `onThemeChange`
- 未声明或 `false` → 不订阅，零开销

## 修改样式

### 修改现有主题

直接修改 preset 文件（如 `presets/cinnabar.ts`）中的 token 值。

### 运行时修改 token

```typescript
const tr = ThemeRegistrar.getInstance();
tr.getToken('colors.primary');  // → '#1890ff'
```

### 替换主题

```typescript
tr.register({ name: 'my-theme', tokens: { colors: { primary: '#ff0000' } } });
tr.apply('my-theme');  // 切换到自定义主题
```

## 内置主题

| 主题名 | 中文名 | 说明 |
|--------|--------|------|
| light | 浅色 | 默认浅色主题 |
| dark | 深色 | 深色主题 |
| cinnabar | 朱砂 | 红色系 |
| celadon | 青瓷 | 青绿色系 |
| ink | 水墨 | 黑灰色系 |
| rosewood | 紫檀 | 紫色系 |
| huaqing | 华清 | 蓝色系 |
| dai | 黛 | 深蓝色系 |
| yellow | 藤黄 | 黄色系 |
| indigo | 靛青 | 靛蓝色系 |

通过 `registerChineseThemes()` 按需注册。

## 参见

- [主题最佳实践](../best-practices/theme-best-practices.md)
- [事件系统](./event-system.md)