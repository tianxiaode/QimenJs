import { RegistrarBase } from '@orbitjs/registry';
import { ComposableEntry } from '../types';

export const ComposableRegistrarName = 'composable' as const;

export class ComposableRegistrar extends RegistrarBase<Map<string, ComposableEntry>> {
    public readonly name = ComposableRegistrarName;
    protected storage = new Map<string, ComposableEntry>();

    register(entry: ComposableEntry): void {
        this.checkLock();
        if (this.storage.has(entry.name)) {
            console.warn(`[ComposableRegistrar] Overwriting existing ability: ${entry.name}`);
        }
        this.storage.set(entry.name, entry);
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
