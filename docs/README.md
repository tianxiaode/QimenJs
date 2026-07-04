# QimenJS 文档

## 快速导航

| 文档 | 说明 |
|------|------|
| [架构概览](./architecture/README.md) | 分层设计、核心原则、包层级结构 |
| [包汇总](./architecture/packages/README.md) | 27 个子包的状态、覆盖率、依赖关系 |
| [架构原则](./architecture/principles/) | 依赖管理、引用规范、边界防御 |
| [最佳实践](./best-practices/) | i18n、composable、schema、http、data-processor |
| [使用指南](./guides/with-abilities-guide.md) | 能力系统使用指南 |
| [API 参考](./api/) | TypeDoc 生成的 API 文档 |
| [构建进度](./build-progress/README.md) | 各层包的构建进度 |
| [设计决策](./design-decisions/README.md) | 重要的架构设计决策记录 |

## 文档结构

```
docs/
├── README.md                    # 本文件（文档导航）
├── architecture/                # 架构文档
│   ├── README.md               # 架构概览
│   ├── packages/               # 各包详细文档
│   └── principles/             # 架构原则
├── best-practices/             # 最佳实践
├── guides/                     # 使用指南
├── api/                        # API 参考（TypeDoc 生成）
├── build-progress/             # 构建进度
└── design-decisions/           # 设计决策记录
```
