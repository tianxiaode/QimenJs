# @qimenjs/icon

**层级**: UI 层（静态资源）  
**状态**: ✅  
**测试**: N/A（不参与 TypeScript 构建）  
**覆盖率**: N/A

## 构建历史

### 之前
- ✅ 102 个 SVG 图标（24x24 viewBox, stroke-based, currentColor）
- ✅ 字体图标方案：@font-face + Unicode 私用区（E900-E99F）
- ✅ CSS 类名 q-icon- 前缀，字体族名 QIcon
- ✅ 10 个分类覆盖

## 构建方式

```bash
node scripts/build-icon-font.js  # SVG → TTF → WOFF2/WOFF
```

## 使用统计

### 依赖的包
- 无（纯静态资源）

### 被以下包使用
- 应用层直接引用 CSS + 字体文件
