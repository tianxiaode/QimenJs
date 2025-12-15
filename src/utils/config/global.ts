import { ErrorHandlingConfig, HttpConfig, GlobalConfig } from './types';

// 默认配置
const defaultConfig: GlobalConfig = {
    errorHandling: {
        getMessage: (error: any) => {
            // 默认错误消息处理逻辑
            return error.message || 'UNKNOWN_ERROR';
        },
        getFormattedMessage: (errors: any[], customMessage?: string) => {
            if (customMessage) {
                return customMessage;
            }
            return errors.map(err => err.message || 'UNKNOWN_ERROR').join('; ');
        },
        getValidationMessage(error) {
            return error.message || 'VALIDATION_FAILED';
        },
        getValidationFormattedMessage: (errors: any[], customMessage?: string) => {
            if (customMessage) {
                return customMessage;
            }
            return errors.map(err => err.message || 'VALIDATION_FAILED').join('; ');
        },
        httpErrorHandler(error) {
            console.error('HTTP Error:', error);
        },
    },

    http: {
        baseURL: '',
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
    },

    validation: {
        rules: {},
        options: {
            abortEarly: false,
            stripUnknown: true,
        },
    },
};

// 当前配置
let currentConfig: GlobalConfig = { ...defaultConfig };

/**
 * 全局配置管理器
 */
export const globalConfig = {
    /**
     * 初始化全局配置
     * @param config 用户配置
     */
    init(config: Partial<GlobalConfig>) {
        currentConfig = {
            errorHandling: {
                ...defaultConfig.errorHandling,
                ...config.errorHandling,
            },
            http: {
                ...defaultConfig.http,
                ...config.http,
            },
            validation: {
                ...defaultConfig.validation,
                ...config.validation,
            },
        };

        console.log('全局配置已初始化');
    },

    /**
     * 获取整个配置
     */
    get(): GlobalConfig {
        return currentConfig;
    },

    /**
     * 获取错误处理配置
     */
    getErrorHandling(): ErrorHandlingConfig {
        return currentConfig.errorHandling;
    },

    /**
     * 获取 HTTP 配置
     */
    getHttp(): HttpConfig {
        return currentConfig.http;
    },

    /**
     * 动态更新配置项（按需使用）
     */
    update(updates: Partial<GlobalConfig>) {
        currentConfig = {
            ...currentConfig,
            ...updates,
        };
    },
};
