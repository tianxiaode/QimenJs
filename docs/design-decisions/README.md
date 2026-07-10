# 设计决策记录

本目录记录所有重要的设计决策和修改历史，作为备忘和知识传承。

## 文档命名规范

- `YYYY-MM-DD-主题.md` - 按日期和主题命名
- 例如：`2026-06-15-composable-refactoring.md`

## 文档内容规范

每个文档应包含以下部分：

1. **背景** - 为什么需要这个修改
2. **决策** - 做了什么决策
3. **原因** - 为什么这样决策
4. **影响** - 这个决策的影响范围
5. **替代方案** - 考虑过但未采用的方案
6. **实施细节** - 具体的实施步骤
7. **后续工作** - 还需要做什么

## 已记录的决策

### 当前有效

- [2026-06-15-context-package.md](./2026-06-15-context-package.md) - Context 包设计
- [2026-06-15-schema-package-design.md](./2026-06-15-schema-package-design.md) - Schema 包设计
- [2026-06-15-schema-package-design-revised.md](./2026-06-15-schema-package-design-revised.md) - Schema 包设计（修订版）
- [2026-06-15-validation-package-design.md](./2026-06-15-validation-package-design.md) - Validation 包设计
- [2026-06-15-validation-refactoring.md](./2026-06-15-validation-refactoring.md) - Validation 重构
- [2026-06-17-context-refactoring.md](./2026-06-17-context-refactoring.md) - Context 重构
- [2026-07-06-host-property-retention.md](./2026-07-06-host-property-retention.md) - ComposableBase.host 属性保留决策
- [2026-07-06-event-ability-composition.md](./2026-07-06-event-ability-composition.md) - EventAbility 组合模式替代 ComponentBase 继承
- [2026-07-08-component-base-refactoring.md](./2026-07-08-component-base-refactoring.md) - ComponentBase 重构与内部渲染模型
- [2026-07-09-html-template-registrar-cloneNode-optimization.md](./2026-07-09-html-template-registrar-cloneNode-optimization.md) - TemplateRegistrar cloneNode 优化
- [2026-07-10-component-ability-refactoring.md](./2026-07-10-component-ability-refactoring.md) - ComponentBase 能力拆分与模板包重命名

### 已过时（旧架构，保留作历史参考）

- [2026-06-15-composable-refactoring.md](./2026-06-15-composable-refactoring.md) - Composable 系统重构（基于旧版 AbilityBase + expose()）
- [2026-06-15-registrar-architecture.md](./2026-06-15-registrar-architecture.md) - 注册器架构统一（ComposableRegistrar 部分已过时）
- [2026-06-15-comparableregistrar-comparison.md](./2026-06-15-comparableregistrar-comparison.md) - ComposableRegistrar 版本对比（已移除）
- [2026-06-15-composableregistrar-instance-cache.md](./2026-06-15-composableregistrar-instance-cache.md) - ComposableRegistrar 实例缓存（已移除）
- [2026-07-01-ability-copy-architecture.md](./2026-07-01-ability-copy-architecture.md) - Ability 纯复制架构讨论（expose(host) 方案，已被 AbilityDefinition 取代）
