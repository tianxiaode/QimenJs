# QimenJS 构建进度

本目录记录所有包的构建进度、测试状态、问题和遗留工作。

## 文档结构

```
docs/build-progress/
├── README.md                    # 本文件（索引）
├── layer-0/                     # 第 0 层包（8 个零依赖包）
│   ├── error.md
│   ├── logger.md
│   ├── utils.md
│   ├── async.md
│   ├── runtime.md
│   ├── crypto.md
│   ├── types.md
│   └── i18n.md
├── layer-1/                     # 第 1 层包（6 个轻依赖包）
│   ├── registry.md
│   ├── cache.md
│   ├── events.md
│   ├── task.md
│   ├── composable.md
│   └── context.md
├── layer-2/                     # 第 2 层包（8 个功能包）
│   ├── schema.md
│   ├── validation.md
│   ├── pipeline.md
│   ├── mime.md
│   ├── pattern.md
│   ├── composable.md
│   ├── event-dom.md
│   └── permission.md
├── layer-3/                     # 第 3 层包（6 个高级功能包）
│   ├── data-processor.md
│   ├── data-processor-abp.md
│   ├── data-processor-spring.md
│   ├── http.md
│   ├── system-abilities.md
│   └── oauth2.md
└── layer-4/                     # 第 4 层包（1 个业务包）
    └── entity.md
```

## 总体进度

| 层级 | 总包数 | 已完成 | 测试通过 | 分支覆盖率 |
|------|--------|--------|----------|------------|
| 第 0 层 | 8 | 8 | 8 | ~85% |
| 第 1 层 | 6 | 6 | 6 | ~89% |
| 第 2 层 | 8 | 7 | 7 | ~86% |
| 第 3 层 | 6 | 6 | 6 | ~87% |
| 第 4 层 | 1 | 1 | 1 | ~83% |
| **总计** | **29** | **28** | **28** | **~87%** |

**全局覆盖率**：语句 95% | 分支 87% | 函数 95% | 行 96%
**测试**：238 套件 / 2833 用例（全部通过）
**当前重点**：准备 npm 发布

## 快速导航

### 按层级查看

- [第 0 层：核心基础包](./layer-0/) - 8 个零依赖包
- [第 1 层：基础设施工具包](./layer-1/) - 6 个包
- [第 2 层：功能工具包](./layer-2/) - 8 个包
- [第 3 层：高级功能包](./layer-3/) - 6 个包
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
- [i18n](./layer-0/i18n.md) - 国际化
- [registry](./layer-1/registry.md) - 注册器系统
- [cache](./layer-1/cache.md) - 缓存系统
- [events](./layer-1/events.md) - 事件系统
- [task](./layer-1/task.md) - 任务系统
- [composable](./layer-1/composable.md) - 可组合能力系统
- [context](./layer-1/context.md) - 请求上下文
- [schema](./layer-2/schema.md) - Schema 定义系统
- [validation](./layer-2/validation.md) - 验证系统
- [pipeline](./layer-2/pipeline.md) - 管道执行器
- [mime](./layer-2/mime.md) - MIME 类型管理
- [pattern](./layer-2/pattern.md) - 模式注册器
- [event-dom](./layer-2/event-dom.md) - DOM 事件适配器
- [permission](./layer-2/permission.md) - 权限注册与查询系统
- [data-processor](./layer-3/data-processor.md) - 数据处理器
- [data-processor-abp](./layer-3/data-processor-abp.md) - ABP 数据处理管道
- [data-processor-spring](./layer-3/data-processor-spring.md) - Spring 数据处理管道
- [http](./layer-3/http.md) - HTTP 客户端
- [system-abilities](./layer-3/system-abilities.md) - 系统能力集
- [oauth2](./layer-3/oauth2.md) - OAuth2 认证流程
- [entity](./layer-4/entity.md) - 实体管理框架

## 最近更新

### 2026-07-05
- 项目从 OrbitJS 重命名为 QimenJS，全量替换源码/测试/文档/示例/配置中的旧名称
- 修复 package.json、tsconfig.json、jest.config.ts 的 UTF-8 BOM 问题
- 修复 FlatRemoteQueryAbility 集成测试断言与源码接口不匹配（5 个用例）
- 清理根目录 8 个过时 MD 文件和 18 个临时 TS 文件
- 重新生成 TypeDoc API 文档
- 测试：238 套件 / 2833 用例全部通过

### 2026-07-02
- 新增 @qimenjs/oauth2 认证流程包（密码/授权码/客户端凭证模式 + 401 自动刷新）
- 22 个 OAuth2 测试用例通过
- 全栈示例（examples/full-stack）搭建完成，集成 EntityManager
- FlatRemoteEntityState 运行时缺陷修复（缺少 updateData/toParams/updateItem/isValidPage）
- FlatRemoteListAbility 防抖返回值修复（debounce 不返回异步结果）
- RequestContextBuilder.withRequest undefined 覆盖修复
- StateCacheAbility.updateData 重命名为 updateSourceData，解决 Ability 注入覆盖冲突
- TreeRemoteEntityState 新增 updateData 方法
- 新增 EntityManager 集成测试（18 个用例）+ RequestContextBuilder 边界测试（5 个用例）
- **工作重点调整**：从"集成示例搭建"转向"补充集成测试"，解决单元测试覆盖率虚高问题

### 2026-07-01
- 新增 @qimenjs/i18n 国际化模块
- MimeTypeRegistrar 拆分为 @qimenjs/mime 独立包（7 类预定义 MIME 类型）
- PatternRegistrar 拆分为 @qimenjs/pattern 独立包（19 个验证模式自动注册）
- 新增 @qimenjs/data-processor-abp（ABP 数据处理管道 + 字段级验证错误映射）
- 新增 @qimenjs/data-processor-spring（Spring 数据处理管道）
- 完成 AbilityDefinition 迁移：15 个 Manager Ability 从 class 迁移为纯对象
- 移除 AbilityBase、DebounceAbilityBase、ComposableRegistrar 旧版代码
- 同步构建配置：build-config.json、package.json exports、tsconfig.json paths

### 2026-06-30
- 全局分支覆盖率从 74.2% 提升到 87.33%
- 补充 system-abilities、composable、data-processor、crypto、http、entity、schema、validation 包测试
- entity 包状态从"开发中"更新为"已完成"

## 参考资料

- [文档导航](../SUMMARY.md) - 文档总览
- [架构文档](../architecture/README.md) - 架构原则和包说明
- [设计决策](../design-decisions/README.md) - 重要的设计决策
