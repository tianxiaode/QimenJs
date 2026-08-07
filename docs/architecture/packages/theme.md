# @qimenjs/theme

**层级**: 第 1 层  
**状态**: ✅ 完成  
**依赖**: 无

## 概述

主题系统包，提供 Design Tokens 驱动的主题管理。通过 CSS 变量输出实现零 JS 开销的主题切换，支持亮色/暗色预设主题和 8 个中国传统色主题。

## 核心概念

### DesignTokens

主题本质是 Design Tokens 的集合，用 JSON 定义，运行时通过 CSS 变量输出到 `:root`：

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

### ThemeDefinition

```typescript
interface ThemeDefinition {
    name: string;           // 主题名称
    displayName?: string;   // 主题显示名称（如"青瓷"）
    description?: string;   // 主题描述
    tokens: DesignTokens;   // 设计令牌
}
```

## 预设主题

### 基础主题

| 主题名 | 说明 | CSS 变量导出 |
|--------|------|-------------|
| `light` | 亮色主题（宣纸） | `lightThemeCSS` |
| `dark` | 暗色主题（玄色） | `darkThemeCSS` |

```typescript
import { lightThemeCSS, darkThemeCSS } from '@qimenjs/theme';

// 注入 CSS
const lightStyle = document.createElement('style');
lightStyle.textContent = lightThemeCSS;
document.head.appendChild(lightStyle);

const darkStyle = document.createElement('style');
darkStyle.textContent = `:root.dark {\n${darkThemeCSS.slice(6)}\n}`;
darkStyle.setAttribute('data-theme', 'dark');
document.head.appendChild(darkStyle);
```

### 中国传统色主题（按需导入）

| 主题名 | 显示名 | 色系 | 寓意 |
|--------|--------|------|------|
| `celadon` | 青瓷 | 青瓷色系 | 清新温润，如雨后春山 |
| `cinnabar` | 朱砂 | 朱砂色系 | 热烈庄重，如故宫红墙 |
| `indigo` | 靛蓝 | 靛蓝色系 | 深邃沉静，如夜空星辰 |
| `yellow` | 鹅黄 | 鹅黄色系 | 明快温暖，如春日暖阳 |
| `rosewood` | 紫檀 | 紫檀色系 | 高贵典雅，如紫禁城底蕴 |
| `ink` | 墨色 | 墨色系 | 禅意留白，如山水画卷 |
| `dai` | 黛 | 黛色系 | 远山含翠，如江南烟雨 |
| `huaqing` | 华清 | 华清色系 | 温润如玉，如华清池水 |

```typescript
import { celadonTheme, celadonThemeCSS } from '@qimenjs/theme';
```

## API 参考

### 工具函数

| 函数 | 签名 | 说明 |
|------|------|------|
| `flattenTokens` | `flattenTokens(tokens, prefix?): Record<string, string \| number>` | 将嵌套 DesignTokens 扁平化为 CSS 变量映射 |
| `tokensToCSSVariables` | `tokensToCSSVariables(tokens: DesignTokens): string` | 将 DesignTokens 转换为 CSS 变量字符串 |

### 类型导出

```typescript
import type {
    ThemeDefinition,
    DesignTokens,
    ColorTokens,
    SpacingTokens,
    RadiusTokens,
    FontTokens,
    ShadowTokens,
    TransitionTokens,
    BreakpointTokens,
    ThemeChangeEvent,
    ThemeChangeHandler,
    ColorVariant,
} from '@qimenjs/theme';
```

### 常量导出

```typescript
import {
    THEME_CHANGE_EVENT,
    COLOR_VARIANTS,
    COLOR_VARIANT_MAP,
} from '@qimenjs/theme';
```

## 目录结构

```
src/theme/
├── index.ts              # 模块入口
├── utils.ts              # 工具函数（flattenTokens, tokensToCSSVariables）
├── skeleton.css.ts       # 骨架屏样式（框架必须）
├── types/
│   └── index.ts          # 类型定义
└── presets/
    ├── index.ts           # 预设导出汇总
    ├── light.ts           # 亮色主题
    ├── dark.ts            # 暗色主题
    ├── celadon.ts         # 青瓷主题
    ├── cinnabar.ts        # 朱砂主题
    ├── indigo.ts          # 靛蓝主题
    ├── yellow.ts          # 鹅黄主题
    ├── rosewood.ts        # 紫檀主题
    ├── ink.ts             # 墨色主题
    ├── dai.ts             # 黛色主题
    ├── huaqing.ts         # 华清主题
    ├── shared.ts          # 共享常量
    └── atomic-rules.ts    # 原子化 CSS 规则映射
```

## 设计决策

- **CSS 变量驱动**：主题切换本质是更新 `:root` 上的 CSS 变量，组件无需 JS 响应
- **按需打包**：构建工具自动收集被 import 的主题文件，未 import 的主题不会打包
- **零运行时依赖**：主题系统不依赖任何运行时注册器，纯 CSS 变量实现
- **前景色自动搭配**：每个语义颜色（primary/secondary/success/warning/error/info）都有对应的 `on-xxx` 前景色变量，确保背景色+前景色可读性

## 颜色变体常量

用于组件的 `colorVariant` 属性，控制语义颜色方案：

```typescript
import { ColorVariant, COLOR_VARIANTS, COLOR_VARIANT_MAP } from '@qimenjs/theme';

// 变体类型
type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// 变体 → CSS 变量映射
COLOR_VARIANT_MAP['error'] // { bg: '--q-colors-error', fg: '--q-colors-on-error' }
```

### on-xxx 前景色变量

所有主题预设均定义了 `on-xxx` 前景色，搭配对应背景色使用：

| 变量 | 说明 | light 默认 | dark 默认 |
|------|------|-----------|----------|
| `--q-colors-on-primary` | 主色前景 | `#ffffff` | `#0a0a0a` |
| `--q-colors-on-secondary` | 次要色前景 | `#302a23` | `#e8e0d0` |
| `--q-colors-on-success` | 成功色前景 | `#ffffff` | `#e8e0d0` |
| `--q-colors-on-warning` | 警告色前景 | `#6b5e4f` | `#0a0a0a` |
| `--q-colors-on-error` | 错误色前景 | `#ffffff` | `#e8e0d0` |
| `--q-colors-on-info` | 信息色前景 | `#ffffff` | `#0a0a0a` |

> warning 前景色为深色，因为黄色/警告色背景较浅，深色文字可读性更好。

## 构建工具集成

### Vite 插件

```typescript
// vite.config.ts
import { qimenCssPlugin } from './build-tools/vite-plugin-qimen-css';

export default defineConfig({
    plugins: [
        qimenCssPlugin({
            entryPoints: ['src/main.ts'],
            emitFile: true,
            outputFileName: 'qimen-components.css',
        }),
    ],
});
```

插件会自动：
1. 从入口文件开始递归分析 import 链
2. 收集所有 `import './xxx.css.ts'` 语句
3. 提取 CSS 内容（匹配 `export const xxxCSS = \`...\``）
4. 合并输出到单个 CSS 文件
