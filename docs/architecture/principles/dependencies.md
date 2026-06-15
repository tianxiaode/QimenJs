# 依赖管理原则

## 层级依赖原则

OrbitJS 采用严格的层级依赖结构，共分为 5 层：

### 第 0 层：核心基础包（零依赖）

这些包不依赖任何其他 OrbitJS 包，可以独立使用。

```
@orbitjs/error
@orbitjs/logger
@orbitjs/utils
@orbitjs/async
@orbitjs/runtime
@orbitjs/crypto
@orbitjs/context
```

**规则**：
- ✅ 可以依赖外部 npm 包
- ❌ 不能依赖任何 OrbitJS 包

### 第 1 层：基础设施工具包

只依赖第 0 层的包。

```
@orbitjs/registry    → error
@orbitjs/cache       → logger, utils
@orbitjs/events      → logger, utils
@orbitjs/task        → logger, utils, error, runtime
@orbitjs/pipeline    → logger
@orbitjs/composable  → logger, async
```

**规则**：
- ✅ 可以依赖第 0 层的包
- ❌ 不能依赖同层或更高层的包

### 第 2 层：功能工具包

依赖第 0-1 层的包。

```
@orbitjs/validation      → error, pipeline
@orbitjs/data-processor  → registry, pipeline, context
```

**规则**：
- ✅ 可以依赖第 0-1 层的包
- ❌ 不能依赖同层或更高层的包

### 第 3 层：高级功能包

依赖第 0-2 层的包。

```
@orbitjs/http              → logger, utils, pipeline, context
@orbitjs/system-abilities  → composable, registry, events
```

**规则**：
- ✅ 可以依赖第 0-2 层的包
- ❌ 不能依赖同层或更高层的包

### 第 4 层：业务包

依赖第 0-3 层的包。

```
@orbitjs/entity → composable, http, abilities, events, cache, registry, async, context
```

**规则**：
- ✅ 可以依赖第 0-3 层的包
- ❌ 不能依赖同层的包

## 依赖检查规则

### 1. 禁止循环依赖

```
❌ 错误示例：
A → B → C → A  // 循环依赖
```

### 2. 禁止反向依赖

```
❌ 错误示例：
@orbitjs/logger → @orbitjs/entity  // logger 是第 0 层，不能依赖第 4 层
```

### 3. 禁止跨层依赖（除非中间层都可用）

```
❌ 错误示例：
@orbitjs/utils → @orbitjs/entity  // 跨了 4 层
```

## 如何添加新依赖

### 步骤 1：确定包的层级

根据功能确定新包应该在哪一层。

### 步骤 2：检查依赖是否合法

确保只依赖更低层的包。

### 步骤 3：更新文档

- 更新 `ARCHITECTURE.md`
- 更新 `docs/architecture/packages/README.md`
- 创建包文档 `docs/architecture/packages/<package-name>.md`

### 步骤 4：更新构建配置

更新 `tsconfig.json` 和 `jest.config.ts` 的路径映射。

## 依赖可视化

```
entity (L4)
  ├─ composable (L1)
  ├─ http (L3)
  ├─ system-abilities (L3)
  ├─ events (L1)
  ├─ cache (L1)
  ├─ registry (L1)
  ├─ async (L0)
  └─ context (L0)

http (L3)
  ├─ logger (L0)
  ├─ utils (L0)
  ├─ pipeline (L1)
  └─ context (L0)

data-processor (L2)
  ├─ registry (L1)
  ├─ pipeline (L1)
  └─ context (L0)

validation (L2)
  ├─ error (L0)
  └─ pipeline (L1)
```

## 常见问题

### Q: 为什么要有层级依赖？

**A**: 
1. 避免循环依赖
2. 清晰的架构边界
3. 便于独立使用
4. 减小包体积

### Q: 如果需要跨层依赖怎么办？

**A**: 
1. 重新评估包的层级
2. 考虑是否应该拆分包
3. 考虑是否应该合并功能

### Q: 如何检查依赖是否合法？

**A**: 
1. 查看 `ARCHITECTURE.md` 的依赖关系
2. 使用工具检查（待实现）
3. 代码审查

## 工具支持

### 依赖检查工具（计划中）

```bash
# 检查所有包的依赖是否合法
npm run check-deps

# 检查特定包的依赖
npm run check-deps -- @orbitjs/http
```

### 依赖可视化工具（计划中）

```bash
# 生成依赖关系图
npm run deps-graph
```

## 参考资料

- [ARCHITECTURE.md](../../../ARCHITECTURE.md) - 架构总览
- [引用规范](./imports.md) - 如何引用其他包
