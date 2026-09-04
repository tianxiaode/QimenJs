# 主题系统最佳实践

> 日期：2026-08-07
> 状态：当前有效

## 核心原理

QimenJS 主题系统基于**纯 CSS 变量**：

- **CSS 变量层**：所有组件通过 CSS 变量引用主题色（`--q-color-*`），切换主题只需切换根元素上的 `data-*` 属性，自动生效，无需组件配合
- **JS 感知层**：仅当组件需要读取颜色值（如图表）时，通过 `getComputedStyle` 读取

## 1. 主题切换

```html
<!-- 根元素上设置 data-theme -->
<html data-theme="dark">
```

```javascript
// 切换亮/暗色
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.setAttribute('data-theme', 'light');

// 中国风预设
document.documentElement.setAttribute('data-theme-preset', 'cinnabar');

// 跟随系统偏好
const mql = window.matchMedia('(prefers-color-scheme: dark)');
function applySystemTheme() {
    if (!localStorage.getItem('qimenjs-theme')) {
        document.documentElement.setAttribute('data-theme', mql.matches ? 'dark' : 'light');
    }
}
mql.addEventListener('change', applySystemTheme);

// 保存用户偏好
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('qimenjs-theme', theme);
}
```

**要点**：
- 切换主题只需操作根元素上的 `data-*` 属性
- CSS 变量自动生效，组件无需任何代码
- 建议结合 localStorage 保存用户偏好
- 支持跟随系统主题偏好

## 2. 组件读取主题值

```typescript
// 读取 CSS 变量值
const root = document.documentElement;
const primaryColor = getComputedStyle(root)
    .getPropertyValue('--q-color-primary')
    .trim();

// 在组件中使用（每次渲染时读取，不用初始化时缓存）
class ChartComponent extends Component {
    render() {
        const primaryColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--q-color-primary')
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
    background: var(--q-color-primary);
    color: var(--q-color-on-primary);
    border-radius: var(--q-radius-md);
    padding: var(--q-space-sm) var(--q-space-md);
    box-shadow: var(--q-shadow-sm);
    transition: all var(--q-transition-fast);
}
```

**Design Tokens 分类**：

| Token 类别 | 前缀 | 示例 |
|-----------|------|------|
| 颜色 | `--q-color-` | `--q-color-primary`, `--q-color-on-primary`, `--q-color-primary-hover` |
| 叠加层 | `--q-overlay-` | `--q-overlay-hover`, `--q-overlay-active` |
| 阴影 | `--q-shadow-` | `--q-shadow-sm`, `--q-shadow-md` |
| 间距 | `--q-space-` | `--q-space-xs`, `--q-space-sm` |
| 圆角 | `--q-radius-` | `--q-radius-sm`, `--q-radius-md` |
| 字体 | `--q-font-` | `--q-font-size-sm`, `--q-font-weight-bold` |
| 过渡 | `--q-transition-` | `--q-transition-fast`, `--q-transition-normal` |

## 4. 自定义主题

主题变量在 `light.css` 的 `:root` 中定义，业务侧覆盖即可：

```css
/* 方式一：在业务 CSS 中直接覆盖（推荐，不影响框架文件） */
:root {
    --q-color-primary-h: 25;   /* 色相 0-360 */
    --q-color-primary-s: 80%;  /* 饱和度 0%-100% */
    --q-color-primary-l: 45%;  /* 明度 0%-100% */
}

/* 方式二：直接覆盖具体颜色值 */
:root {
    --q-color-primary: #ff6600;
    --q-color-primary-hover: #e65c00;
    --q-color-primary-active: #cc5200;
}

/* 方式三：给根元素加 data-theme-custom，遵循 custom.css 约定 */
<html data-theme-custom>
```

**要点**：
- 主色采用 HSL 三段式存储，hover/active/disabled 状态色由明度自动派生，大多数场景只需改 `h/s/l` 三个值
- 深色背景色系适合配置浅色 `--q-color-on-primary`

## 5. 主题文件引入

```css
/* 统一入口（推荐），应用入口引入一次即可 */
import '@/theme/theme.css';

/* 按需：只引入某几份文件 */
import '@/theme/light.css';
import '@/theme/dark.css';
import '@/theme/utilities.css';
```

**要点**：
- `theme.css` 已通过 `@import` 汇总全部主题文件
- 纯 CSS 方案由构建工具（Vite）处理，无编译环节
- 引入顺序：变量定义文件（light/dark/preset/custom）在前，工具类文件（utilities/utility/layout/skeleton）在后

## 6. 反模式

### 不要硬编码颜色值

```css
/* 错误 — 切换主题不会生效 */
.my-button { background: #1890ff; }

/* 正确 — 使用 CSS 变量 */
.my-button { background: var(--q-color-primary); }
```

### 不要在组件初始化时缓存主题值

```typescript
// 错误 — 初始化时读取主题，后续切换不感知
class MyComponent extends Component {
    private primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--q-color-primary')
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
            .getPropertyValue('--q-color-primary')
            .trim();
        this.chart.setOption({ color: [primaryColor] });
    }
}
```

### 不要直接修改 CSS 变量实现换肤

```typescript
// 错误 — 直接修改 CSS 变量，难以维护
document.documentElement.style.setProperty('--q-color-primary', '#ff0000');

// 正确 — 切换 data-* 属性，由主题文件统一接管
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.setAttribute('data-theme-preset', 'cinnabar');
```