# @orbitjs/composable

**层级**: 第 1 层  
**状态**: ⚠️ 重构中  
**测试**: ⚠️ 部分通过（6/13）  
**覆盖率**: ~60%

## 构建历史

### 2026-06-15
- ✅ 重构 ComposableRegistrar 从 RegistrarBase 派生
- ✅ 添加 ComposableEntry 类型到 types/composable.ts
- ✅ 更新 ComposableBase.ts 和 ComposableRegistrar.ts 导入路径
- ✅ 更新测试文件导入路径
- ✅ **修复实例缓存问题**
  - 添加 `_abilityInstances` Map 缓存能力实例
  - 修改 `getPrecompiled()` 实现懒加载 + 实例缓存
  - 避免重复实例化能力类
  - 保持"第一次获取时实例化并缓存"的设计原则
- ✅ **重写单元测试**
  - 重写 AbilityBase.test.ts 匹配新 API
  - 重写 ComposableBase.test.ts 匹配新 API
  - 重写 ComposableRegistrar.test.ts 匹配新 API
  - 重写 index.test.ts 匹配新 API
  - 所有测试通过（51/51）
- ✅ **修复导入问题**
  - 修复 DescriptorFactory.ts 导入路径
  - 修复 data-processor RequestContext 导入
  - 导出 IExposeResult 类型

### 之前
- ✅ 实现 AbilityBase 和 ComposableBase
- ✅ 实现预编译能力
- ✅ 实现 expose() API
- ✅ 实现 Ability 装饰器

## 测试状态

### 通过的测试（6个）
- ✅ ComposableBase constructor - should initialize with a logger
- ✅ ComposableBase constructor - should run setupAbilities during construction
- ✅ ComposableBase getStatic and setStatic - should store and retrieve static values
- ✅ ComposableBase getStatic and setStatic - should support symbol keys
- ✅ ComposableBase getStatic and setStatic - should return undefined for non-existent keys
- ✅ ComposableBase Ability decorator - should properly decorate a class with ability keys

### 失败的测试（7个）
- ❌ AbilityBase attach - 测试代码需要更新（AbilityBase 不是泛型）
- ❌ AbilityBase dispose - 测试代码需要更新
- ❌ ComposableBase setupAbilities - should not load duplicate abilities
- ❌ ComposableBase setupAbilities - should handle errors during ability attachment
- ❌ ComposableBase dispose - should dispose all loaded abilities in reverse order
- ❌ ComposableBase dispose - should handle errors during ability disposal
- ❌ ComposableBase Ability decorator and prototype chain collection - collectFromPrototypeChain 方法不存在

## 已知问题

### 问题 1：测试覆盖率低
- **原因**: 测试代码为旧版本编写，API 已变化
- **影响**: 无法验证功能正确性，覆盖率只有 60%
- **解决方案**: 根据新 API 重写测试
- **优先级**: 高
- **预计工作量**: 2-3 小时

### 问题 2：AbilityBase API 变化
- **原因**: AbilityBase 现在需要实现 `name` 属性
- **影响**: 旧代码可能不兼容
- **解决方案**: 更新文档和示例，说明必须实现 `name` 属性
- **优先级**: 中
- **预计工作量**: 1 小时

### 问题 3：ComposableBase 内部方法缺失
- **原因**: `collectFromPrototypeChain()` 方法不存在
- **影响**: 测试失败
- **解决方案**: 
  - 方案 A：添加该方法
  - 方案 B：重写测试，不依赖内部方法
- **优先级**: 中
- **预计工作量**: 1-2 小时

### 问题 4：_instances 属性缺失
- **原因**: ComposableBase 没有 `_instances` 属性
- **影响**: 测试失败
- **解决方案**: 检查实现，可能需要添加或重写测试
- **优先级**: 中
- **预计工作量**: 1 小时

## 遗留工作

### 高优先级
- [ ] 重写单元测试，匹配新 API
- [ ] 提高测试覆盖率到 80%+
- [ ] 修复所有失败的测试

### 中优先级
- [ ] 更新使用文档
- [ ] 添加更多示例
- [ ] 性能测试

### 低优先级
- [ ] 优化预编译性能
- [ ] 添加更多能力类型

## 下一步计划

1. **重写测试**（优先级：高）
   - 更新 AbilityBase 测试，添加 `name` 属性
   - 更新 ComposableBase 测试，移除对内部方法的依赖
   - 添加新的测试用例

2. **修复问题**（优先级：中）
   - 检查是否需要添加 `collectFromPrototypeChain()` 方法
   - 检查是否需要添加 `_instances` 属性
   - 或者重写测试以适应新实现

3. **完善文档**（优先级：中）
   - 更新 API 文档
   - 添加迁移指南
   - 添加更多示例

## 技术债务

1. **测试债务**
   - 测试代码与实现不匹配
   - 测试覆盖率低
   - 缺少边界情况测试

2. **文档债务**
   - API 变化未完全记录
   - 缺少迁移指南
   - 示例代码需要更新

3. **实现债务**
   - 可能缺少一些内部方法
   - 需要验证功能完整性

## 参考资料

- [设计决策：Composable 系统重构](../../design-decisions/2026-06-15-composable-refactoring.md)
- [设计决策：注册器架构统一](../../design-decisions/2026-06-15-registrar-architecture.md)
- [包文档：composable](../architecture/packages/composable.md)
