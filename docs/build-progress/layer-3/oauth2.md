# @orbit-js/oauth2

**层级**: 第 3 层  
**状态**: ✅  
**测试**: ✅  
**覆盖率**: ~88%

## 构建历史

### 2026-07-02
- ✅ 新增 @orbit-js/oauth2 认证流程包
- ✅ OAuth2Manager：密码模式/授权码模式/客户端凭证模式
- ✅ TokenStorage：memory/localStorage/sessionStorage 持久化
- ✅ TokenRefreshHandler：401 拦截 + 自动刷新 + 重试（方案 A：由 OAuth2 包自行注册，不在 HTTP 默认管道中）
- ✅ 并发刷新去重（共享 Promise）
- ✅ 事件通知：token-acquired/token-refreshed/token-expired/refresh-failed
- ✅ 22 个测试用例全部通过

## 测试状态

### 通过的测试（22 个）
- ✅ 配置保存
- ✅ 密码模式登录/失败/未配置
- ✅ 授权码换 token/缺少 redirectUri
- ✅ 客户端凭证模式
- ✅ 刷新 token/无 refresh token/并发去重
- ✅ 登出
- ✅ 过期 token 返回 null
- ✅ 授权 URL 生成
- ✅ 事件触发/刷新失败事件/取消监听
- ✅ TokenStorage 存取/清除/空存储
- ✅ createTokenStorage 三种类型

## 已知问题

无

## 遗留工作

### 中优先级
- [ ] TokenRefreshHandler 与 HttpExecutor 的集成测试（需要完整 HTTP 管道环境）
- [ ] 授权码模式端到端测试（需要浏览器环境模拟）

### 低优先级
- [ ] PKCE 扩展支持（公共客户端安全增强）
- [ ] Token 自动定时刷新（基于 expiresIn 的定时器）

## 使用统计

### 依赖的包
- @orbit-js/http (L3)
- @orbit-js/registry (L1)
- @orbit-js/events (L1)
- @orbit-js/cache (L1)

### 被以下包使用
- 应用层直接使用

### 使用场景
- OAuth2 密码模式登录
- OAuth2 授权码模式登录
- OAuth2 客户端凭证模式
- Token 自动刷新 + 401 重试
