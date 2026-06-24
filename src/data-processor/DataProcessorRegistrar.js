"use strict";
/**
 * 数据处理注册器（优化版）
 *
 * 参照 validation 的 ValidatorRegistrar 实现
 * - 支持权重 + 偏移量排序
 * - 支持 tags 过滤和复用
 * - 支持执行过程跟踪
 *
 * @module data-processor/DataProcessorRegistrar
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProcessorRegistrar = exports.DataProcessorRegistrarName = void 0;
const RegistrarBase_1 = require("@/registry/registrars/RegistrarBase");
const weights_1 = require("./weights");
/**
 * 数据处理注册器名称常量
 */
exports.DataProcessorRegistrarName = 'data-processor';
/**
 * 数据处理注册器
 *
 * 继承自 RegistrarBase，遵循注册表模式
 *
 * 参照 validation 的 ValidatorRegistrar 设计：
 * - 权重 + 偏移量排序算法
 * - Tags 过滤和复用机制
 * - 执行过程跟踪
 *
 * @example
 * // 注册处理器
 * DataProcessor.register({
 *     name: 'abp-pagination',
 *     weight: DataProcessorWeight.TRANSFORM,
 *     offset: 10,
 *     tags: ['abp', 'pre'],
 *     handle: async (ctx) => { /* ... *\/ }
 * });
 *
 * // 获取管道（通过 tags 过滤）
 * const pipeline = DataProcessor.getPipeline('abp', 'pre');
 *
 * // 执行管道
 * await DataProcessor.execute('abp', 'pre', context);
 */
class DataProcessorRegistrar extends RegistrarBase_1.RegistrarBase {
    constructor() {
        super(...arguments);
        this.name = exports.DataProcessorRegistrarName;
        /**
         * 存储处理器
         * key: 处理器名称（唯一标识）
         * value: 处理器定义
         */
        this.storage = new Map();
    }
    /**
     * 注册处理器
     *
     * @param handler 处理器定义
     *
     * @example
     * DataProcessor.register({
     *     name: 'abp-pagination',
     *     weight: DataProcessorWeight.TRANSFORM,
     *     offset: 10,
     *     tags: ['abp', 'pre'],
     *     description: 'ABP 分页参数转换',
     *     handle: async (ctx) => {
     *         // 处理逻辑
     *     }
     * });
     */
    register(handler) {
        this.checkLock();
        // 验证处理器
        this.validateHandler(handler);
        // 使用处理器名称作为键
        const key = handler.name;
        if (!this.storage.has(key)) {
            this.storage.set(key, []);
        }
        this.storage.get(key).push(handler);
        // 清除所有缓存（因为新增处理器可能影响所有管道）
        DataProcessorRegistrar.pipelineCache.clear();
    }
    /**
     * 批量注册处理器
     *
     * @param handlers 处理器列表
     *
     * @example
     * DataProcessor.registerAll([
     *     { name: 'handler1', weight: 100, tags: ['abp'], handle: async (ctx) => { /* ... *\/ } },
     *     { name: 'handler2', weight: 90, tags: ['abp'], handle: async (ctx) => { /* ... *\/ } }
     * ]);
     */
    registerAll(handlers) {
        this.checkLock();
        handlers.forEach(handler => {
            this.validateHandler(handler);
            const key = handler.name;
            if (!this.storage.has(key)) {
                this.storage.set(key, []);
            }
            this.storage.get(key).push(handler);
        });
        DataProcessorRegistrar.pipelineCache.clear();
    }
    /**
     * 获取管道列表（已排序）
     *
     * @param preset 预设类型（如 'abp'、'spring'）
     * @param phase 阶段（'pre' 或 'post'）
     * @returns 排序后的处理器列表
     *
     * @description
     * 通过 tags 过滤处理器：
     * - 处理器的 tags 包含 preset → 包含
     * - 处理器的 tags 包含 phase → 包含
     * - 处理器的 tags 包含 'any' → 包含（通配符）
     *
     * 排序算法：
     * - 按 weight + offset 升序排序
     * - 权重小的先执行
     *
     * @example
     * // 获取 ABP 前导管道
     * const pipeline = DataProcessor.getPipeline('abp', 'pre');
     */
    getPipeline(preset, phase) {
        // 构建缓存键
        const cacheKey = phase ? `${preset}-${phase}` : preset;
        // 检查缓存
        if (DataProcessorRegistrar.pipelineCache.has(cacheKey)) {
            return DataProcessorRegistrar.pipelineCache.get(cacheKey);
        }
        // 获取所有处理器
        const allHandlers = Array.from(this.storage.values()).flat();
        // 通过 tags 过滤
        const filtered = allHandlers.filter(handler => {
            const tags = handler.tags || ['any'];
            // 通配符匹配
            if (tags.includes('any')) {
                return true;
            }
            // 预设匹配
            const matchesPreset = tags.includes(preset);
            // 阶段匹配（如果指定了阶段）
            const matchesPhase = phase ? tags.includes(phase) : true;
            return matchesPreset && matchesPhase;
        });
        // 按 weight + offset 升序排序（权重小的先执行）
        const sorted = filtered.sort((a, b) => {
            var _a, _b, _c, _d;
            const weightA = ((_a = a.weight) !== null && _a !== void 0 ? _a : 100) + ((_b = a.offset) !== null && _b !== void 0 ? _b : 0);
            const weightB = ((_c = b.weight) !== null && _c !== void 0 ? _c : 100) + ((_d = b.offset) !== null && _d !== void 0 ? _d : 0);
            return weightA - weightB;
        });
        // 缓存结果
        DataProcessorRegistrar.pipelineCache.set(cacheKey, sorted);
        return sorted;
    }
    /**
     * 移除处理器
     *
     * @param handlerName 处理器名称
     */
    unregister(handlerName) {
        this.checkLock();
        this.storage.delete(handlerName);
        DataProcessorRegistrar.pipelineCache.clear();
    }
    /**
     * 获取处理器
     *
     * @param handlerName 处理器名称
     * @returns 处理器定义，未找到返回 undefined
     */
    get(handlerName) {
        return this.storage.get(handlerName);
    }
    /**
     * 检查处理器是否存在
     *
     * @param handlerName 处理器名称
     * @returns 是否存在
     */
    has(handlerName) {
        return this.storage.has(handlerName);
    }
    /**
     * 清空所有处理器
     */
    clear() {
        this.checkLock();
        this.storage.clear();
        DataProcessorRegistrar.pipelineCache.clear();
    }
    /**
     * 验证处理器
     *
     * @param handler 处理器定义
     * @throws Error 如果处理器无效
     */
    validateHandler(handler) {
        if (!handler.name || typeof handler.name !== 'string') {
            throw new Error('Handler must have a valid name');
        }
        if (!handler.handle || typeof handler.handle !== 'function') {
            throw new Error('Handler must have a valid handle function');
        }
    }
    /**
     * 调试输出
     *
     * @description 显示所有处理器信息，按权重分组
     */
    doInspect() {
        console.group('🔧 Data Processor Registry');
        const allHandlers = Array.from(this.storage.values()).flat();
        if (allHandlers.length === 0) {
            console.log('No processors registered');
            console.groupEnd();
            return;
        }
        // 按权重分组
        const groups = new Map();
        allHandlers.forEach(handler => {
            var _a;
            const weight = (_a = handler.weight) !== null && _a !== void 0 ? _a : 100;
            if (!groups.has(weight)) {
                groups.set(weight, []);
            }
            groups.get(weight).push(handler);
        });
        // 按权重排序输出
        Array.from(groups.entries())
            .sort((a, b) => a[0] - b[0])
            .forEach(([weight, handlers]) => {
            const weightName = (0, weights_1.getWeightName)(weight);
            console.log(`\n📦 ${weightName} (${weight}):`);
            const tableData = handlers.map(h => {
                var _a, _b, _c;
                return ({
                    'Name': h.name,
                    'Offset': (_a = h.offset) !== null && _a !== void 0 ? _a : 0,
                    'Total': ((_b = h.weight) !== null && _b !== void 0 ? _b : 100) + ((_c = h.offset) !== null && _c !== void 0 ? _c : 0),
                    'Tags': (h.tags || ['any']).join(', '),
                    'Description': h.description || '-',
                });
            });
            console.table(tableData);
        });
        console.groupEnd();
    }
}
exports.DataProcessorRegistrar = DataProcessorRegistrar;
/**
 * 管道缓存（排序后的管道）
 * key: `${key}-${tag}` 组合键
 * value: 排序后的处理器列表
 */
DataProcessorRegistrar.pipelineCache = new Map();
//# sourceMappingURL=DataProcessorRegistrar.js.map