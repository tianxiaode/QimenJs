/**
 * 自动注册 TokenRefreshHandler 到 HTTP 管道
 *
 * 引入 @orbitjs/oauth2 时自动执行
 */

import { HttpActionRegistrar, HttpActionCategory } from '@/http';
import { TokenRefreshHandler } from './TokenRefreshHandler';

/**
 * 注册 OAuth2 HTTP 管道扩展
 */
export function registerOAuth2Actions(): void {
    const registrar = HttpActionRegistrar.getInstance();
    registrar.register({
        name: 'TokenRefresh',
        category: HttpActionCategory.ALIGN,
        offset: 20,
        handler: TokenRefreshHandler,
        description: '401 拦截 + Token 自动刷新 + 重试',
    });
}

// 自动注册
registerOAuth2Actions();
