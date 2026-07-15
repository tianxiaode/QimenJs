# 主题系统最佳实践

> 日期：2026-07-15
> 状态：当前有效

## 核心原理

QimenJS 主题系统基于 **CSS 变量 + Design Tokens** 双层架构：

- **CSS 变量层**：所有组件通过 CSS 变量引用主题色，切换主题时自动生效，无需组件配合
- **JS 感知层**：组件声明 `static themeAware = true` 后，主题切换时触发 `onThemeChange(event)`

## 1. 主题切换

```typescript
import { ThemeRegistrar } from '@qimenjs/theme';

// 应用预设主题
ThemeRegistrar.apply('light');  // 亮色
ThemeRegistrar.apply('dark');   // 暗色

// 应用中国传统色主题（需先注册）
import { registerChineseThemes } from '@qimenjs/theme';
registerChineseThemes();
ThemeRegistrar.apply('celadon');  // 青瓷
```

**要点**：
- `apply()` 会自动更新 `:root` CSS 变量 + 触发 `theme:change` 全局事件
- 组件通过 CSS 变量引用主题色，无需任何代码即可响应主题切换
- 中国传统色主题通过 `registerChineseThemes()` 按需注册，不会自动加载

## 2. 组件感知主题变化

```typescript
class MyComponent extends TemplateComponent.withTemplate(tpl) {
    static themeAware = true;

    onThemeChange(event) {
        // event.theme — 当前主题名
        // event.tokens — 当前 DesignTokens
        this.updateChartColors(event.tokens);
    }
}
```

**要点**：
- 只有声明了 `static themeAware = true` 的组件才会收到 `theme:change` 事件
- 大部分组件不需要 `themeAware`，CSS 变量自动生效即可
- 只有需要 JS 层面响应主题变化的组件才需要声明

## 3. CSS 中使用主题变量

```css
.my-button {
    background: var(--q-color-primary);
    color: var(--q-color-on-primary);
    border-radius: var(--q-radius-md);
    padding: var(--q-spacing-sm) var(--q-spacing-md);
    box-shadow: var(--q-shadow-sm);
    transition: all var(--q-transition-fast);
}
```

**Design Tokens 分类**：

| Token 类别 | 前缀 | 示例 |
|-----------|------|------|
| ColorTokens | `--q-color-` | `--q-color-primary`, `--q-color-on-primary` |
| SpacingTokens | `--q-spacing-` | `--q-spacing-xs`, `--q-spacing-sm` |
| RadiusTokens | `--q-radius-` | `--q-radius-sm`, `--q-radius-md` |
| FontTokens | `--q-font-` | `--q-font-size-sm`, `--q-font-weight-bold` |
| ShadowTokens | `--q-shadow-` | `--q-shadow-sm`, `--q-shadow-md` |
| TransitionTokens | `--q-transition-` | `--q-transition-fast`, `--q-transition-normal` |
| BreakpointTokens | `--q-breakpoint-` | `--q-breakpoint-sm`, `--q-breakpoint-md` |

## 4. 原子 CSS

```typescript
import { AtomicCSS } from '@qimenjs/theme';

// 按需生成原子化 CSS 规则
const css = AtomicCSS.generate('flex items-center gap-4 p-2 bg-primary text-white rounded-md');
// → 输出对应的 CSS 规则字符串
```

**要点**：
- ~185 条预定义规则，覆盖常用布局/间距/颜色/排版
- 按需生成，不包含未使用的规则

## 5. 自定义主题

```typescript
import { ThemeRegistrar } from '@qimenjs/theme';

ThemeRegistrar.register('my-brand', {
    colors: {
        primary: '#ff6600',
        onPrimary: '#ffffff',
        secondary: '#336699',
        // ... 其他颜色
    },
    spacing: {
        xs: '2px',
        sm: '4px',
        // ... 其他间距
    },
    // ... 其他 tokens
});

ThemeRegistrar.apply('my-brand');
```

## 6. 反模式

### 不要硬编码颜色值

```css
/* 错误 — 切换主题不会生效 */
.my-button { background: #1890ff; }

/* 正确 — 使用 CSS 变量 */
.my-button { background: var(--q-color-primary); }
```

### 不要在组件中手动监听 theme:change

```typescript
// 错误 — 手动监听全局事件
globalEventBus.on('theme:change', (e) => { ... });

// 正确 — 声明 themeAware，框架自动管理
class MyComponent extends TemplateComponent.withTemplate(tpl) {
    static themeAware = true;
    onThemeChange(event) { ... }
}
```

### 不要在组件初始化时读取主题状态

```typescript
// 错误 — 初始化时读取主题，后续切换不感知
const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--q-color-primary');

// 正确 — 使用 themeAware + onThemeChange
class MyComponent extends TemplateComponent.withTemplate(tpl) {
    static themeAware = true;
    onThemeChange(event) {
        const primaryColor = event.tokens.colors.primary;
    }
}
```
