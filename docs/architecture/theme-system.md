# 主题系统

> QimenJS 主题系统基于 **CSS 变量驱动**，通过预设主题文件提供 Design Tokens，构建工具自动打包 CSS 变量。切换主题时通过 CSS 类或媒体查询生效，零 JS 开销。

## 概述

主题系统的核心设计：

- **CSS 变量驱动**：主题 token 扁平化为 CSS 变量，组件通过 `var(--q-colors-primary)` 引用
- **零 JS 开销**：切换主题只需切换 CSS 类或依赖媒体查询，组件无需重新渲染
- **按需打包**：构建工具自动收集被 import 的主题文件，未 import 的主题不会打包
- **中国传统色**：内置 8 个中国传统色主题（朱砂、青瓷、水墨、紫檀等）

## 架构

```
主题文件 (presets/*.ts)
  → tokensToCSSVariables(tokens)    → 生成 CSS 变量字符串
  → Vite 插件自动收集              → 合并输出到 CSS 文件
  → 浏览器加载 CSS                  → :root 注入变量
```

## 主题文件

### 预设主题结构

```typescript
// presets/light.ts
export const lightTheme: ThemeDefinition = {
    name: 'light',
    displayName: '宣纸',
    description: '宣纸色系，温润典雅，天青点缀如宋瓷',
    tokens: {
        colors: {
            primary: '#2a5f73',
            secondary: '#bfb09a',
            // ...
        },
        spacing: { /* ... */ },
        radius: { /* ... */ },
        font: { /* ... */ },
        shadow: { /* ... */ },
        transition: { /* ... */ },
        breakpoint: { /* ... */ },
    },
};

export const lightThemeCSS = tokensToCSSVariables(lightTheme.tokens);
```

### DesignTokens 结构

```typescript
interface DesignTokens {
    colors: ColorTokens;
    spacing: SpacingTokens;
    radius: RadiusTokens;
    font: FontTokens;
    shadow: ShadowTokens;
    transition: TransitionTokens;
    breakpoint: BreakpointTokens;
}
```

支持任意深度的嵌套对象，`flattenTokens` 会递归扁平化。

## 主题切换

### 方式一：CSS 类切换（手动）

```typescript
// 亮色
document.documentElement.classList.remove('dark');

// 暗色
document.documentElement.classList.add('dark');
```

CSS 文件中定义：

```css
/* 亮色主题（默认） */
:root {
    --q-colors-primary: #2a5f73;
    /* ... */
}

/* 暗色主题（通过 .dark 类激活） */
:root.dark {
    --q-colors-primary: #c4a360;
    /* ... */
}
```

### 方式二：媒体查询（自动跟随系统）

```css
/* 亮色主题（默认） */
:root {
    --q-colors-primary: #2a5f73;
}

/* 暗色主题（跟随系统偏好） */
@media (prefers-color-scheme: dark) {
    :root {
        --q-colors-primary: #c4a360;
    }
}
```

### 方式三：组合使用（推荐）

```css
/* 亮色主题（默认） */
:root {
    --q-colors-primary: #2a5f73;
}

/* 暗色主题（通过 .dark 类或媒体查询激活） */
:root.dark,
@media (prefers-color-scheme: dark) {
    :root {
        --q-colors-primary: #c4a360;
    }
}
```

JavaScript：

```typescript
// 从 localStorage 读取用户偏好
const savedTheme = localStorage.getItem('qimenjs-theme');
if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
} else if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
} else {
    // 跟随系统主题
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
}

// 监听系统主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('qimenjs-theme')) {
        document.documentElement.classList.toggle('dark', e.matches);
    }
});
```

## flattenTokens 扁平化

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

## 组件如何使用主题

### CSS 层面（自动生效）

组件样式使用 CSS 变量，无需任何 JS 代码：

```css
.q-btn {
    background: var(--q-colors-primary);
    color: var(--q-colors-on-primary);
    padding: var(--q-spacing-md);
    border-radius: var(--q-radius-md);
}
```

### JS 层面（读取当前值）

```typescript
const root = document.documentElement;
const primaryColor = getComputedStyle(root).getPropertyValue('--q-colors-primary').trim();
```

## 修改样式

### 修改现有主题

直接修改 preset 文件（如 `presets/cinnabar.ts`）中的 token 值。

### 创建自定义主题

```typescript
// my-theme.ts
import { tokensToCSSVariables } from '@qimenjs/theme';

export const myTheme: ThemeDefinition = {
    name: 'my-theme',
    displayName: '我的主题',
    tokens: {
        colors: {
            primary: '#ff0000',
            secondary: '#00ff00',
            // ...
        },
        // ...
    },
};

export const myThemeCSS = tokensToCSSVariables(myTheme.tokens);
```

```css
/* 在 CSS 文件中引入 */
@import './my-theme.css';

:root.my-theme {
    /* 复制 myThemeCSS 的内容 */
}
```

## 内置主题

| 主题名 | 中文名 | 说明 |
|--------|--------|------|
| light | 宣纸 | 默认亮色主题 |
| dark | 玄色 | 暗色主题 |
| cinnabar | 朱砂 | 红色系 |
| celadon | 青瓷 | 青绿色系 |
| ink | 墨色 | 黑灰色系 |
| rosewood | 紫檀 | 紫色系 |
| huaqing | 华清 | 蓝色系 |
| dai | 黛 | 深蓝色系 |
| yellow | 鹅黄 | 黄色系 |
| indigo | 靛青 | 靛蓝色系 |

按需 import 使用：

```typescript
import { celadonTheme, celadonThemeCSS } from '@qimenjs/theme';
```

## 参见

- [主题最佳实践](../best-practices/theme-best-practices.md)
- [事件系统](./event-system.md)
