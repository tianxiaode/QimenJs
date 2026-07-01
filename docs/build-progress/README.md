# OrbitJS 构建进度

本目录记录所有包的构建进度、测试状态、问题和遗留工作。

## 文档结构

```
docs/build-progress/
├── README.md                    # 本文件（索引）
├── layer-0/                     # 第 0 层包（7 个零依赖包）
│   ├── error.md
│   ├── logger.md
│   ├── utils.md
│   ├── async.md
│   ├── runtime.md
│   ├── crypto.md
│   └── types.md
├── layer-1/                     # 第 1 层包（5 个轻依赖包）
│   ├── registry.md
│   ├── cache.md
│   ├── events.md
│   ├── validation.md
│   ├── task.md
│   └── context.md
├── layer-2/                     # 第 2 层包（4 个功能包）
│   ├── schema.md
│   ├── pipeline.md
│   ├── composable.md
│   └── event-dom.md
├── layer-3/                     # 第 3 层包（3 个高级功能包）
│   ├── data-processor.md
│   ├── http.md
│   └── system-abilities.md
└── layer-4/                     # 第 4 层包（1 个业务包）
    └── entity.md
```

## 总体进度

| 层级 | 总包数 | 已完成 | 测试通过 | 分支覆盖率 |
|------|--------|--------|----------|------------|
| 第 0 层 | 7 | 7 | 7 | ~85% |
| 第 1 层 | 6 | 6 | 6 | ~89% |
| 第 2 层 | 4 | 4 | 4 | ~86% |
| 第 3 层 | 3 | 3 | 3 | ~87% |
| 第 4 层 | 1 | 1 | 1 | ~83% |
| **总计** | **21** | **21** | **21** | **~87%** |

**全局覆盖率**：语句 95% | 分支 87% | 函数 95% | 行 96%  
**测试**：203 套件 / 2235 用例全部通过

## 快速导航

### 按层级查看

- [第 0 层：核心基础包](./layer-0/) - 7 个零依赖包
- [第 1 层：基础设施工具包](./layer-1/) - 6 个包
- [第 2 层：功能工具包](./layer-2/) - 4 个包
- [第 3 层：高级功能包](./layer-3/) - 3 个包
- [第 4 层：业务包](./layer-4/) - 1 个包

### 按状态查看

#### 已完成

- [error](./layer-0/error.md) - 错误处理
- [logger](./layer-0/logger.md) - 日志系统
- [utils](./layer-0/utils.md) - 工具函数
- [async](./layer-0/async.md) - 异步工具
- [runtime](./layer-0/runtime.md) - 运行时环境
- [crypto](./layer-0/crypto.md) - 加密工具
- [types](./layer-0/types.md) - 全局共享类型
- [registry](./layer-1/registry.md) - 注册器系统
- [cache](./layer-1/cache.md) - 缓存系统
- [events](./layer-1/events.md) - 事件系统
- [validation](./layer-1/validation.md) - 验证系统
- [task](./layer-1/task.md) - 任务系统
- [context](./layer-1/context.md) - 请求上下文
- [schema](./layer-2/schema.md) - Schema 定义系统
- [pipeline](./layer-2/pipeline.md) - 管道执行器
- [composable](./layer-2/composable.md) - 可组合能力系统
- [event-dom](./layer-2/event-dom.md) - DOM 事件适配器
- [data-processor](./layer-3/data-processor.md) - 数据处理器
- [http](./layer-3/http.md) - HTTP 客户端
- [system-abilities](./layer-3/system-abilities.md) - 系统能力集
- [entity](./layer-4/entity.md) - 实体管理框架

## 最近更新

### 2026-07-01
- 完成 AbilityDefinition 迁移：15 个 Manager Ability 从 class 迁移为纯对象
- 移除 AbilityBase、DebounceAbilityBase、ComposableRegistrar 旧版代码
- 简化 ComposableBase 为纯 AbilityDefinition 架构
- 同步构建配置：build-config.json、package.json exports、tsconfig.json paths
- 修复构建脚本支持跨包引用
- 清理 src 下 764 个旧编译产物
- 全量构建验证通过（21 个包）
- 文档更新：重写 composable.md、system-abilities.md、with-abilities-guide.md

### 2026-06-30
- 全局分支覆盖率从 74.2% 提升到 87.33%
- 补充 system-abilities、composable、data-processor、crypto、http、entity、schema、validation 包测试
- entity 包状态从"开发中"更新为"已完成"

## 参考资料

- [文档导航](../SUMMARY.md) - 文档总览
- [架构文档](../architecture/README.md) - 架构原则和包说明
- [设计决策](../design-decisions/README.md) - 重要的设计决策
