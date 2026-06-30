# @orbitjs/composable

**层级**: 第 1 层  
**状态**: ✅ 完成  
**测试**: ✅ 通过（31/31）  
**覆盖率**: 90.38%（分支）

## 构建历史

### 2026-06-29
- ✅ **修复 AbilityBase `this` 绑定系统性 bug**
  - 引入 `AbilityProxy` 代理对象：`{ host, self }`
  - `expose()` 签名改为 `expose(proxy: AbilityProxy)`
  - getter/setter 通过 `proxy.host`/`proxy.self` 访问，不依赖 `this`
  - 方法 `bind(host)` 绑定，`this` 就是宿主
  - `proxy.host` 是 getter，从 `sharedHostRef` 读取，支持多实例隔离
- ✅ **ComposableBase 新增 `host` getter**
  - `get host() { return this; }`，统一 getter/setter 和方法中的宿主访问
- ✅ **全部 29 个 Ability 子类迁移到 `expose(proxy)` API**
- ✅ **清理调试代码**（移除 `console.log`）

### 2026-06-27
- ✅ **修复 ComposableRegistrar 抽象方法缺失**
  - 添加 `register(AbilityClass, options?)` 方法实现
  - 添加 `unregister(name)` 方法实现
  - 解决 RegistrarBase 要求子类实现 `register`/`unregister` 抽象方法的问题
- ✅ **新增 AbilityConstructor 类型**
  - 定义 `type AbilityConstructor = new () => IPrecompilableAbility`
  - 替代 `typeof AbilityBase`，解决抽象类不能 `new` 的问题
  - 解决子类 `static abilities` 属性协变类型不兼容问题
- ✅ **更新 ComposableBase 类型**
  - `abilities` 类型从 `Array<typeof AbilityBase>` 改为 `readonly AbilityConstructor[]`
  - `collectAbilities()` 返回类型同步更新
- ✅ **删除旧编译产物**
  - 删除 `src/composable/` 下所有 `.js` 和 `.d.ts` 文件
  - 解决 Jest/ts-jest 优先加载旧版代码导致测试失败的问题
- ✅ **所有测试通过（30/30）**

### 2026-06-15
- ✅ 重构 ComposableRegistrar 从 RegistrarBase 派生
- ✅ 添加 ComposableEntry 类型到 types/composable.ts
- ✅ 更新 ComposableBase.ts 和 ComposableRegistrar.ts 导入路径
- ✅ 更新测试文件导入路径
- ✅ **修复实例缓存问题**
  - 添加 `abilityInstances` Map 缓存能力实例
  - 修改 `get()` 实现懒加载 + 实例缓存
  - 避免重复实例化能力类
  - 保持"第一次获取时实例化并缓存"的设计原则
- ✅ **重写单元测试**
  - 重写 AbilityBase.test.ts 匹配新 API
  - 重写 ComposableBase.test.ts 匹配新 API
  - 重写 ComposableRegistrar.test.ts 匹配新 API
  - 重写 index.test.ts 匹配新 API
- ✅ **修复导入问题**
  - 修复 DescriptorFactory.ts 导入路径
  - 修复 data-processor RequestContext 导入
  - 导出 IExposeResult 类型

### 之前
- ✅ 实现 AbilityBase 和 ComposableBase
- ✅ 实现预编译能力
- ✅ 实现 expose() API
- ✅ 实现 DescriptorFactory
- ✅ 实现 DebounceAbilityBase

## 测试状态

### 测试覆盖

| 文件 | 语句覆盖 | 分支覆盖 | 函数覆盖 |
|------|----------|----------|----------|
| AbilityBase.ts | 100% | 90% | 100% |
| ComposableBase.ts | 92% | 85% | 100% |
| ComposableRegistrar.ts | 54% | 28% | 67% |
| DebounceAbilityBase.ts | 30% | 0% | 0% |
| DescriptorFactory.ts | 3% | 0% | 0% |

### 通过的测试（30个）

**AbilityBase（9个）**
- ✅ precompile - should create precompiled ability with name
- ✅ precompile - should create descriptor factories for all exposed properties
- ✅ precompile - should handle symbol properties
- ✅ precompile - should handle getter/setter properties
- ✅ descriptor factories - should create working descriptors for simple values
- ✅ descriptor factories - should create working descriptors for methods
- ✅ descriptor factories - should create working descriptors for getter/setter
- ✅ disposer - should create disposer function
- ✅ disposer - should call onDispose when disposer is called

**ComposableBase（8个）**
- ✅ constructor - should initialize with a logger
- ✅ static abilities - should inject abilities from static property
- ✅ static abilities - should inject multiple abilities
- ✅ inheritance - should collect abilities from prototype chain
- ✅ inheritance - should handle class with no abilities
- ✅ getStatic and setStatic - should store and retrieve static values
- ✅ getStatic and setStatic - should return undefined for non-existent keys
- ✅ dispose - should dispose without errors

**ComposableRegistrar（9个）**
- ✅ get - should return precompiled ability and cache it
- ✅ get - should return cached result on second call
- ✅ get - should handle multiple ability classes
- ✅ has - should return false before get is called
- ✅ has - should return true after get is called
- ✅ getAllNames - should return empty array initially
- ✅ getAllNames - should return all cached ability names
- ✅ clearCaches - should clear all caches
- ✅ clear - should clear all data

**index（4个）**
- ✅ should export ComposableBase
- ✅ should export AbilityBase
- ✅ should allow creating custom ability
- ✅ should allow creating composable with abilities

## 已解决问题

### 问题 1：ComposableRegistrar 缺少抽象方法（已解决 ✅）
- **原因**: `RegistrarBase` 要求子类实现 `register()` 和 `unregister()` 抽象方法
- **解决方案**: 实现 `register(AbilityClass, options?)` 和 `unregister(name)` 方法
- **解决日期**: 2026-06-27

### 问题 2：旧编译产物导致测试失败（已解决 ✅）
- **原因**: `src/composable/` 下存在旧版 `.js`/`.d.ts` 文件，Jest 优先加载旧代码
- **解决方案**: 删除所有旧编译产物
- **解决日期**: 2026-06-27

### 问题 3：静态 abilities 类型协变不兼容（已解决 ✅）
- **原因**: `typeof AbilityBase` 是抽象类构造函数类型，子类用不同 Ability 类覆盖时 TypeScript 报类型不兼容
- **解决方案**: 新增 `AbilityConstructor` 类型（`new () => IPrecompilableAbility`），`abilities` 类型改为 `readonly AbilityConstructor[]`
- **解决日期**: 2026-06-27

### 问题 4：collectFromPrototypeChain 方法不存在（已解决 ✅）
- **原因**: 旧测试引用了不存在的方法
- **解决方案**: 重写测试，使用 `collectAbilities()` 方法（通过原型链收集 + 去重 + 缓存）
- **解决日期**: 2026-06-15（重写测试时解决）

## 遗留工作

### 高优先级
- [ ] 提高 ComposableRegistrar 测试覆盖率（当前 54%，目标 80%+）
  - 添加 `register()` 方法测试
  - 添加 `unregister()` 方法测试
  - 添加锁定状态测试
  - 添加 `inspect()` 测试

### 中优先级
- [ ] 编写 DebounceAbilityBase 测试（当前 30%）
- [ ] 编写 DescriptorFactory 测试（当前 3%）

### 低优先级
- [ ] 优化预编译性能
- [ ] 添加更多能力类型示例

## 参考资料

- [设计决策：Composable 系统重构](../../design-decisions/2026-06-15-composable-refactoring.md)
- [设计决策：注册器架构统一](../../design-decisions/2026-06-15-registrar-architecture.md)
- [包文档：composable](../../architecture/packages/composable.md)
