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

export type PatternEntry = RegExp | { regex: string; flags?: string };

export type HeadersProvider = (config: DomainConfig) => Promise<Record<string, string>>;

export interface BaseExchange {
    // 1. 物理层：能不能通？
    transport: {
        isFailure: boolean; // 网络不通、DNS 错误等
        error?: any; // 原始错误对象
    };

    http: {
        url: string;
        status: number; // 状态码
        isSuccess: boolean; // 是否 2xx
        headers: Record<string, string>;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH';
        rawResponse?: any; // 留给需要读取特殊 Header 的情况
        body?: any;
        segments: (string | number)[];
        timeout: number;
        [key: string]: any;
    };

    data: {
        /** * 1. 物理源数据 (The Source)
         * 接口返回的原始 payload。
         * 如果是 JSON，这里是未解析的字符串或 Axios 自动处理的第一手数据。
         * 作用：用于排查“后端到底给了什么”以及作为 Extractor 的备选源。
         */
        source: any;

        /** * 2. 逻辑处理数据 (The Body)
         * 经过流水线 Parser 零件（如 JSON.parse, Blob 封装）处理后的结果。
         * 作用：DomainExtractor 的主战场，直接拿来用。
         */
        parsed: any;
    };

    metadata: {
        // --- 由流水线零件自动填充的“体检指标” ---
        contentType: string;
        isJson: boolean;
        isText: boolean;
        isBlob: boolean;

        // --- 业务动作标识 ---
        action: string;
        [key: string]: any;
    };
}

export interface DomainExtractorResult {
    list?: any[];
    total?: number;
    data?: any;
    error?: {
        code: string | number;
        message: string;
        showType: 'silent' | 'warn' | 'error' | 'notification'; // 封装弹窗逻辑
    };
}

export type DomainExtractor = (rawResponse: any) => DomainExtractorResult;

export interface DomainConfig {
    readonly baseUrl: string;
    extractor: DomainExtractor;
    timeout?: number;

    /**
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
