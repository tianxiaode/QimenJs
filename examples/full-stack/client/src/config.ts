/**
 * 应用配置
 *
 * 1. 注册域（DomainRegistrar）：auth / abp / spring
 * 2. 注册 Schema（SchemaRegistrar）：各域的实体 Schema
 * 3. 配置 OAuth2 认证
 */
import { Registry, DomainRegistrar } from '@qimen-lab/registry';
import { SchemaRegistrar } from '@qimen-lab/schema';
import { oauth2 } from '@qimen-lab/oauth2';
import '@qimen-lab/data-processor-abp';
import '@qimen-lab/data-processor-spring';

// 导入域 Schema 定义
import { UserSchema, ProductSchema, OrderSchema, ItemSchema, NotificationSchema, TagSchema, DepartmentSchema } from './domains';

// 获取域注册器（Registry 通过 Proxy 动态访问，需要类型断言）
const domainRegistrar = (Registry as any).domain as DomainRegistrar;

// ============================================
// 1. 注册域配置
// ============================================

// 注册认证域
domainRegistrar.register('auth', {
    baseUrl: '/auth',
    preset: 'default',
    pageSize: 10,
    pagesizes: [10, 20, 50],
});

// 注册 ABP 域
domainRegistrar.register('abp', {
    baseUrl: '/abp',
    preset: 'abp',
    pageSize: 10,
    pagesizes: [10, 20, 50],
    authInjector: 'bearer',
});

// 注册 Spring 域
domainRegistrar.register('spring', {
    baseUrl: '/spring',
    preset: 'spring',
    pageSize: 10,
    pagesizes: [5, 10, 20, 50],
    authInjector: 'bearer',
});

// 注册本地域（纯前端，不需要后端）
domainRegistrar.register('local', {
    baseUrl: '',
    preset: 'default',
    pageSize: 100,
    pagesizes: [10, 20, 50],
});

// ============================================
// 2. 注册 Schema
// ============================================

const schemaRegistrar = SchemaRegistrar.getInstance();

// ABP 域 Schema
schemaRegistrar.register(UserSchema);
schemaRegistrar.register(ProductSchema);

// Spring 域 Schema
schemaRegistrar.register(OrderSchema);
schemaRegistrar.register(ItemSchema);

// 本地域 Schema
schemaRegistrar.register(NotificationSchema);
schemaRegistrar.register(TagSchema);

// 树形域 Schema
schemaRegistrar.register(DepartmentSchema);

// ============================================
// 3. 配置 OAuth2
// ============================================

oauth2.configure({
    tokenEndpoint: '/auth/oauth2/token',
    revokeEndpoint: '/auth/oauth2/revoke',
    authorizationEndpoint: '/auth/oauth2/authorize',
    clientId: 'qimenjs-demo',
    redirectUri: '/callback',
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
