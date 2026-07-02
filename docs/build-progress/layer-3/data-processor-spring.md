# @orbitjs/data-processor-spring

**层级**: 第 3 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~87%

## 构建历史

### 2026-07-01
- ✅ 新增 Spring 数据处理管道包
- ✅ 前道：分页参数转换（page/size）、排序参数转换
- ✅ 后道：Page\<T\> 提取、HATEOAS 链接清理、错误处理
- ✅ 引入即自动注册所有 Spring 处理器

## 测试状态

### 通过的测试
- ✅ 分页参数转换
- ✅ 排序参数转换
- ✅ Page\<T\> 提取
- ✅ HATEOAS 链接清理
- ✅ 错误处理

## 已知问题

无

## 遗留工作

无

## 使用统计

### 依赖的包
- @orbitjs/data-processor (L3)
- @orbitjs/context (L1)

### 被以下包使用
- 应用层直接使用

### 使用场景
- Spring Boot 后端数据适配
- 分页/排序标准化处理
