# @qimenjs/mime

**层级**: 第 2 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~90%

## 构建历史

### 2026-07-01
- ✅ 从 registry 包拆出 MimeTypeRegistrar 为独立包
- ✅ 预定义 7 类 MIME 类型：图片(12)、文档(10)、音频(7)、视频(8)、压缩包(6)、Web/代码(11)、字体(5)
- ✅ 引入即自动注册常用类型，支持 registerCommonMimeTypes(extra) 扩展
- ✅ validation 包改为从 @qimenjs/mime 导入

## 测试状态

### 通过的测试
- ✅ MimeTypeRegistrar 注册/查询/清除
- ✅ 预定义 MIME 类型完整性
- ✅ 自动注册功能
- ✅ 扩展注册

## 已知问题

无

## 遗留工作

无

## 使用统计

### 依赖的包
- @qimenjs/registry (L1)

### 被以下包使用
- @qimenjs/validation (L2)

### 使用场景
- 文件上传类型校验
- MIME 类型与扩展名互查
