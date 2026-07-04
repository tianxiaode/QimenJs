# @qimenjs/pattern

**层级**: 第 2 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~90%

## 构建历史

### 2026-07-01
- ✅ 从 registry 包拆出 PatternRegistrar 为独立包
- ✅ 预定义 ValidationPatternType 枚举全部 19 个模式对应的正则表达式
  - 格式验证 15 个：email, url, ipv4, ipv6, mac, phone, uuid, base64, hexColor, rgbColor, rgbaColor, creditCard, chineseId, chinesePostcode, username
  - 密码验证 4 个：uppercase, lowercase, digit, specialChar
- ✅ 引入即自动注册，确保验证不出错
- ✅ validation 包改为从 @qimenjs/pattern 导入
- ✅ 验证测试不再需要手动注册模式

## 测试状态

### 通过的测试
- ✅ PatternRegistrar 注册/查询/清除
- ✅ 预定义模式完整性（19 个）
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
- 格式验证（邮箱、URL、IP 等）
- 密码强度验证
