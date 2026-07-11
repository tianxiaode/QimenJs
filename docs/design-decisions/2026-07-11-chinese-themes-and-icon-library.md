# 中国传统色主题与图标库

> 最后更新：2026-07-11

## 背景

QimenJS 主题系统仅有 light/dark 两个预设主题，缺少中国风特色。同时项目缺少图标库，管理后台的图标需求无法满足。需要：

1. 为主题系统增加中国传统色主题
2. 建立中国风图标库
3. 统一主题和图标的命名规范

## 决策

### 1. 中国传统色主题

新增 7 个中国传统色主题，按需注册（不自动加载）：

- 青瓷（celadon）、朱砂（cinnabar）、靛蓝（indigo）、鹅黄（yellow）
- 紫檀（rosewood）、墨色（ink）、黛色（dai）

提供 `registerChineseThemes()` 便捷函数，用户手动调用后注册。

### 2. ThemeDefinition 扩展

`ThemeDefinition` 接口新增 `displayName` 和 `description` 可选字段，支持中国色主题的中文显示名和描述。

### 3. 中国色主题令牌统一

修复中国色主题与 light/dark 的不一致问题：

- 颜色命名统一：`danger` → `error`、`background` → `bg`、`surface` → `bg-secondary`、`primary-light/dark` → `primary-hover/active`
- 补全缺失令牌：`transition`、`breakpoint`、`font.lineHeight`、`border-light`、`overlay`
- 值类型统一：spacing/radius/font.size 从 `string` 改为 `number`，与 light/dark 一致
- 提取公共常量：7 个主题共享的 spacing/radius/font/transition/breakpoint 提取为常量

### 4. 图标库建设

建立 `@qimenjs/icon` 图标库：

- 102 个图标，10 个分类，Unicode 私用区 E900-E99F
- 字体图标方案（`@font-face` + CSS 类），参考 FontAwesome 规范
- CSS 类名前缀 `q-icon-`，修饰类 `q-icon--`
- 字体族名 `QIcon`，字体文件 `q-icon.woff2/woff/ttf`
- SVG 源文件使用 `currentColor`，颜色跟随 CSS `color` 属性
- 构建脚本 `scripts/build-icon-font.js` 一键生成字体

### 5. 命名规范统一

- 字体族名：`ZiIcon` → `QIcon`（与 `@qimenjs/icon` 对齐）
- 字体文件名：`zi-icon.*` → `q-icon.*`
- CSS 变量：`--q-icon-*`（与主题系统 `--q-*` 前缀一致）

## 原因

- **按需注册**：中国色主题不是所有项目都需要，按需加载避免增加包体积
- **令牌统一**：不一致的命名和缺失的令牌会导致 TypeScript 编译错误和运行时 CSS 变量不完整
- **字体图标**：相比 SVG sprite，字体图标使用更简单（一个 CSS 类即可），且与主题系统通过 CSS 变量联动
- **currentColor**：图标颜色跟随 CSS `color` 属性，与主题色自动适配

## 影响

- `src/theme/types/index.ts`：ThemeDefinition 新增 displayName/description
- `src/theme/presets/chinese-themes.ts`：全面重写，统一令牌
- `src/theme/presets/index.ts`：导出中国色主题
- `src/theme/register.ts`：新增 `registerChineseThemes()`
- `src/theme/index.ts`：重新导出中国色主题和注册函数
- `src/icon/`：新建图标库目录
- `scripts/build-icon-font.js`：新建字体构建脚本
- `scripts/split-icon-svg.js`：新建 SVG 拆分脚本
- `scripts/generate-missing-icons.js`：新建缺失图标生成脚本

## 替代方案

1. **中国色主题自动注册**：考虑过与 light/dark 一起自动注册，但会增加不需要的包体积，最终选择按需注册
2. **SVG sprite 方案**：考虑过 SVG symbol + use 方案，但使用复杂度高于字体图标，且与 CSS 变量联动不如字体方案直接
3. **fantasticon 构建工具**：考虑过用 fantasticon 生成字体，但与 Node 24 + Windows 环境有兼容性问题（glob 模块），最终用 svg2ttf + ttf2woff2 替代

## 实施细节

1. 修复 ThemeDefinition 类型，新增 displayName/description
2. 重写 chinese-themes.ts，统一令牌命名和值类型，补全缺失字段
3. 更新 presets/index.ts、register.ts、index.ts 的导出和注册逻辑
4. 创建 src/icon/ 目录，编写 q-icon.css
5. 拆分 q-icon.svg 为独立 SVG 文件，清理硬编码颜色
6. 补全 78 个缺失图标 SVG
7. 编写构建脚本，生成 TTF/WOFF2/WOFF 字体文件
8. 统一命名规范（ZiIcon → QIcon，zi-icon → q-icon）

## 后续工作

- 为图标库添加 TypeScript 类型定义和 JS API（如 `getIcon(name)` 返回 Unicode）
- 考虑添加 SVG sprite 方案作为字体图标的补充
- 为中国色主题添加暗色变体（当前 7 个中国色主题均为亮色）
