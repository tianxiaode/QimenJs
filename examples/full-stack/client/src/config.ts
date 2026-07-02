/**
 * 域名配置
 * 
 * 注册三个域：auth / abp / spring
 * 配置 OAuth2 认证
 */
import { Registry } from '@orbitjs/registry';
import { oauth2 } from '@orbitjs/oauth2';
import '@orbitjs/data-processor-abp';
import '@orbitjs/data-processor-spring';

// 注册认证域
Registry.domain.register('auth', {
    baseUrl: 'http://localhost:3000',
    preset: 'default',
    pageSize: 10,
    pagesizes: [10, 20, 50],
});

// 注册 ABP 域
Registry.domain.register('abp', {
    baseUrl: 'http://localhost:3001',
    preset: 'abp',
    pageSize: 10,
    pagesizes: [10, 20, 50],
    authInjector: 'bearer',
});

// 注册 Spring 域
Registry.domain.register('spring', {
    baseUrl: 'http://localhost:3002',
    preset: 'spring',
    pageSize: 10,
    pagesizes: [10, 20, 50],
    authInjector: 'bearer',
});

// 配置 OAuth2
oauth2.configure({
    tokenEndpoint: 'http://localhost:3000/oauth2/token',
    revokeEndpoint: 'http://localhost:3000/oauth2/revoke',
    authorizationEndpoint: 'http://localhost:3000/oauth2/authorize',
    clientId: 'orbitjs-demo',
    redirectUri: 'http://localhost:5173/callback',
    domain: ['abp', 'spring'],  // token 同时应用到两个 API 域
    storage: 'localStorage',
});

// 监听 OAuth2 事件
oauth2.on('oauth2:token-acquired', (data: any) => {
    console.log('[OAuth2] Token acquired:', data.accessToken?.substring(0, 20) + '...');
});

oauth2.on('oauth2:token-refreshed', (data: any) => {
    console.log('[OAuth2] Token refreshed:', data.accessToken?.substring(0, 20) + '...');
});

oauth2.on('oauth2:token-expired', () => {
    console.log('[OAuth2] Token expired, refreshing...');
});

oauth2.on('oauth2:refresh-failed', (data: any) => {
    console.error('[OAuth2] Refresh failed:', data.error?.message);
});

export { Registry, oauth2 };
