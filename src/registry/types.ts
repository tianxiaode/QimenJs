/**
 * 注册中心类型定义
 * 定义了系统配置、域配置等类型以及注册器名称常量
 */

/**
 * 注册器集合接口
 * 用于类型化访问注册器
 */
export interface Registrars {}

/**
 * 环境类型定义
 * 定义了可能的应用环境值
 */
export type EnvType = 'development' | 'production' | 'test';

/**
 * 系统配置接口
 * 定义了系统级别的配置项
 */
export interface SystemConfig {
    env: EnvType;
    locale: string;
    dateFormat: string;
    datetimeFormat: string;
    timezone: string;
    currentUser?: { id: string | number; name: string; [key: string]: any };
    tenantId?: string | number;
    password: {
        minLength: number;
        maxLength: number;
        upperCase: boolean;
        lowerCase: boolean;
        digit: boolean;
        specialChar: boolean;
    };
    // 允许扩展其他业务自定义配置
    [key: string]: any;
}

/**
 * 预设类型定义
 * 定义了可用的预设类型
 */
export type PresetType = 'abp' | 'spring' | string;

/**
 * 域配置接口
 * 定义了域相关的配置项
 */
export interface DomainConfig {
    readonly baseUrl: string;
    preset: PresetType;
    timeout?: number;
    custom?: Record<string, any>;
    pageSize: number;
    pagesizes: number[];
    // 注入到所有请求 URL Query 中的参数
    commonParams?: Record<string, any> | ((...args: any[]) => Record<string, any>); 
    // 注入到所有 POST/PUT 请求 Body 中的参数
    commonBody?: Record<string, any> | ((...args: any[]) => Record<string, any>);    
    [key: string]: any;
}

/**
 * 注册器名称常量定义
 * 用于标识不同类型的注册器
 */
export const SystemRegistrarName = 'system' as const;
export const PatternRegistrarName = 'pattern' as const;
export const MimeTypeRegistrarName = 'mimeType' as const;
export const DomainRegistrarName = 'domain' as const;
export const HtmlTemplateRegistrarName = 'html' as const;