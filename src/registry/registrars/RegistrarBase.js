"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrarBase = void 0;
/**
 * 注册器基类
 * 定义了注册器的基本结构和通用操作方法
 *
 * 所有具体的注册器都应继承此类，以获得统一的接口和功能
 * 包括单例模式、锁定机制、存储管理和基本操作方法
 */
class RegistrarBase {
    constructor() {
        /**
         * 注册器锁定状态
         * 用于防止在应用启动后修改配置
         * @protected
         */
        this.isLocked = false;
    }
    /**
     * 获取注册器实例，确保单例模式
     *
     * @returns 注册器实例，确保同一类型只存在一个实例
     */
    static getInstance() {
        const constructor = this;
        if (!RegistrarBase.instances.has(constructor)) {
            RegistrarBase.instances.set(constructor, new this());
        }
        return RegistrarBase.instances.get(constructor);
    }
    /**
     * 检查注册器是否被锁定
     * 如果已锁定则抛出错误
     *
     * @throws Error - 当注册器被锁定时抛出
     * @protected
     */
    checkLock() {
        if (this.isLocked) {
            throw new Error(`[Registrar: ${this.name}] modification denied: Locked.`);
        }
    }
    /**
     * 锁定注册器，阻止后续修改
     *
     * 一旦锁定，将不能进行注册、注销等修改操作
     * 通常在应用启动完成后调用，确保运行时配置的稳定性
     */
    lock() {
        this.isLocked = true;
    }
    /**
     * 清空存储的数据
     * 根据存储类型的不同采用不同的清空方式
     *
     * 此操作不可逆，请谨慎使用
     */
    clear() {
        this.checkLock();
        if (!this.storage)
            return;
        if (typeof this.storage.clear === 'function') {
            this.storage.clear();
        }
        else if (Array.isArray(this.storage)) {
            this.storage.length = 0;
        }
        else if (typeof this.storage === 'object') {
            Object.keys(this.storage).forEach(key => delete this.storage[key]);
        }
    }
    /**
     * 输出注册器的当前状态信息
     * 以分组的形式输出注册器的信息，便于调试和诊断
     *
     * 此方法会调用子类实现的doInspect方法来显示具体的数据内容
     */
    inspect() {
        console.group(`🔍 Registrar: ${this.name} [${this.isLocked ? '🔒' : '🔓'}]`);
        this.doInspect(); // 子类只负责核心数据的呈现方式
        console.groupEnd();
    }
}
exports.RegistrarBase = RegistrarBase;
/**
 * 存储所有注册器实例，确保单例模式
 * 使用构造函数作为键，保证每种注册器只有一个实例
 * @private
 */
RegistrarBase.instances = new Map();
//# sourceMappingURL=RegistrarBase.js.map