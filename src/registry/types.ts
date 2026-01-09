/** 子注册器必须遵循的接口 */
export interface Registrar<T = any> {
    readonly name: string;
    
    /** 原子操作：注册/设置单个条目 */
    add(name: string, entry: any): void; 
    
    /** 容器操作：注册/更新 整个实体或配置包 */
    register(name: string, entry: T): void;
    
    unregister(name: string): void;
    get(...args: any[]): any;
    lock(): void;
    inspect(): void; 
}

export interface ISystemRegistrar extends Registrar<SystemConfig> {}

/** 定义 RegistryHub 管理的接口类型（声明合并预留） */
export interface Registrars {
    system: ISystemRegistrar;
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
