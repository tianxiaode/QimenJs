export interface Registrars {}

export type EnvType = 'development' | 'production' | 'test';

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

export type PresetType = 'abp' | 'spring' | string;

export interface DomainConfig {
    readonly baseUrl: string;
    preset: PresetType;
    timeout?: number;
    custom?: Record<string, any>;
    pageSize: number;
    pageSizeOptions: number[];
    // 注入到所有请求 URL Query 中的参数
    commonParams?: Record<string, any> | ((...args: any[]) => Record<string, any>); 
    // 注入到所有 POST/PUT 请求 Body 中的参数
    commonBody?: Record<string, any> | ((...args: any[]) => Record<string, any>);    
}
export const SystemRegistrarName = 'system' as const;
export const PatternRegistrarName = 'pattern' as const;
export const MimeTypeRegistrarName = 'mimeType' as const;
export const DomainRegistrarName = 'domain' as const;
export const HtmlTemplateRegistrarName = 'html' as const;
