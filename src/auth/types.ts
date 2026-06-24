/**
 * Token 数据
 */
export interface TokenData {
    /**
     * Token 值
     */
    token: string;
    
    /**
     * 过期时间（时间戳）
     */
    expires: number;
    
    /**
     * 刷新 token（可选）
     */
    refreshToken?: string;
}

/**
 * Token 刷新处理器
 */
export type TokenRefreshHandler = () => Promise<TokenData>;

/**
 * Token 失效回调
 */
export type TokenInvalidCallback = (domain: string) => void | Promise<void>;

/**
 * Token 配置
 */
export interface TokenConfig {
    /**
     * 刷新阈值（提前多少毫秒刷新）
     * 默认：60000 (1分钟)
     */
    refreshThreshold?: number;
    
    /**
     * 是否自动刷新
     * 默认：true
     */
    autoRefresh?: boolean;
    
    /**
     * Token 失效时的回调
     */
    onInvalid?: TokenInvalidCallback;
}
