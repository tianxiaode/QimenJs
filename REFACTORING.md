# OrbitJS 包结构重构方案

## 一、新的包结构

### 1. 零依赖包（6个）
- `@orbitjs/error` - 错误处理
- `@orbitjs/logger` - 日志系统
- `@orbitjs/utils` - 工具函数
- `@orbitjs/async` - 异步工具
- `@orbitjs/runtime` - 运行时环境
- `@orbitjs/crypto` - 加密工具

### 2. 轻依赖包（5个）
- `@orbitjs/registry` - 注册器系统（依赖 error）
- `@orbitjs/cache` - 缓存系统（依赖 logger、utils）
- `@orbitjs/events` - 事件系统（依赖 logger、utils）
- `@orbitjs/validation` - 验证系统（依赖 registry）
- `@orbitjs/task` - 任务系统（依赖 logger、utils、error、runtime）

### 3. 通用基础设施包（1个）
- `@orbitjs/kernel` - 通用基础设施
  - composable - 可组合系统
  - http - HTTP 客户端
  - pipeline - 流水线系统
  - abilities - 基础能力定义

### 4. 业务包（1个）
- `@orbitjs/entity` - 实体管理
  - manager - 实体管理器
  - state - 实体状态
  - schema - 实体模式
  - actions - 实体动作处理器
  - abilities - 实体相关能力

## 二、目录结构

```
src/
├── error/              # 错误处理
├── logger/             # 日志系统
├── utils/              # 工具函数
├── async/              # 异步工具
├── runtime/            # 运行时环境
├── crypto/             # 加密工具
├── registry/           # 注册器系统
├── cache/              # 缓存系统
├── events/             # 事件系统
├── validation/         # 验证系统
├── task/               # 任务系统
├── kernel/             # 通用基础设施
│   ├── composable/
│   ├── http/
│   ├── pipeline/
│   └── abilities/
└── entity/             # 实体管理
    ├── manager/
    ├── state/
    ├── schema/
    ├── actions/
    └── abilities/
```

## 三、依赖关系

```
@orbitjs/entity
    └─ @orbitjs/kernel
        ├─ @orbitjs/events
        │   ├─ @orbitjs/logger
        │   └─ @orbitjs/utils
        ├─ @orbitjs/cache
        │   ├─ @orbitjs/logger
        │   └─ @orbitjs/utils
        ├─ @orbitjs/registry
        │   └─ @orbitjs/error
        └─ @orbitjs/async
```

## 四、构建方式

### 单一 package.json + 多入口构建

使用 `scripts/build.js` 和 `scripts/build-config.json` 配置，从单一源码构建出多个独立包。

### 构建命令

```bash
# 构建所有包
npm run build

# 构建指定包
npm run build:kernel
npm run build:entity

# 清理后构建
npm run build:clean
```

### 构建配置

在 `scripts/build-config.json` 中定义每个包的：
- 入口文件（entry）
- 输出目录（outDir）
- 源码目录（rootDir）
- 依赖关系（dependencies）
- 包名（packageName）

## 五、使用方式

### 安装

```bash
# 安装特定包
npm install @orbitjs/utils
npm install @orbitjs/cache
npm install @orbitjs/kernel
npm install @orbitjs/entity
```

### 导入

```typescript
// 使用工具函数
import { string, array } from '@orbitjs/utils';

// 使用缓存
import { CacheFactory } from '@orbitjs/cache';

// 使用 HTTP 客户端
import { HttpClient } from '@orbitjs/kernel';

// 使用实体管理
import { CoreEntityManager } from '@orbitjs/entity';
```

## 六、包的体积估算

| 包名 | 依赖数 | 体积（gzip） | 使用场景 |
|------|--------|--------------|----------|
| @orbitjs/utils | 0 | ~20KB | 任何项目 |
| @orbitjs/logger | 0 | ~10KB | 任何项目 |
| @orbitjs/cache | 2 | ~30KB | 需要缓存的项目 |
| @orbitjs/events | 2 | ~25KB | 需要事件的项目 |
| @orbitjs/kernel | 6 | ~100KB | 通用基础设施 |
| @orbitjs/entity | 8 | ~200KB | 实体管理场景 |

## 七、迁移步骤

### 阶段一：创建新目录结构
1. 创建 `src/runtime` 目录（从 `src/runtime-env` 迁移）
2. 创建 `src/cache` 目录（从 `src/kernel/cache` 迁移）
3. 创建 `src/events` 目录（从 `src/kernel/events/core` 迁移）
4. 创建 `src/task` 目录（从 `src/tasks` 迁移）

### 阶段二：重组 kernel 包
1. 保留 `composable`、`http`、`pipeline`、`abilities`
2. 移除 `cache`、`events`（已独立）
3. 移除 `entities`、`actions`（移到 entity 包）

### 阶段三：创建 entity 包
1. 创建 `src/entity` 目录
2. 迁移实体管理器、状态、模式、动作处理器
3. 迁移实体相关能力

### 阶段四：更新导入路径
1. 更新所有文件中的导入路径
2. 使用新的包名导入

### 阶段五：测试和发布
1. 运行测试确保功能正常
2. 构建所有包
3. 发布到 npm

## 八、关键优势

### 1. cache 完全独立
- 不依赖 kernel 或 entity
- 可以在任何项目中使用
- 体积小，功能完整

### 2. kernel 作为通用基础设施
- 包含 composable、http、pipeline、abilities
- 不包含实体管理
- 可以在多种项目中复用

### 3. entity 作为业务包
- 包含完整的实体管理功能
- 依赖 kernel 包
- 特定业务场景使用

### 4. 单一 package.json
- 维护简单
- 版本管理统一
- 构建配置集中

### 5. 依赖关系清晰
- 每个包的依赖明确
- 无循环依赖
- 版本管理简单

## 九、注意事项

### 1. 导入路径更新
所有文件中的导入路径需要更新为新的包结构：
- `@orbitjs/runtime-env` → `@orbitjs/runtime`
- `@orbitjs/tasks` → `@orbitjs/task`
- 内部模块使用相对路径

### 2. 类型定义
确保每个包都有完整的类型定义导出。

### 3. 测试覆盖
每个包都应该有独立的测试。

### 4. 文档完善
每个包都应该有 README 和使用示例。
