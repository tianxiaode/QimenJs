"use strict";
/**
 * HTTP Action 注册表
 *
 * 纯粹的 HTTP 处理器注册表
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpActionRegistrar = exports.HttpActionCategory = void 0;
const registry_1 = require("@orbitjs/registry");
/**
 * HTTP Action 类别
 */
var HttpActionCategory;
(function (HttpActionCategory) {
    /**
     * 准备阶段 - 构建请求
     */
    HttpActionCategory[HttpActionCategory["PREPARE"] = 100] = "PREPARE";
    /**
     * 交换阶段 - 发送请求
     */
    HttpActionCategory[HttpActionCategory["EXCHANGE"] = 200] = "EXCHANGE";
    /**
     * 处理阶段 - 处理响应
     */
    HttpActionCategory[HttpActionCategory["PROCESS"] = 300] = "PROCESS";
    /**
     * 对齐阶段 - 后处理
     */
    HttpActionCategory[HttpActionCategory["ALIGN"] = 400] = "ALIGN";
})(HttpActionCategory || (exports.HttpActionCategory = HttpActionCategory = {}));
/**
 * HttpActionRegistrar 类
 *
 * 管理 HTTP 处理器的注册和检索
 */
class HttpActionRegistrar extends registry_1.RegistrarBase {
    constructor() {
        super(...arguments);
        this.name = 'http-action';
        /**
         * 存储数据
         */
        this.storage = new Map();
        /**
         * 管道缓存
         */
        this.pipelineCache = null;
    }
    /**
     * 注册 HTTP Action
     */
    register(entry) {
        this.checkLock();
        this.storage.set(entry.name, entry);
        this.clearCache();
    }
    /**
     * 批量注册
     */
    registerAll(entries) {
        this.checkLock();
        entries.forEach(entry => {
            this.storage.set(entry.name, entry);
        });
        this.clearCache();
    }
    /**
     * 获取 HTTP Action
     */
    get(name) {
        return this.storage.get(name);
    }
    /**
     * 获取完整的 HTTP 管道（按优先级排序）
     */
    getPipeline() {
        if (this.pipelineCache) {
            return this.pipelineCache;
        }
        const entries = Array.from(this.storage.values());
        // 按类别和偏移量排序
        const sorted = entries.sort((a, b) => {
            const weightA = a.category + a.offset;
            const weightB = b.category + b.offset;
            return weightA - weightB;
        });
        this.pipelineCache = sorted;
        return sorted;
    }
    /**
     * 清除缓存
     */
    clearCache() {
        this.pipelineCache = null;
    }
    /**
     * 覆写 clear 方法
     */
    clear() {
        super.clear();
        this.clearCache();
    }
    /**
     * 注销处理器
     */
    unregister(name) {
        this.checkLock();
        this.storage.delete(name);
        this.clearCache();
    }
    /**
     * 检查是否存在
     */
    has(name) {
        return this.storage.has(name);
    }
    /**
     * 获取所有名称
     */
    getNames() {
        return Array.from(this.storage.keys());
    }
    /**
     * 实现抽象方法：输出注册器状态
     */
    doInspect() {
        const entries = Array.from(this.storage.entries());
        if (entries.length === 0) {
            console.log('  (empty)');
            return;
        }
        entries.forEach(([name, entry]) => {
            console.log(`  ${name}: ${entry.description || 'no description'}`);
        });
    }
}
exports.HttpActionRegistrar = HttpActionRegistrar;
//# sourceMappingURL=HttpActionRegistrar.js.map