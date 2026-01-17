import { RegistrarBase } from '@/registry'; // 更新导入语句为 '@/registry'
import { ComposableEntry } from '../types';
import { ComposableRegistrarError, KernelErrorCode } from '../errors';

/**
 * ComposableRegistrar 名称常量
 */
export const ComposableRegistrarName = 'composable' as const;

/**
 * ComposableRegistrar 类用于管理可组合能力的注册和检索
 * 提供了注册、注销、获取以及依赖关系解析等功能
 * 
 * 主要特性：
 * - 支持依赖关系管理，通过MRO（方法解析顺序）算法解决依赖关系
 * - 提供缓存机制，避免重复计算依赖关系
 * - 支持单个或批量获取已注册的能力
 */
export class ComposableRegistrar extends RegistrarBase<Map<string, ComposableEntry>> {
    public readonly name = ComposableRegistrarName;
    
    /**
     * 存储所有已注册的可组合能力
     * key: 能力名称
     * value: ComposableEntry对象
     */
    protected storage = new Map<string, ComposableEntry>();
    
    /**
     * MRO（Method Resolution Order）缓存
     * 用于缓存能力名称与其依赖关系数组的映射，优化性能
     */
    private _mroCache = new Map<string, string[]>();

    /**
     * 注册一个新的可组合能力
     * @param entry 要注册的能力条目，包含名称、描述、依赖和构造函数
     */
    register(entry: ComposableEntry): void {
        this.checkLock();
        if (this.storage.has(entry.name)) {
            console.warn(`[ComposableRegistrar] Overwriting existing ability: ${entry.name}`);
        }
        this.storage.set(entry.name, entry);
        // 注册新能力后清除MRO缓存，确保后续依赖计算的准确性
        this._mroCache.clear();
    }

    /**
     * 注销指定名称的可组合能力
     * @param name 要注销的能力名称
     */
    unregister(name: string): void {
        this.checkLock();
        this.storage.delete(name);
        // 注销能力后清除MRO缓存，确保后续依赖计算的准确性
        this._mroCache.clear();
    }

    /**
     * 获取单个或多个已注册的可组合能力
     * @param name 能力名称
     * @returns 对应的可组合能力条目
     */
    get(name: string): ComposableEntry;
    
    /**
     * 获取多个已注册的可组合能力
     * @param names 能力名称数组
     * @returns 对应的可组合能力条目数组
     */
    get(names: string[]): ComposableEntry[];
    get(nameOrNames: string | string[]): ComposableEntry | ComposableEntry[] {
        if (Array.isArray(nameOrNames)) {
            return nameOrNames.map(name => {
                const entry = this.storage.get(name);
                if (!entry)
                    throw new ComposableRegistrarError(
                        `[ComposableRegistrar] ${name} not found.`,
                        KernelErrorCode.COMPOSABLE_NOT_FOUND
                    );
                return entry;
            });
        }

        const entry = this.storage.get(nameOrNames);
        if (!entry)
            throw new ComposableRegistrarError(
                `[ComposableRegistrar] ${nameOrNames} not found.`,
                KernelErrorCode.COMPOSABLE_NOT_FOUND
            );
        return entry;
    }

    /**
     * 递归获取与给定能力相关的所有依赖能力
     * 此方法会解析依赖关系并将所有相关能力返回
     * @param names 能力名称数组
     * @returns 包含所有依赖能力的数组（去重）
     */
    public getRecursive(names: string[]): ComposableEntry[] {
        // 创建一个集合用于存储所有相关的依赖能力名称（自动去重）
        const finalSet = new Set<string>();
        
        // 遍历传入的每个能力名称
        names.forEach(name => {
            // 获取该能力的完整依赖链（包括其所有依赖）
            const chain = this.getOrComputeMRO(name);
            // 将依赖链中的所有能力名称添加到最终集合中
            chain.forEach(k => finalSet.add(k));
        });

        // 将集合转换为数组，并获取对应的能力条目
        const entries = Array.from(finalSet).map(k => this.storage.get(k)!);

        return entries;
    }

    /**
     * 获取或计算方法解析顺序(MRO)，用于解决依赖关系
     * 使用缓存机制避免重复计算，提高性能
     * @param name 能力名称
     * @param stack 用于循环依赖检测的栈
     * @returns 解析后的依赖关系数组（按正确顺序排列）
     */
    private getOrComputeMRO(name: string, stack = new Set<string>()): string[] {
        // 检查缓存中是否已有此能力的MRO
        if (this._mroCache.has(name)) return this._mroCache.get(name)!;

        // 检测循环依赖
        if (stack.has(name))
            throw new ComposableRegistrarError(
                `[Registrar] Circular dependency: ${Array.from(stack).join(' -> ')} -> ${name}`,
                KernelErrorCode.CIRCULAR_DEPENDENCY
            );

        const entry = this.storage.get(name);
        if (!entry)
            throw new ComposableRegistrarError(
                `[Registrar] Ability "${name}" is not registered yet.`,
                KernelErrorCode.COMPOSABLE_NOT_FOUND
            );

        // 将当前能力添加到栈中，用于循环检测
        stack.add(name);
        const sequence: string[] = [];

        // 递归合并依赖项，确保依赖项在结果数组中的位置排在前面
        if (entry.deps) {
            entry.deps.forEach(depName => {
                const depChain = this.getOrComputeMRO(depName, stack);
                depChain.forEach(k => {
                    // 如果序列中还没有这个能力，则将其添加到结果中
                    if (!sequence.includes(k)) sequence.push(k);
                });
            });
        }

        // 将自身添加到序列末尾（确保依赖项在前，本体在后）
        if (!sequence.includes(name)) sequence.push(name);

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
    protected doInspect(): void {
        console.group(`[Registrar Inspection] : ${this.name}`);

        // 转换成表格友好的格式
        const tableData = Array.from(this.storage.entries()).map(([name, entry]) => ({
            'Ability Name': name,
            Implementation: entry.ctor.name,
            Description: entry.description || 'No description provided',
        }));

        if (tableData.length > 0) {
            console.table(tableData);
        } else {
            console.warn('The registrar is currently empty.');
        }

        console.groupEnd();
    }
}