# 主题系统

> QimenJS 主题系统采用**纯 CSS 变量**方案：主题以 `.css` 文件形式提供 Design Tokens（CSS 变量），通过 `@import` 统一汇总，由构建工具（Vite）直接处理，**零 TS 编译、零 JS 开销**。

## 概述

- **CSS 变量驱动**：Design Tokens 定义为 CSS 变量（`--q-color-*`、`--q-space-*` 等），组件通过 `var(...)` 引用
- **零编译**：主题是普通 `.css` 文件，无需 TypeScript 参与
- **属性切换**：通过根元素上的 `data-theme` / `data-theme-preset` / `data-theme-custom` 属性切换主题
- **亮暗覆盖**：`light.css` 在 `:root` 定义默认值，`dark.css` 用 `[data-theme="dark"]` 覆盖

## 文件结构

```
src/theme/
├── theme.css       # 统一入口，@import 汇总所有主题文件
├── light.css       # 亮色主题（:root 默认值，含全部设计变量）
├── dark.css        # 暗色主题（[data-theme="dark"] 覆盖）
├── utilities.css   # 工具类（颜色/按钮/间距/响应式）
├── preset.css      # 中国风预设主题（[data-theme-preset]）
├── custom.css      # 用户自定义主题（[data-theme-custom]）
├── skeleton.css    # 骨架屏 shimmer 动画
├── layout.css      # Flex/Grid/尺寸工具类
└── utility.css     # 显示/边框/圆角/层级/透明度工具类
```

## 使用方式

应用入口只需引入一次统一入口：

```css
/* Vite 工程：vite.config 已配置 @/ 别名指向 src/ */
import '@/theme/theme.css';
```

或者按需只引入需要的文件（例如只要亮色 + 工具类）：

```css
import '@/theme/light.css';
import '@/theme/utilities.css';
```

## 变量体系

| 类别 | 前缀 | 示例 |
|------|------|------|
| 颜色 | `--q-color-` | `--q-color-primary`, `--q-color-on-primary` |
| 叠加层 | `--q-overlay-` | `--q-overlay-hover`, `--q-overlay-active` |
| 阴影 | `--q-shadow-` | `--q-shadow-sm`, `--q-shadow-md` |
| 间距 | `--q-space-` | `--q-space-sm`, `--q-space-md` |
| 圆角 | `--q-radius-` | `--q-radius-md`, `--q-radius-round` |
| 字体 | `--q-font-` | `--q-font-size-md`, `--q-font-weight-bold` |
| 过渡 | `--q-transition-` | `--q-transition-fast` |
| 层级 | `--q-z-` | `--q-z-modal`, `--q-z-tooltip` |
| 透明度 | `--q-opacity-` | `--q-opacity-disabled` |
| 光标 | `--q-cursor-` | `--q-cursor-pointer` |

主色采用 **HSL 三段式**存储（`--q-color-primary-h/s/l`），`hover/active/disabled` 状态色由明度计算派生，便于预设主题与用户自定义直接覆盖三个值完成换肤。

## 主题切换

### 亮/暗色

```css
/* light.css 已把 :root 作为亮色默认 */
```

```html
<html data-theme="dark">   <!-- 暗色 -->
<html data-theme="light">  <!-- 亮色（或省略，默认即为亮色） -->
```

```javascript
document.documentElement.setAttribute('data-theme', 'dark');
```

### 中国风预设

```html
<html data-theme-preset="cinnabar">  <!-- 朱砂红 -->
```

`preset.css` 内置 10 个预设，均基于 HSL 覆盖主/辅色：

| 值 | 名称 | 色系 |
|----|------|------|
| `cinnabar` | 朱砂红 | 故宫红，含金色点缀变量 |
| `indigo` | 黛蓝 | 水墨蓝 |
| `pine` | 松花绿 | 青绿山水 |
| `amber` | 琥珀黄 | 宫廷黄 |
| `rouge` | 胭脂粉 | 唐风 |
| `bamboo` | 竹青 | 文人墨客 |
| `sienna` | 缃色 | 秋色 |
| `lotus` | 藕荷紫 | 雅致 |
| `navy` | 藏青 | 沉稳 |
| `chartreuse` | 秋香绿 | 田园 |

预设可与亮/暗色自由组合，`[data-theme="dark"][data-theme-preset]` 有专门适配（暗色宣纸、金色微调、墨色反转）。

### 用户自定义

```html
<html data-theme-custom>  <!-- 应用自定义主色 -->
```

```css
/* custom.css 中只需修改 3 个值 */
[data-theme-custom] {
    --q-color-primary-h: 340;
    --q-color-primary-s: 70%;
    --q-color-primary-l: 45%;
}
```

## 组件如何使用主题

组件样式直接引用 CSS 变量，主题切换自动生效，无需任何 JS：

```css
.q-button {
    background: var(--q-color-primary);
    color: var(--q-color-on-primary);
    border-radius: var(--q-radius-md);
}
```

需要读取当前值（如图表类组件）：

```javascript
const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--q-color-primary')
    .trim();
```

## 创建自定义主题

无需修改框架文件，推荐二选一：

1. **业务 CSS 中覆盖变量**（推荐）：

```css
:root {
    --q-color-primary-h: 200;
    --q-color-primary-s: 80%;
    --q-color-primary-l: 40%;
}
```

2. **遵循 `custom.css` 约定**：给根元素加 `data-theme-custom` 后覆盖 `--q-color-primary-h/s/l`。

## 参见

- [主题最佳实践](../best-practices/theme-best-practices.md)
- [主题资源说明](./packages/theme.md)