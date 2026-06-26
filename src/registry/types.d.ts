/**
 * 注册中心类型定义
 * 定义了系统配置、域配置等类型以及注册器名称常量
 *
 * 此文件包含了注册系统所需的所有类型定义，为TypeScript提供类型安全
 */
/**
 * 注册器集合接口
 * 用于类型化访问注册器
 * 通过模块增强的方式，可以动态扩展此接口
 */
export interface Registrars {
}
/**
 * 环境类型定义
 * 定义了可能的应用环境值
 * 用于区分开发、生产、测试等不同运行环境
 */
export type EnvType = 'development' | 'production' | 'test';
/**
 * 系统配置接口
 * 定义了系统级别的配置项
 * 包括语言环境、日期格式、密码策略等全局配置
 */
export interface SystemConfig {
    env: EnvType;
    locale: string;
    dateFormat: string;
    datetimeFormat: string;
    timezone: string;
    currentUser?: {
        id: string | number;
        name: string;
        [key: string]: any;
    };
    tenantId?: string | number;
    password: {
        minLength: number;
        maxLength: number;
        upperCase: boolean;
        lowerCase: boolean;
        digit: boolean;
        specialChar: boolean;
    };
    [key: string]: any;
}
/**
 * 预设类型定义
 * 定义了可用的预设类型
 * 允许扩展自定义预设类型以适应不同业务场景
 */
export type PresetType = 'abp' | 'spring' | string;
/**
 * 域配置接口
 * 定义了域相关的配置项
 * 用于管理不同域名或API端点的配置信息
 */
export interface DomainConfig {
    readonly baseUrl: string;
    preset: PresetType;
    timeout?: number;
    custom?: Record<string, any>;
    pageSize: number;
    pagesizes: number[];
    commonParams?: Record<string, any> | ((...args: any[]) => Record<string, any>);
    commonBody?: Record<string, any> | ((...args: any[]) => Record<string, any>);
    token?: string;
    authInjector?: 'bearer' | 'basic' | ((context: any) => void | Promise<void>);
    [key: string]: any;
}
/**
 * 注册器名称常量定义
 * 用于标识不同类型的注册器
 * 使用const断言确保类型安全，防止意外修改
 */
export declare const SystemRegistrarName: "system";
export declare const PatternRegistrarName: "pattern";
export declare const MimeTypeRegistrarName: "mimeType";
export declare const DomainRegistrarName: "domain";
export declare const HtmlTemplateRegistrarName: "html";
export declare const DataProcessorRegistrarName: "data-processor";
//# sourceMappingURL=types.d.ts.map