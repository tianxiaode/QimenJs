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

export const SystemRegistrarName = 'system' as const;
export const PatternRegistrarName = 'pattern' as const;
export const MimeTypeRegistrarName = 'mimeType' as const;
