# @qimenjs/theme

**层级**: UI 层  
**状态**: ✅ 完成  
**测试**: ✅  
**覆盖率**: ~100%

## 概述

主题系统包，提供 Design Tokens 驱动的主题管理。纯 CSS 变量驱动，零运行时依赖。支持亮色/暗色预设主题和 8 个中国传统色主题。

## 功能

- **Design Tokens** - 七大类视觉令牌（colors/spacing/radius/font/shadow/transition/breakpoint）
- **CSS 变量输出** - 主题文件导出 CSS 变量字符串
- **工具函数** - flattenTokens, tokensToCSSVariables
- **预设主题** - light/dark（宣纸/玄色）
- **中国色主题** - 8 个中国传统色主题（青瓷/朱砂/靛蓝/鹅黄/紫檀/墨色/黛色/华清）
- **颜色变体常量** - ColorVariant 类型 + COLOR_VARIANTS + COLOR_VARIANT_MAP
- **on-xxx 前景色** - 每个语义颜色搭配的前景色变量（所有主题预设）
- **骨架屏样式** - skeleton.css.ts（框架运行时必须）

## 依赖

```typescript
dependencies: {}
```

零运行时依赖。

## 测试状态

### 通过的测试
- ✅ flattenTokens 扁平化
- ✅ tokensToCSSVariables CSS 变量生成
- ✅ 预设主题结构

## 已知问题

无

## 遗留工作

无
