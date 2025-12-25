import { Logger } from '../../logger';
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

    logger: {
        level: 'info' as const,
        color: true,
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

        // 初始化日志系统
        if (!Logger.root) {
            Logger.root = new Logger(currentConfig.logger);
        }

        // 创建全局配置专用的日志记录器实例
        this.logger = Logger.for('GlobalConfig');
        this.logger.info('全局配置已初始化');
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
     * TODO: 当前实现仅为浅层合并，待深度复制方法实现后需完善以下功能：
     * 1. 实现深层对象合并而非仅顶层属性合并
     * 2. 添加变更前后配置的详细日志记录
     * 3. 支持配置更新的回调通知机制
     * 4. 添加配置更新的验证机制
     */
    update(updates: Partial<GlobalConfig>) {
        // 这里应该修改为对象复制，而不是直接赋值
        currentConfig = {
            ...currentConfig,
            ...updates,
        };
        
        // TODO: 待实现深度复制后，应记录配置变更日志
        // this.logger?.info('配置已更新', { 
        //     changes: updates,
        //     previous: previousConfig,
        //     current: currentConfig 
        // });
    },

    // 全局配置模块的专用日志记录器
    logger: null as any,
};