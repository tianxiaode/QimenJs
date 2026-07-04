# @qimenjs/data-processor-abp

**层级**: 第 3 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~88%

## 构建历史

### 2026-07-01
- ✅ 新增 ABP 数据处理管道包
- ✅ 前道：分页参数转换（skipCount/takeCount）、租户 Header 注入
- ✅ 后道：PagedResultDto 提取、审计字段清理、软删除过滤、错误处理
- ✅ 新增字段级验证错误映射（fieldErrors）：将 validationErrors 转换为 Record<string, string[]>
- ✅ 引入即自动注册所有 ABP 处理器

## 测试状态

### 通过的测试
- ✅ 分页参数转换
- ✅ 租户 Header 注入
- ✅ PagedResultDto 提取
- ✅ 审计字段清理
- ✅ 软删除过滤
- ✅ 错误处理
- ✅ 字段级验证错误映射（10 个测试）

## 已知问题

无

## 遗留工作

无

## 使用统计

### 依赖的包
- @qimenjs/data-processor (L3)
- @qimenjs/context (L1)

### 被以下包使用
- 应用层直接使用

### 使用场景
- ABP 后端数据适配
- 分页/审计/软删除标准化处理
