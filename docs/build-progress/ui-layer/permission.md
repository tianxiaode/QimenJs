# @qimenjs/permission

**层级**: UI 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~87%

## 构建历史

### 之前
- ✅ PermissionRegistrar（extends RegistrarBase）
- ✅ createDomainPermissions() 域前缀权限码工厂
- ✅ GlobalEventBus 触发 permission:change 事件
- ✅ 域范围权限码（domain:code 格式）

## 测试状态

### 通过的测试
- ✅ PermissionRegistrar - 注册与查询
- ✅ createDomainPermissions - 域权限码工厂

## 使用统计

### 依赖的包
- @qimenjs/registry (L1)
- @qimenjs/events (L1)

### 被以下包使用
- @qimenjs/component-core (UI)
