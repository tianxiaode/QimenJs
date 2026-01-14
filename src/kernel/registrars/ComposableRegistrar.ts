import { RegistrarBase } from '@orbitjs/registry';
import { ComposableEntry } from '../types';

export const ComposableRegistrarName = 'composable' as const;

export class ComposableRegistrar extends RegistrarBase<Map<string, ComposableEntry>> {
    public readonly name = ComposableRegistrarName;
    protected storage = new Map<string, ComposableEntry>();
    private _mroCache = new Map<string, string[]>();
    private _classResolvedCache = new Map<Function, ComposableEntry[]>();

    register(entry: ComposableEntry): void {
        this.checkLock();
        if (this.storage.has(entry.name)) {
            console.warn(`[ComposableRegistrar] Overwriting existing ability: ${entry.name}`);
        }
        this.storage.set(entry.name, entry);
        this._mroCache.clear();
        this._classResolvedCache.clear();
    }

    unregister(name: string): void {
        this.checkLock();
        this.storage.delete(name);
    }

    get(name: string): ComposableEntry;
    get(names: string[]): ComposableEntry[];
    get(nameOrNames: string | string[]): ComposableEntry | ComposableEntry[] {
        if (Array.isArray(nameOrNames)) {
            return nameOrNames.map(name => {
                const entry = this.storage.get(name);
                if (!entry) throw new Error(`[ComposableRegistrar] ${name} not found.`);
                return entry;
            });
        }

        const entry = this.storage.get(nameOrNames);
        if (!entry) throw new Error(`[ComposableRegistrar] ${nameOrNames} not found.`);
        return entry;
    }

    public getRecursive(names: string[], ctor?: Function): ComposableEntry[] {
        // 1. 如果有 ctor 且命中了类级缓存，直接秒回
        if (ctor && this._classResolvedCache.has(ctor)) {
            return this._classResolvedCache.get(ctor)!;
        }

        // 2. 否则进行正常的合并计算
        const finalSet = new Set<string>();
        names.forEach(name => {
            const chain = this.getOrComputeMRO(name); // 这里走之前的 MRO 缓存
            chain.forEach(k => finalSet.add(k));
        });

        const entries = Array.from(finalSet).map(k => this.storage.get(k)!);

        // 3. 如果传入了 ctor，存入类级缓存
        if (ctor) {
            this._classResolvedCache.set(ctor, entries);
        }

        return entries;
    }
    private getOrComputeMRO(name: string, stack = new Set<string>()): string[] {
        // 缓存命中
        if (this._mroCache.has(name)) return this._mroCache.get(name)!;

        // 循环检测
        if (stack.has(name))
            throw new Error(
                `[Registrar] Circular dependency: ${Array.from(stack).join(' -> ')} -> ${name}`
            );

        const entry = this.storage.get(name);
        if (!entry) throw new Error(`[Registrar] Ability "${name}" is not registered yet.`);

        stack.add(name);
        const sequence: string[] = [];

        // 递归合并依赖项
        if (entry.deps) {
            entry.deps.forEach(depName => {
                const depChain = this.getOrComputeMRO(depName, stack);
                depChain.forEach(k => {
                    if (!sequence.includes(k)) sequence.push(k);
                });
            });
        }

        // 把自己加在后面（原子依赖在前，高级功能在后）
        if (!sequence.includes(name)) sequence.push(name);

        stack.delete(name);
        this._mroCache.set(name, sequence); // 存入缓存
        return sequence;
    }

    hasClassCache(ctor: Function){
        return this._classResolvedCache.has(ctor);
    }

    getClassCache(ctor: Function){
        return this._classResolvedCache.get(ctor) || [];
    }

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
