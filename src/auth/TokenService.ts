/**
 * TokenService - Token 管理服务
 * 
 * 职责：
 * - 存储 token
 * - 自动刷新 token
 * - 处理 token 失效
 * 
 * 单一职责：只负责 token 的生命周期管理
 */

import type { TokenData, TokenRefreshHandler, TokenConfig } from './types';

/**
 * Token 存储项
 */
interface TokenEntry {
    data: TokenData;
    refreshHandler?: TokenRefreshHandler;
    config: TokenConfig;
}

/**
 * TokenService 类
 */
export class TokenService {
    private static instance: TokenService;
    
    /**
     * Token 存储
     */
    private tokens: Map<string, TokenEntry> = new Map();
    
    /**
     * 私有构造函数（单例）
     */
    private constructor() {}
    
    /**
     * 获取单例实例
     */
    static getInstance(): TokenService {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }
    
    /**
     * 设置 token
     * 
     * @param domain - 域名
     * @param tokenData - Token 数据
     * @param config - Token 配置
     */
    setToken(
        domain: string,
        tokenData: TokenData,
        config: TokenConfig = {}
    ): void {
        this.tokens.set(domain, {
            data: tokenData,
            config: {
                refreshThreshold: config.refreshThreshold ?? 60000,
                autoRefresh: config.autoRefresh ?? true,
                onInvalid: config.onInvalid,
            },
        });
    }
    
    /**
     * 设置刷新处理器
     * 
     * @param domain - 域名
     * @param handler - 刷新处理器
     */
    setRefreshHandler(domain: string, handler: TokenRefreshHandler): void {
        const entry = this.tokens.get(domain);
        if (entry) {
            entry.refreshHandler = handler;
        } else {
            // 如果还没有 token，先创建一个空条目
            this.tokens.set(domain, {
                data: { token: '', expires: 0 },
                refreshHandler: handler,
                config: {
                    refreshThreshold: 60000,
                    autoRefresh: true,
                },
            });
        }
    }
    
    /**
     * 获取 token（自动刷新）
     * 
     * @param domain - 域名
     * @returns Token 值，如果无法获取则返回 null
     */
    async getToken(domain: string): Promise<string | null> {
        const entry = this.tokens.get(domain);
        
        if (!entry) {
            return null;
        }
        
        const now = Date.now();
        const { data, refreshHandler, config } = entry;
        
        // 检查是否需要刷新
        const shouldRefresh = 
            config.autoRefresh &&
            refreshHandler &&
            now >= (data.expires - (config.refreshThreshold || 60000));
        
        if (shouldRefresh) {
            try {
                const newData = await refreshHandler();
                entry.data = newData;
                return newData.token;
            } catch (error) {
                // 刷新失败
                if (config.onInvalid) {
                    await config.onInvalid(domain);
                }
                return null;
            }
        }
        
        // 检查是否已过期
        if (now >= data.expires) {
            if (config.onInvalid) {
                await config.onInvalid(domain);
            }
            return null;
        }
        
        return data.token;
    }
    
    /**
     * 同步获取 token（不自动刷新）
     * 
     * @param domain - 域名
     * @returns Token 值，如果过期或不存在则返回 null
     */
    getTokenSync(domain: string): string | null {
        const entry = this.tokens.get(domain);
        
        if (!entry) {
            return null;
        }
        
        const { data } = entry;
        
        // 检查是否已过期
        if (Date.now() >= data.expires) {
            return null;
        }
        
        return data.token;
    }
    
    /**
     * 检查 token 是否有效
     * 
     * @param domain - 域名
     * @returns 是否有效
     */
    isValid(domain: string): boolean {
        const entry = this.tokens.get(domain);
        
        if (!entry) {
            return false;
        }
        
        return Date.now() < entry.data.expires;
    }
    
    /**
     * 清除 token
     * 
     * @param domain - 域名
     */
    clearToken(domain: string): void {
        this.tokens.delete(domain);
    }
    
    /**
     * 清除所有 token
     */
    clearAll(): void {
        this.tokens.clear();
    }
    
    /**
     * 手动刷新 token
     * 
     * @param domain - 域名
     * @returns 新的 token 数据，如果失败则返回 null
     */
    async refreshToken(domain: string): Promise<TokenData | null> {
        const entry = this.tokens.get(domain);
        
        if (!entry || !entry.refreshHandler) {
            return null;
        }
        
        try {
            const newData = await entry.refreshHandler();
            entry.data = newData;
            return newData;
        } catch (error) {
            if (entry.config.onInvalid) {
                await entry.config.onInvalid(domain);
            }
            return null;
        }
    }
    
    /**
     * 获取 token 的剩余有效时间（毫秒）
     * 
     * @param domain - 域名
     * @returns 剩余时间，如果不存在或已过期则返回 0
     */
    getRemainingTime(domain: string): number {
        const entry = this.tokens.get(domain);
        
        if (!entry) {
            return 0;
        }
        
        const remaining = entry.data.expires - Date.now();
        return remaining > 0 ? remaining : 0;
    }
}
