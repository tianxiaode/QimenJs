# 主题资源（src/theme）

> 主题系统不再是独立 TypeScript 包（`@qimenjs/theme` 已移除，不提供任何 TS 导出），转为 **纯 CSS 资源**，位于 `src/theme/`。

**位置**: `src/theme/`  
**形态**: 纯 CSS 文件，无编译环节

## 概述

主题系统以 CSS 文件形式提供 Design Tokens（CSS 变量），通过 `theme.css` 统一 `@import` 汇总。亮色/暗色、中国风预设、用户自定义均通过根元素上的 `data-*` 属性切换，零 JS 开销、零 TS 编译。

## 文件清单

| 文件 | 作用 |
|------|------|
| `theme.css` | 统一入口，@import 全部主题文件 |
| `light.css` | 亮色主题，`:root` 定义全部变量 |
| `dark.css` | 暗色主题，`[data-theme="dark"]` 覆盖 |
| `utilities.css` | 颜色/按钮/间距/响应式工具类 |
| `preset.css` | 10 个中国风预设（`[data-theme-preset]`） |
| `custom.css` | 用户自定义（`[data-theme-custom]`） |
| `skeleton.css` | 骨架屏 shimmer 动画 |
| `layout.css` | Flex/Grid/尺寸工具类 |
| `utility.css` | 显示/边框/圆角/层级/透明度工具类 |

## 使用

```css
/* 应用入口，只需一行（@/ 为 Vite 别名，指向 src/） */
import '@/theme/theme.css';
```

## 主题切换

| 场景 | 属性 | 示例值 |
|------|------|--------|
| 亮/暗色 | `data-theme` | `light` / `dark` |
| 中国风预设 | `data-theme-preset` | `cinnabar` / `indigo` / `pine` / `amber` / `rouge` / `bamboo` / `sienna` / `lotus` / `navy` / `chartreuse` |
| 用户自定义 | `data-theme-custom` | `""` |

## 设计决策

- **纯 CSS 方案**：主题定义为 CSS 变量文件，切换主题 = 切换根元素 `data-*` 属性，无 JS 运行逻辑
- **主色 HSL 三段式**：`--q-color-primary-h/s/l` 存储，hover/active/disabled 状态色由明度派生，可被预设/自定义覆盖
- **亮暗覆盖**：light 为默认，dark 按需覆盖，共用同一组变量名
- **on-xxx 前景色**：每个语义色都有对应 `--q-color-on-xxx`，保证前景/背景可读性
- **无向后兼容**：`--q-colors-*`、`--q-spacing-*` 等旧变量命名已废弃，组件统一使用 `--q-color-*` / `--q-space-*`

## 参见

- [主题系统](../theme-system.md)
- [主题最佳实践](../../best-practices/theme-best-practices.md)