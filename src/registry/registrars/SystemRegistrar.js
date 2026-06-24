"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemRegistrar = void 0;
const types_1 = require("../types");
const RegistrarBase_1 = require("./RegistrarBase");
/**
 * 系统配置注册器
 * 管理全局系统配置信息
 *
 * 存储和管理系统级的配置，如语言环境、日期格式、密码策略等
 * 提供默认配置和动态更新功能
 */
class SystemRegistrar extends RegistrarBase_1.RegistrarBase {
    constructor() {
        super(...arguments);
        this.name = types_1.SystemRegistrarName;
        // 静态配置池：这是唯一的真相来源（Source of Truth）
        this.storage = {
            locale: 'zh-CN',
            dateFormat: 'YYYY-MM-DD',
            datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
            timezone: 'UTC+8',
            password: {
                minLength: 8,
                maxLength: 16,
                upperCase: true,
                lowerCase: true,
                digit: true,
                specialChar: true,
            },
        };
    }
    /**
     * 注册系统配置
     * 支持两种调用方式：
     * 1. 单个注册: register('locale', 'zh-CN')
     * 2. 对象拆解: register({ locale: 'zh-CN', timezone: 'UTC+8' })
     *
     * @param keyOrObj - 配置键名或包含多个配置的对象
     * @param value - 配置值（当第一个参数为键名时）
     */
    register(keyOrObj, value) {
        this.checkLock();
        if (typeof keyOrObj === 'object' && keyOrObj !== null) {
            // 模式 2：拆解对象注册
            Object.assign(this.storage, keyOrObj);
        }
        else if (typeof keyOrObj === 'string') {
            // 模式 1：单个 Key 注册
            this.storage[keyOrObj] = value;
        }
    }
    /**
     * 批量合并注册配置
     * 一次性更新多个配置项
     *
     * @param obj - 包含多个配置项的对象
     */
    registerAll(obj) {
        this.checkLock();
        // 使用 Object.assign 进行一级合并
        // 如果需要处理 password 这种嵌套对象，建议使用简单的递归合并
        Object.assign(this.storage, obj);
    }
    /**
     * 注销指定的配置项
     * 从存储中删除指定键的配置
     *
     * @param key - 要删除的配置键
     */
    unregister(key) {
        this.checkLock();
        delete this.storage[key];
    }
    /**
     * 获取指定的配置项
     *
     * @param key - 配置键名
     * @returns 配置值
     */
    get(key) {
        return this.storage[key];
    }
    /**
     * 获取所有系统配置
     *
     * @returns 完整的配置对象
     */
    getAll() {
        return this.storage;
    }
    /**
     * 输出系统配置注册器的状态信息
     * 显示当前存储的所有配置项
     *
     * @protected
     */
    doInspect() {
        console.group('🖥️ System Global Configuration');
        console.table(this.storage);
        console.groupEnd();
    }
}
exports.SystemRegistrar = SystemRegistrar;
//# sourceMappingURL=SystemRegistrar.js.map