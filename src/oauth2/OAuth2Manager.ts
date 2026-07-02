/**
 * OAuth2Manager - OAuth2 认证核心管理器
 *
 * 职责：
 * - 管理完整的 Token 生命周期（获取/刷新/撤销）
 * - 支持密码模式、授权码模式、客户端凭证模式
 * - 并发刷新去重
 * - 事件通知
 *
 * @module oauth2/OAuth2Manager
 */

import type {
    OAuth2Config,
    OAuth2GrantType,
    OAuth2LoginResult,
    OAuth2PasswordCredentials,
    OAuth2TokenEntry,
    OAuth2TokenResponse,
} from './types';
import { createTokenStorage, type ITokenStorage } from './TokenStorage';
import { DomainRegistrar } from '@/registry/registrars/DomainRegistrar';

/**
 * OAuth2 核心管理器
 */
export class OAuth2Manager {
    private config: OAuth2Config | null = null;
    private storage: ITokenStorage = createTokenStorage();
    private refreshPromise: Promise<boolean> | null = null;
    private listeners: Map<string, Set<Function>> = new Map();

    /**
     * 配置 OAuth2 参数
     */
    configure(config: OAuth2Config): void {
        this.config = config;
        this.storage = createTokenStorage(config.storage);

        // 尝试从存储恢复 token
        const entry = this.storage.get();
        if (entry?.accessToken) {
            this.applyToken(entry.accessToken);
        }
    }

    /**
     * 密码模式登录
     */
    async loginWithPassword(credentials: OAuth2PasswordCredentials): Promise<OAuth2LoginResult> {
        const params: Record<string, string> = {
            grant_type: 'password',
            username: credentials.username,
            password: credentials.password,
        };

        if (credentials.scope) {
            params.scope = credentials.scope;
        }

        return this.requestToken(params);
    }

    /**
     * 授权码换 token
     */
    async loginWithCode(code: string): Promise<OAuth2LoginResult> {
        if (!this.config?.redirectUri) {
            return { success: false, error: { message: 'redirectUri is required for authorization_code grant' } };
        }

        const params: Record<string, string> = {
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.config.redirectUri,
        };

        return this.requestToken(params);
    }

    /**
     * 客户端凭证模式
     */
    async loginWithClientCredentials(): Promise<OAuth2LoginResult> {
        const params: Record<string, string> = {
            grant_type: 'client_credentials',
        };

        return this.requestToken(params);
    }

    /**
     * 刷新 token（防并发去重）
     */
    async refreshToken(): Promise<boolean> {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = this.doRefresh();
        try {
            return await this.refreshPromise;
        } finally {
            this.refreshPromise = null;
        }
    }

    /**
     * 撤销 token
     */
    async revokeToken(): Promise<void> {
        const entry = this.storage.get();
        if (!entry?.accessToken || !this.config?.revokeEndpoint) return;

        try {
            const params: Record<string, string> = {
                token: entry.accessToken,
            };

            if (entry.tokenType) {
                params.token_type_hint = entry.tokenType;
            }

            await this.sendRequest(this.config.revokeEndpoint, params);
        } catch {
            // 撤销失败不阻塞登出流程
        }
    }

    /**
     * 获取当前有效 token
     */
    getToken(): string | null {
        const entry = this.storage.get();
        if (!entry?.accessToken) return null;

        // 检查是否过期
        if (this.isTokenExpired(entry)) {
            return null;
        }

        return entry.accessToken;
    }

    /**
     * 是否已认证
     */
    isAuthenticated(): boolean {
        return this.getToken() !== null;
    }

    /**
     * 登出（清除 token + 撤销）
     */
    async logout(): Promise<void> {
        await this.revokeToken();
        this.storage.clear();
        this.clearAppliedToken();
    }

    /**
     * 获取授权码模式跳转 URL
     */
    getAuthorizationUrl(state?: string): string {
        if (!this.config?.authorizationEndpoint) {
            throw new Error('authorizationEndpoint is required');
        }
        if (!this.config?.clientId) {
            throw new Error('clientId is required');
        }
        if (!this.config?.redirectUri) {
            throw new Error('redirectUri is required');
        }

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
        });

        if (this.config.scopes?.length) {
            params.set('scope', this.config.scopes.join(' '));
        }
        if (state) {
            params.set('state', state);
        }

        return `${this.config.authorizationEndpoint}?${params.toString()}`;
    }

    /**
     * 跳转到授权页面
     */
    authorize(state?: string): void {
        const url = this.getAuthorizationUrl(state);
        window.location.href = url;
    }

    /**
     * 监听事件
     */
    on(event: string, handler: Function): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler);
        return () => this.listeners.get(event)?.delete(handler);
    }

    // ---- 内部方法 ----

    private async requestToken(params: Record<string, string>): Promise<OAuth2LoginResult> {
        if (!this.config) {
            return { success: false, error: { message: 'OAuth2 is not configured' } };
        }

        // 添加客户端认证
        if (this.config.clientId) {
            params.client_id = this.config.clientId;
        }
        if (this.config.clientSecret) {
            params.client_secret = this.config.clientSecret;
        }
        if (this.config.scopes?.length && !params.scope) {
            params.scope = this.config.scopes.join(' ');
        }

        try {
            const response = await this.sendRequest(this.config.tokenEndpoint, params);

            if (!response.ok) {
                const errorData = await this.parseErrorResponse(response);
                return {
                    success: false,
                    error: {
                        code: errorData.error,
                        message: errorData.error_description || `Token request failed: ${response.status}`,
                    },
                };
            }

            const tokenData: OAuth2TokenResponse = await response.json();
            this.saveToken(tokenData);
            this.applyToken(tokenData.access_token);

            this.emit('oauth2:token-acquired', {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in,
            });

            return {
                success: true,
                accessToken: tokenData.access_token,
            };
        } catch (e: any) {
            return {
                success: false,
                error: { message: e.message || 'Network error' },
            };
        }
    }

    private async doRefresh(): Promise<boolean> {
        const entry = this.storage.get();
        if (!entry?.refreshToken || !this.config) {
            this.emit('oauth2:refresh-failed', { error: new Error('No refresh token available') });
            return false;
        }

        const params: Record<string, string> = {
            grant_type: 'refresh_token',
            refresh_token: entry.refreshToken,
        };

        if (this.config.clientId) {
            params.client_id = this.config.clientId;
        }
        if (this.config.clientSecret) {
            params.client_secret = this.config.clientSecret;
        }

        try {
            const response = await this.sendRequest(this.config.tokenEndpoint, params);

            if (!response.ok) {
                this.emit('oauth2:refresh-failed', { error: new Error(`Refresh failed: ${response.status}`) });
                return false;
            }

            const tokenData: OAuth2TokenResponse = await response.json();
            this.saveToken(tokenData);
            this.applyToken(tokenData.access_token);

            this.emit('oauth2:token-refreshed', {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresIn: tokenData.expires_in,
            });

            return true;
        } catch (e: any) {
            this.emit('oauth2:refresh-failed', { error: e });
            return false;
        }
    }

    private saveToken(tokenData: OAuth2TokenResponse): void {
        const entry: OAuth2TokenEntry = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenType: tokenData.token_type,
            expiresIn: tokenData.expires_in,
            scope: tokenData.scope,
            acquiredAt: Date.now(),
        };
        this.storage.set(entry);
    }

    private applyToken(accessToken: string): void {
        if (!this.config) return;
        const domains = Array.isArray(this.config.domain) ? this.config.domain : [this.config.domain];
        DomainRegistrar.getInstance().updateToken(accessToken, ...domains);
    }

    private clearAppliedToken(): void {
        if (!this.config) return;
        const domains = Array.isArray(this.config.domain) ? this.config.domain : [this.config.domain];
        DomainRegistrar.getInstance().clearToken(...domains);
    }

    private isTokenExpired(entry: OAuth2TokenEntry): boolean {
        if (!entry.expiresIn) return false;
        const buffer = this.config?.refreshBuffer ?? 60000;
        return Date.now() >= entry.acquiredAt + entry.expiresIn * 1000 - buffer;
    }

    private async sendRequest(url: string, params: Record<string, string>): Promise<Response> {
        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(params).toString(),
        });
    }

    private async parseErrorResponse(response: Response): Promise<{ error?: string; error_description?: string }> {
        try {
            return await response.json();
        } catch {
            return {};
        }
    }

    emit(event: string, data: any): void {
        const handlers = this.listeners.get(event);
        if (!handlers) return;
        for (const handler of handlers) {
            try {
                handler(data);
            } catch {
                // 事件处理器异常不阻塞主流程
            }
        }
    }
}

/**
 * 全局单例
 */
export const oauth2 = new OAuth2Manager();
