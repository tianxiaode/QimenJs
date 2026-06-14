"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComposableRegistrar = exports.ComposableRegistrarName = void 0;
const registry_1 = require("@/registry");
const errors_1 = require("../errors");
/**
 * ComposableRegistrar 名称常量
 */
exports.ComposableRegistrarName = 'composable';
/**
 * ComposableRegistrar 类用于管理可组合能力的注册和检索
 * 提供了注册、注销、获取以及依赖关系解析等功能
 *
 * 主要特性：
 * - 支持依赖关系管理，通过MRO（方法解析顺序）算法解决依赖关系
 * - 提供缓存机制，避免重复计算依赖关系
 * - 支持单个或批量获取已注册的能力
 */
class ComposableRegistrar extends registry_1.RegistrarBase {
    constructor() {
        super(...arguments);
        this.name = exports.ComposableRegistrarName;
        /**
         * 存储所有已注册的可组合能力
         * key: 能力名称
         * value: ComposableEntry对象
         */
        this.storage = new Map();
        /**
         * MRO（Method Resolution Order）缓存
         * 用于缓存能力名称与其依赖关系数组的映射，优化性能
         */
        this._mroCache = new Map();
        /**
         * 预编译能力缓存
         * key: 能力名称
         * value: 预编译的能力
         */
        this._precompiledCache = new Map();
        /**
         * 可预编译的能力类存储
         * key: 能力名称
         * value: 可预编译的能力类
         */
        this._abilityClasses = new Map();
    }
    register(entry, abilityClass, options) {
        this.checkLock();
        if (this.storage.has(entry.name)) {
            console.warn(`[ComposableRegistrar] Overwriting existing ability: ${entry.name}`);
        }
        this.storage.set(entry.name, entry);
        // 存储能力类（构造函数或实例）
        if (abilityClass) {
            this._abilityClasses.set(entry.name, abilityClass);
        }
        else if (entry.abilityClass) {
            this._abilityClasses.set(entry.name, entry.abilityClass);
        }
        // 注册新能力后清除MRO缓存，确保后续依赖计算的准确性
        this._mroCache.clear();
    }
    /**
     * 注销指定名称的可组合能力
     * @param name 要注销的能力名称
     */
    unregister(name) {
        this.checkLock();
        this.storage.delete(name);
        // 注销能力后清除MRO缓存，确保后续依赖计算的准确性
        this._mroCache.clear();
    }
    get(nameOrNames) {
        if (Array.isArray(nameOrNames)) {
            return nameOrNames.map(name => {
                const entry = this.storage.get(name);
                if (!entry)
                    throw new errors_1.ComposableRegistrarError(`[ComposableRegistrar] ${name} not found.`, errors_1.KernelErrorCode.COMPOSABLE_NOT_FOUND);
                return entry;
            });
        }
        const entry = this.storage.get(nameOrNames);
        if (!entry)
            throw new errors_1.ComposableRegistrarError(`[ComposableRegistrar] ${nameOrNames} not found.`, errors_1.KernelErrorCode.COMPOSABLE_NOT_FOUND);
        return entry;
    }
    /**
     * 获取预编译能力（懒加载）
     * 如果能力未预编译，则自动预编译并缓存
     *
     * @param name 能力名称
     * @returns 预编译的能力，如果不存在则返回 undefined
     */
    getPrecompiled(name) {
        // 检查缓存
        if (this._precompiledCache.has(name)) {
            return this._precompiledCache.get(name);
        }
        // 懒加载预编译
        const abilityClass = this._abilityClasses.get(name);
        if (abilityClass) {
            // 判断是实例还是构造函数
            let ability;
            if (typeof abilityClass === 'function') {
                // 构造函数：实例化
                ability = new abilityClass();
                // 缓存实例，下次不需要再实例化
                this._abilityClasses.set(name, ability);
            }
            else {
                // 已经是实例
                ability = abilityClass;
            }
            // 预编译并缓存
            const precompiled = ability.precompile();
            this._precompiledCache.set(name, precompiled);
            return precompiled;
        }
        return undefined;
    }
    /**
     * 批量获取预编译能力
     *
     * @param names 能力名称数组
     * @returns 预编译的能力数组
     */
    getPrecompiledMultiple(names) {
        return names
            .map(name => this.getPrecompiled(name))
            .filter((ability) => ability !== undefined);
    }
    /**
     * 递归获取与给定能力相关的所有依赖能力
     * 此方法会解析依赖关系并将所有相关能力返回
     * @param names 能力名称数组
     * @returns 包含所有依赖能力的数组（去重）
     */
    getRecursive(names) {
        // 创建一个集合用于存储所有相关的依赖能力名称（自动去重）
        const finalSet = new Set();
        // 遍历传入的每个能力名称
        names.forEach(name => {
            // 获取该能力的完整依赖链（包括其所有依赖）
            const chain = this.getOrComputeMRO(name);
            // 将依赖链中的所有能力名称添加到最终集合中
            chain.forEach(k => finalSet.add(k));
        });
        // 将集合转换为数组，并获取对应的能力条目
        const entries = Array.from(finalSet).map(k => this.storage.get(k));
        return entries;
    }
    /**
     * 获取或计算方法解析顺序(MRO)，用于解决依赖关系
     * 使用缓存机制避免重复计算，提高性能
     * @param name 能力名称
     * @param stack 用于循环依赖检测的栈
     * @returns 解析后的依赖关系数组（按正确顺序排列）
     */
    getOrComputeMRO(name, stack = new Set()) {
        // 检查缓存中是否已有此能力的MRO
        if (this._mroCache.has(name))
            return this._mroCache.get(name);
        // 检测循环依赖
        if (stack.has(name))
            throw new errors_1.ComposableRegistrarError(`[Registrar] Circular dependency: ${Array.from(stack).join(' -> ')} -> ${name}`, errors_1.KernelErrorCode.CIRCULAR_DEPENDENCY);
        const entry = this.storage.get(name);
        if (!entry)
            throw new errors_1.ComposableRegistrarError(`[Registrar] Ability "${name}" is not registered yet.`, errors_1.KernelErrorCode.COMPOSABLE_NOT_FOUND);
        // 将当前能力添加到栈中，用于循环检测
        stack.add(name);
        const sequence = [];
        // 递归合并依赖项，确保依赖项在结果数组中的位置排在前面
        if (entry.deps) {
            entry.deps.forEach(depName => {
                const depChain = this.getOrComputeMRO(depName, stack);
                depChain.forEach(k => {
                    // 如果序列中还没有这个能力，则将其添加到结果中
                    if (!sequence.includes(k))
                        sequence.push(k);
                });
            });
        }
        // 将自身添加到序列末尾（确保依赖项在前，本体在后）
        if (!sequence.includes(name))
            sequence.push(name);
        // 从栈中移除当前能力
        stack.delete(name);
        // 将计算结果存入缓存
        this._mroCache.set(name, sequence);
        return sequence;
    }
    /**
     * 执行检查操作，输出注册表信息到控制台
     * @protected
     */
    doInspect() {
        console.group(`[Registrar Inspection] : ${this.name}`);
        // 转换成表格友好的格式
        const tableData = Array.from(this.storage.entries()).map(([name, entry]) => {
            var _a;
            return ({
                'Ability Name': name,
                Implementation: (_a = entry.abilityClass) === null || _a === void 0 ? void 0 : _a.name,
                Description: entry.description || 'No description provided',
            });
        });
        if (tableData.length > 0) {
            console.table(tableData);
        }
        else {
            console.warn('The registrar is currently empty.');
        }
        console.groupEnd();
    }
}
exports.ComposableRegistrar = ComposableRegistrar;
//# sourceMappingURL=ComposableRegistrar.js.map