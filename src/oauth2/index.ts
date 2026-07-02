/**
 * @orbitjs/oauth2 - OAuth2 认证流程
 *
 * 提供完整的 Token 生命周期管理：获取/刷新/撤销/401 自动重试。
 * 引入即自动注册 TokenRefreshHandler 到 HTTP 管道。
 *
 * @example
 * ```typescript
 * import { oauth2 } from '@orbitjs/oauth2';
 *
 * // 配置
 * oauth2.configure({
 *     tokenEndpoint: 'https://auth.example.com/oauth2/token',
 *     clientId: 'my-app',
 *     domain: 'api',
 * });
 *
 * // 密码模式登录
 * const result = await oauth2.loginWithPassword({ username: 'admin', password: '123' });
 * ```
 */

// 类型
export * from './types';

// Token 存储
export { createTokenStorage, MemoryTokenStorage, LocalStorageTokenStorage, SessionStorageTokenStorage } from './TokenStorage';
export type { ITokenStorage } from './TokenStorage';

// 核心管理器
export { OAuth2Manager, oauth2 } from './OAuth2Manager';

// Token 刷新处理器
export { TokenRefreshHandler } from './TokenRefreshHandler';

// 自动注册（必须在最后）
export { registerOAuth2Actions } from './register';
