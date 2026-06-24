/**
 * TokenInjector - Token 注入处理器
 * 
 * 职责：
 * - 从 DomainConfig 读取 token
 * - 根据 authInjector 配置注入到请求中
 */

import type { RequestContext } from '@orbitjs/context';

/**
 * TokenInjector 处理器
 */
export const TokenInjectorHandler = async (context: RequestContext): Promise<void> => {
    const domainConfig = context.metadata.domainConfig as any;
    
    // 检查是否有 token
    if (!domainConfig?.token) {
        return;
    }
    
    const token = domainConfig.token;
    const injector = domainConfig.authInjector || 'bearer'; // 默认 bearer
    
    // 如果是函数，直接调用
    if (typeof injector === 'function') {
        await injector(context);
        return;
    }
    
    // 如果是字符串，使用预定义方式
    switch (injector) {
        case 'bearer':
            context.request.headers['Authorization'] = `Bearer ${token}`;
            break;
            
        case 'basic':
            context.request.headers['Authorization'] = `Basic ${token}`;
            break;
    }
};
