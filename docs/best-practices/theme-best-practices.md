# 主题系统最佳实践

> 日期：2026-08-07
> 状态：当前有效

## 核心原理

QimenJS 主题系统基于 **CSS 变量 + Design Tokens** 双层架构：

- **CSS 变量层**：所有组件通过 CSS 变量引用主题色，切换主题时自动生效，无需组件配合
- **JS 感知层**：通过 `getComputedStyle` 读取当前 CSS 变量值

## 1. 主题切换

```typescript
// 方式一：CSS 类切换（手动）
document.documentElement.classList.add('dark');    // 切换到暗色
document.documentElement.classList.remove('dark'); // 切换到亮色

// 方式二：媒体查询（自动跟随系统）
window.matchMedia('(prefers-color-scheme: dark)').matches; // true/false

// 方式三：组合使用（推荐）
const savedTheme = localStorage.getItem('qimenjs-theme');
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
} else {
    // 跟随系统主题
    document.documentElement.classList.toggle('dark',
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );
}

// 保存用户偏好
function setTheme(theme: 'light' | 'dark') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('qimenjs-theme', theme);
}
```

**要点**：
- 切换主题只需操作 `document.documentElement.classList`
- CSS 变量自动生效，组件无需任何代码
- 建议结合 localStorage 保存用户偏好
- 支持跟随系统主题偏好

## 2. 组件读取主题值

```typescript
// 读取 CSS 变量值
const root = document.documentElement;
const primaryColor = getComputedStyle(root)
    .getPropertyValue('--q-colors-primary')
    .trim();

// 在组件中使用
class ChartComponent extends Component {
    render() {
        const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--q-colors-primary')
            .trim();
        this.chart.setOption({
            color: [primaryColor],
        });
    }
}
```

**要点**：
- 使用 `getComputedStyle` 读取 CSS 变量
- 主题切换后需要重新渲染才能获取新值
- 大部分组件不需要读取，CSS 变量自动生效即可

## 3. CSS 中使用主题变量

```css
.my-button {
    background: var(--q-colors-primary);
    color: var(--q-colors-on-primary);
    border-radius: var(--q-radius-md);
    padding: var(--q-spacing-sm) var(--q-spacing-md);
    box-shadow: var(--q-shadow-sm);
    transition: all var(--q-transition-fast);
}
```

**Design Tokens 分类**：

| Token 类别 | 前缀 | 示例 |
|-----------|------|------|
| ColorTokens | `--q-colors-` | `--q-colors-primary`, `--q-colors-on-primary` |
| SpacingTokens | `--q-spacing-` | `--q-spacing-xs`, `--q-spacing-sm` |
| RadiusTokens | `--q-radius-` | `--q-radius-sm`, `--q-radius-md` |
| FontTokens | `--q-font-` | `--q-font-size-sm`, `--q-font-weight-bold` |
| ShadowTokens | `--q-shadow-` | `--q-shadow-sm`, `--q-shadow-md` |
| TransitionTokens | `--q-transition-` | `--q-transition-fast`, `--q-transition-normal` |
| BreakpointTokens | `--q-breakpoint-` | `--q-breakpoint-sm`, `--q-breakpoint-md` |

## 4. 自定义主题

```typescript
import { tokensToCSSVariables } from '@qimenjs/theme';

const myTheme = {
    name: 'my-brand',
    tokens: {
        colors: {
            primary: '#ff6600',
            'on-primary': '#ffffff',
            secondary: '#336699',
            // ... 其他颜色
        },
        spacing: {
            xs: '2px',
            sm: '4px',
            // ... 其他间距
        },
        // ... 其他 tokens
    },
};

const myThemeCSS = tokensToCSSVariables(myTheme.tokens);
console.log(myThemeCSS);
// 输出：
// :root {
//   --q-colors-primary: #ff6600;
//   --q-colors-on-primary: #ffffff;
//   --q-colors-secondary: #336699;
//   ...
// }
```

## 5. 按需导入主题

```typescript
// 只导入需要的主题，构建工具只会打包被导入的主题
import { lightThemeCSS, darkThemeCSS } from '@qimenjs/theme';
import { celadonThemeCSS } from '@qimenjs/theme';

// 注入 CSS
const style = document.createElement('style');
style.textContent = lightThemeCSS;
document.head.appendChild(style);
```

**要点**：
- 构建工具会自动收集所有被 import 的 `.css.ts` 文件
- 未 import 的主题不会被打包
- 支持按需加载，减少包体积

## 6. 反模式

### 不要硬编码颜色值

```css
/* 错误 — 切换主题不会生效 */
.my-button { background: #1890ff; }

/* 正确 — 使用 CSS 变量 */
.my-button { background: var(--q-colors-primary); }
```

### 不要在组件初始化时缓存主题值

```typescript
// 错误 — 初始化时读取主题，后续切换不感知
class MyComponent extends Component {
    private primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--q-colors-primary')
        .trim();

    render() {
        // 使用缓存的值，主题切换后不会更新
        this.chart.setOption({ color: [this.primaryColor] });
    }
}

// 正确 — 每次渲染时读取
class MyComponent extends Component {
    render() {
        const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--q-colors-primary')
            .trim();
        this.chart.setOption({ color: [primaryColor] });
    }
}
```

### 不要在 JS 中直接修改 CSS 变量

```typescript
// 错误 — 直接修改 CSS 变量，难以维护
document.documentElement.style.setProperty('--q-colors-primary', '#ff0000');

// 正确 — 通过切换 CSS 类或媒体查询
document.documentElement.classList.add('dark');
```
