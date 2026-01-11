/** 子注册器必须遵循的接口 */
export interface IRegistrar {
    readonly registrarName: string;
    
    /** 容器操作：注册/更新 整个实体或配置包 */
    register(...args: any[]): void;
    
    unregister(name: string): void;
    get(...args: any[]): any;
    lock(): void;
    inspect(): void; 
}

export interface Registrars {
    // 初始为空，或者只放核心注册器
}

export interface SystemConfig {
    locale: string;
    dateFormat: string;
    datetimeFormat: string;
    timezone: string;
    currentUser?: { id: string | number; name: string; [key: string]: any };
    tenantId?: string | number;
    password:{
        minLength: number;
        maxLength: number;
        upperCase: boolean;
        lowerCase: boolean;
        digit: boolean;
        specialChar: boolean;
    }
    // 允许扩展其他业务自定义配置
    [key: string]: any;
}

export type PatternEntry = RegExp | { regex: string; flags?: string; };

export type HeadersProvider = (config: DomainConfig) => Promise<Record<string, string>>;

export interface DomainConfig {
    readonly baseUrl: string;
    timeout?: number;
    
    /** 
     * 获取域名的请求头，可以是静态的，也可以是异步的函数，
     * 即使是静态 Header，也请包裹在 async 中或返回 Promise.resolve
     */
    getHeaders: HeadersProvider;

    custom?: Record<string, any>;
}
export const SystemRegistrarName = 'system' as const;
export const PatternRegistrarName = 'pattern' as const;
export const MimeTypeRegistrarName = 'mimeType' as const;
export const DomainRegistrarName = 'domain' as const;
export const HtmlTemplateRegistrarName = 'html' as const;


