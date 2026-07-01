# OrbitJS 构建进度

> **注意**: 本文件为索引文件，详细的构建进度信息在 `docs/build-progress/` 目录。

## 快速导航

- **[构建进度详情](docs/build-progress/README.md)** - 查看所有包的详细进度
- **[架构文档](docs/architecture/README.md)** - 查看架构原则和包说明
- **[设计决策](docs/design-decisions/README.md)** - 查看重要的设计决策

## 总体进度

| 层级 | 总包数 | 已完成 | 测试通过 | 平均覆盖率 |
|------|--------|--------|----------|------------|
| 第 0 层 | 8 | 8 | 8 | ~90% |
| 第 1 层 | 6 | 6 | 6 | ~85% |
| 第 2 层 | 5 | 5 | 5 | ~85% |
| 第 3 层 | 3 | 3 | 3 | ~87% |
| 第 4 层 | 1 | 1 | 1 | ~83% |
| **总计** | **22** | **22** | **22** | **~87%** |

## 统计信息

| 指标 | 数值 |
|------|------|
| 总包数 | 22 |
| 测试套件 | 204 |
| 测试用例 | 2263 |

## 最近更新

### 2026-07-01
- 新增 @orbitjs/i18n 国际化模块（零依赖，ESM ~8KB）
- 重写 ARCHITECTURE.md 架构说明
- 清理旧架构文档（AbilityBase、DebounceAbilityBase、ComposableRegistrar 等）

### 2026-06-30
- 完成 ComposableBase 重构为 AbilityDefinition 纯对象模式
- 全部 25 个 entity Ability 迁移为 AbilityDefinition
- 移除 AbilityBase、DebounceAbilityBase、ComposableRegistrar

## 文档结构

```
docs/
├── build-progress/          # 构建进度（按包组织）
│   ├── README.md           # 索引和总览
│   ├── layer-0/            # 第 0 层包
│   ├── layer-1/            # 第 1 层包
│   ├── layer-2/            # 第 2 层包
│   ├── layer-3/            # 第 3 层包
│   └── layer-4/            # 第 4 层包
├── architecture/           # 架构文档
│   ├── README.md
│   ├── principles/        # 架构原则
│   └── packages/          # 包文档
├── best-practices/         # 最佳实践
├── design-decisions/      # 设计决策
└── daily-summaries/       # 日常总结
```

## 参考资料

- [ARCHITECTURE.md](ARCHITECTURE.md) - 架构总览
- [README.md](README.md) - 项目说明
