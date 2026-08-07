# @qimenjs/theme

**层级**: UI 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~100%

## 构建历史

### 之前
- ✅ ThemeRegistrar（extends RegistrarBase）
- ✅ CSS 变量输出 + 原子 CSS
- ✅ 7 个中国传统色主题
- ✅ AtomicCSS ~185 条预定义规则
- ✅ GlobalEventBus 触发 theme:change 事件

### 重构后（2026-08-07）
- ✅ 移除 ThemeRegistrar、AtomicCSS、register.ts
- ✅ 改为纯 CSS 变量驱动，零运行时依赖
- ✅ 新增 utils.ts（flattenTokens, tokensToCSSVariables）
- ✅ 主题文件导出 CSS 变量字符串
- ✅ 构建工具自动收集并打包
- ✅ 8 个中国传统色主题（新增华清）

## 测试状态

### 通过的测试
- ✅ flattenTokens 扁平化
- ✅ tokensToCSSVariables CSS 变量生成
- ✅ 预设主题结构

## 已知问题

无

## 使用统计

### 依赖的包
- 无（零运行时依赖）

### 被以下包使用
- @qimenjs/component-core (UI)
