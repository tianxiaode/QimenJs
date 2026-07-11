# @qimenjs/theme

**层级**: 第 1 层  
**状态**: ✅ 完成  
**测试**: ⚠️ 待补充  
**覆盖率**: ~60%

## 概述

主题系统包，提供 Design Tokens 驱动的主题管理。支持亮色/暗色预设主题和 7 个中国传统色主题。

## 功能

- **ThemeRegistrar** - 主题注册器（继承 RegistrarBase）
- **Design Tokens** - 七大类视觉令牌（colors/spacing/radius/font/shadow/transition/breakpoint）
- **CSS 变量输出** - 主题切换自动更新 `:root` CSS 变量
- **AtomicCSS** - 原子化 CSS 按需生成器
- **预设主题** - light/dark 自动注册
- **中国色主题** - 7 个中国传统色主题按需注册

## 依赖

```typescript
dependencies: {
  '@qimenjs/registry': 'L1',
  '@qimenjs/events': 'L1'
}
```

## 测试状态

### 通过的测试
- ✅ ThemeRegistrar 注册/注销/应用
- ✅ flattenTokens 扁平化
- ✅ CSS 变量输出

### 待补充的测试
- ⚠️ 中国色主题注册和切换
- ⚠️ registerChineseThemes() 函数
- ⚠️ ThemeDefinition displayName/description 字段

## 已知问题

无

## 遗留工作

- 为中国色主题添加暗色变体
- 补充中国色主题相关单元测试
