# Permission 包构建进度

**包名**: @qimenjs/permission
**层级**: Layer 2
**状态**: 开发中
**测试覆盖率**: 待补充

## 概述

权限注册与查询系统，提供权限码的注册、存储、查询和变更通知功能。权限码按域分组存储，格式为 `域:权限码`。

## 完成情况

### 代码完成度

| 模块 | 状态 | 说明 |
|------|------|------|
| types.ts | ✅ 完成 | 类型定义（PermissionEntry、PermissionChangePayload、常量） |
| PermissionRegistrar.ts | ✅ 完成 | 权限注册表，继承 RegistrarBase，支持批量注册/注销/查询 |
| createDomainPermissions.ts | ✅ 完成 | 域级权限工厂函数 |
| index.ts | ✅ 完成 | 包入口 |

### 关联修改

| 文件 | 状态 | 说明 |
|------|------|------|
| LayoutNode.ts (PermissionProps) | ✅ 完成 | code 字段从 `string \| string[]` 改为 `string[]`，示例更新 |

### 测试完成度

| 测试文件 | 状态 | 通过/总数 | 覆盖率 |
|----------|------|-----------|--------|
| - | ⏳ 待补充 | - | - |

## 构建历史

### 2026-07-09
- ✅ 创建 permission 包目录结构
- ✅ 实现 PermissionRegistrar
  - 继承 RegistrarBase，存储 `Map<域, Set<权限码>>`
  - 批量注册/注销，只触发一次 `permission:change` 事件
  - `has`/`hasAll`/`hasAny` 查询方法
  - `getByDomain`/`clearDomain`/`getDomains` 域操作方法
  - EventBus 通过 `initEventBus()` 注入
- ✅ 实现 createDomainPermissions 工厂函数
  - 统一返回数组格式
  - 自动拼接域前缀
- ✅ 更新 LayoutNode.ts PermissionProps
  - code 字段统一为 `string[]`
  - 示例更新为使用工厂函数

## 技术决策

### 1. 权限码格式：域:权限码

**原因**：
- 统一格式，查询和注册都简单直接
- 域前缀天然实现分组隔离
- `:` 是权限/资源标识的业界惯例

### 2. 注册表直接触发事件（不拆 Manager）

**原因**：
- 权限注册和事件通知是一件事
- 数据变更自动触发，开发者无需手动处理
- 减少类的数量，降低理解成本

### 3. code 字段统一为 string[]

**原因**：
- 工厂函数统一返回数组
- 不需要区分单个/多个权限
- matchMode 控制匹配逻辑

## 已知问题

无

## 技术债务

- [ ] 补充单元测试
- [ ] 实现 PermissionAbility（在 component-abilities 包中）
- [ ] 考虑权限热更新时的差异通知（只通知变化的域）

## 下一步工作

### Phase 1: 单元测试
- [ ] PermissionRegistrar 测试
- [ ] createDomainPermissions 测试

### Phase 2: PermissionAbility
- [ ] 实现 PermissionAbility
- [ ] 监听 `permission:change` 事件
- [ ] 根据 matchMode 判断权限
- [ ] 控制 visible/disable/hidden/removed 行为
- [ ] 组件卸载时自动移除监听

### Phase 3: 权限加载策略
- [ ] 定义 PermissionLoader 接口
- [ ] 适配不同后端体系（ABP/Spring/自定义）

## 参考资料

- [Permission 包架构文档](../../architecture/packages/permission.md)
- [Registrar 架构](../../design-decisions/2026-06-15-registrar-architecture.md)
