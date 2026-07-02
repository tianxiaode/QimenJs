/**
 * OAuth2 认证流程类型定义
 *
 * @module oauth2/types
 */

/**
 * OAuth2 授权类型
 */
export type OAuth2GrantType =
    | 'authorization_code'
    | 'password'
    | 'client_credentials'
    | 'refresh_token';

/**
 * OAuth2 配置
 */
export interface OAuth2Config {
    /** Token 端点（必填） */
    tokenEndpoint: string;
    /** 撤销端点（可选） */
    revokeEndpoint?: string;
    /** 客户端 ID（必填） */
    clientId: string;
    /** 客户端密钥（机密客户端需要） */
    clientSecret?: string;
    /** 重定向 URI（授权码模式） */
    redirectUri?: string;
    /** 授权端点（授权码模式跳转用） */
    authorizationEndpoint?: string;
    /** 作用域 */
    scopes?: string[];
    /** 关联的域名（updateToken 目标，支持多个） */
    domain: string | string[];
    /** Token 存储方式（默认 'memory'） */
    storage?: 'memory' | 'localStorage' | 'sessionStorage';
    /** Token 提前刷新时间（毫秒，默认 60000 = 1 分钟） */
    refreshBuffer?: number;
}

/**
 * OAuth2 Token 响应（RFC 6749 标准格式）
 */
export interface OAuth2TokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
}

/**
 * 密码模式凭证
 */
export interface OAuth2PasswordCredentials {
    username: string;
    password: string;
    scope?: string;
}

/**
 * Token 存储条目
 */
export interface OAuth2TokenEntry {
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
    scope?: string;
    acquiredAt: number;
}

/**
 * OAuth2 登录结果
 */
export interface OAuth2LoginResult {
    success: boolean;
    accessToken?: string;
    error?: {
        code?: string;
        message: string;
    };
}

/**
 * OAuth2 事件数据
 */
export interface OAuth2TokenAcquiredEvent {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface OAuth2TokenRefreshedEvent {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
}

export interface OAuth2TokenExpiredEvent {
    domain: string | string[];
}

export interface OAuth2RefreshFailedEvent {
    error: Error;
}
