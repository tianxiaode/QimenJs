# @qimenjs/theme

**层级**: 第 1 层  
**状态**: ✅ 完成  
**依赖**: registry, events

## 概述

主题系统包，提供 Design Tokens 驱动的主题管理。通过 CSS 变量输出实现零 JS 开销的主题切换，支持亮色/暗色预设主题和 7 个中国传统色主题。

## 核心概念

### Design Tokens

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
    name: string;           // 主题名称，同一 ThemeRegistrar 内唯一
    displayName?: string;   // 主题显示名称（如"青瓷"）
    description?: string;   // 主题描述
    tokens: DesignTokens;   // 设计令牌
}
```

### ThemeRegistrar

继承 `RegistrarBase`，统一管理主题的注册、切换和 CSS 变量输出：

```typescript
import { ThemeRegistrar } from '@qimenjs/theme';
import { globalEventBus } from '@qimenjs/events';

const registrar = ThemeRegistrar.getInstance();
registrar.apply('dark');  // 切换主题，自动更新 :root CSS 变量
```

## 预设主题

### 基础主题（自动注册）

| 主题名 | 说明 |
|--------|------|
| `light` | 亮色主题 |
| `dark` | 暗色主题 |

`import '@qimenjs/theme'` 时自动注册。

### 中国传统色主题（按需注册）

| 主题名 | 显示名 | 色系 | 寓意 |
|--------|--------|------|------|
| `celadon` | 青瓷 | 青瓷色系 | 清新温润，如雨后春山 |
| `cinnabar` | 朱砂 | 朱砂色系 | 热烈庄重，如故宫红墙 |
| `indigo` | 靛蓝 | 靛蓝色系 | 深邃沉静，如夜空星辰 |
| `yellow` | 鹅黄 | 鹅黄色系 | 明快温暖，如春日暖阳 |
| `rosewood` | 紫檀 | 紫檀色系 | 高贵典雅，如紫禁城底蕴 |
| `ink` | 墨色 | 墨色系 | 禅意留白，如山水画卷 |
| `dai` | 黛色 | 黛色系 | 远山含翠，如江南烟雨 |

```typescript
import { registerChineseThemes, ThemeRegistrar } from '@qimenjs/theme';

// 注册中国色主题（需手动调用）
registerChineseThemes();

// 应用主题
const registrar = ThemeRegistrar.getInstance();
registrar.apply('celadon');
```

## API 参考

### ThemeRegistrar 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `register` | `register(theme: ThemeDefinition): void` | 注册主题 |
| `unregister` | `unregister(name: string): void` | 注销主题 |
| `get` | `get(name: string): ThemeDefinition` | 获取主题定义 |
| `has` | `has(name: string): boolean` | 检查主题是否已注册 |
| `apply` | `apply(name: string): void` | 应用主题（更新 CSS 变量 + 触发事件） |
| `getToken` | `getToken(path: string): string \| number \| undefined` | 获取令牌值（如 `colors.primary`） |
| `toCSSVariables` | `toCSSVariables(): string` | 生成 CSS 变量样式文本 |
| `initEventBus` | `initEventBus(eventBus: GlobalEventBus): void` | 注入事件总线 |

### 导出函数

| 函数 | 说明 |
|------|------|
| `registerPresetThemes(extra?)` | 注册 light + dark 预设主题，可选传入额外主题 |
| `registerChineseThemes()` | 注册 7 个中国传统色主题 |
| `flattenTokens(tokens, prefix?)` | 将嵌套 DesignTokens 扁平化为 CSS 变量映射 |

### AtomicCSS

原子化 CSS 按需生成器，与主题 CSS 变量联动：

```typescript
const atomic = AtomicCSS.getInstance();
atomic.resolve('q-flex q-items-center q-gap-sm');
// 自动生成并注入对应的 CSS 规则
```

## 目录结构

```
src/theme/
├── index.ts              # 模块入口
├── ThemeRegistrar.ts     # 主题注册器
├── register.ts           # 自动注册逻辑
├── AtomicCSS.ts          # 原子化 CSS 生成器
├── types/
│   └── index.ts          # 类型定义
└── presets/
    ├── index.ts           # 预设导出汇总
    ├── light.ts           # 亮色主题
    ├── dark.ts            # 暗色主题
    ├── chinese-themes.ts  # 中国传统色主题（7个）
    └── atomic-rules.ts    # 原子化 CSS 规则映射
```

## 设计决策

- **CSS 变量驱动**：主题切换本质是更新 `:root` 上的 CSS 变量，组件无需 JS 响应
- **单例 + 注册中心**：ThemeRegistrar 是单例，通过 RegistryHub 统一管理
- **事件驱动**：主题变更通过 GlobalEventBus 广播 `theme:change` 事件，组件按需响应
- **中国色主题按需加载**：不自动注册，用户通过 `registerChineseThemes()` 按需启用
- **前景色自动搭配**：每个语义颜色（primary/secondary/success/warning/error/info）都有对应的 `on-xxx` 前景色变量，确保背景色+前景色可读性

## 颜色变体常量

用于组件的 `colorVariant` / `colorVariantText` 属性，控制语义颜色方案：

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
| `--q-colors-on-primary` | 主色前景 | `#ffffff` | `#ffffff` |
| `--q-colors-on-secondary` | 次要色前景 | `#ffffff` | `#ffffff` |
| `--q-colors-on-success` | 成功色前景 | `#ffffff` | `#ffffff` |
| `--q-colors-on-warning` | 警告色前景 | `#333333` | `#141414` |
| `--q-colors-on-error` | 错误色前景 | `#ffffff` | `#ffffff` |
| `--q-colors-on-info` | 信息色前景 | `#ffffff` | `#ffffff` |

> warning 前景色为深色，因为黄色/警告色背景较浅，深色文字可读性更好。
