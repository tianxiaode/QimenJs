/**
 * TokenRefreshHandler - 401 拦截 + Token 自动刷新 + 重试
 *
 * 注册到 HTTP 管道 ALIGN 阶段，检测 401 响应后自动刷新 token 并重试原始请求。
 * 仅在引入 @orbitjs/oauth2 时注册，不影响不使用 OAuth2 的项目。
 *
 * @module oauth2/TokenRefreshHandler
 */

import type { RequestContext } from '@/context';
import { oauth2 } from './OAuth2Manager';
import { HttpExecutor } from '@/http/HttpExecutor';

/**
 * Token 刷新处理器
 *
 * 在 HTTP 管道 ALIGN 阶段执行：
 * 1. 检测 401 响应
 * 2. 排除刷新请求自身（metadata.isTokenRefresh）
 * 3. 排除无 token 的匿名请求
 * 4. 调用 OAuth2Manager.refreshToken()（防并发去重）
 * 5. 刷新成功后重新执行原始请求管道
 * 6. 刷新失败发出事件，由应用层处理（跳转登录页等）
 */
export const TokenRefreshHandler = async (context: RequestContext): Promise<void> => {
    // 只处理 401
    if (context.response.status !== 401) return;

    // 刷新请求自身不触发
    if (context.metadata.isTokenRefresh) return;

    // 没有 token 的匿名请求不触发
    if (!context.metadata.domainConfig?.token) return;

    // 标记已尝试刷新，避免递归
    if (context.metadata._refreshAttempted) return;
    context.metadata._refreshAttempted = true;

    // 发出 token 过期事件
    oauth2.emit('oauth2:token-expired', {
        domain: context.identity?.domain,
    });

    // 尝试刷新
    const refreshed = await oauth2.refreshToken();
    if (!refreshed) {
        // 刷新失败，保持错误状态，由应用层处理
        return;
    }

    // 刷新成功，重新执行原始请求管道
    const executor = new HttpExecutor();

    // 重建请求上下文（使用新的 token）
    const retryContext = { ...context };
    retryContext.error = null;
    retryContext.response = {
        status: 0,
        isSuccess: false,
        headers: {},
        data: null,
    };
    retryContext.metadata = {
        ...context.metadata,
        isErrorHandled: false,
        _refreshAttempted: true,  // 防止重试后再次 401 又触发刷新
    };

    const result = await executor.execute(retryContext);

    // 将重试结果写回原始 context
    context.response = result.context.response;
    context.error = result.context.error;
    context.data = result.context.data;
    context.metadata = result.context.metadata;
};
