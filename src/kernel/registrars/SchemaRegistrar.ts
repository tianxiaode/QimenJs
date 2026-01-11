import { RegistrarBase } from '@orbitjs/registry';
import { RegistrSchema, FieldDefinition } from '../types';

export const SchemaRegistrarName = 'schema';

export class SchemaRegistrar extends RegistrarBase<any> {
    public readonly name = SchemaRegistrarName;

    // 内部划分两个私有仓库
    private schemaStorage = new Map<string, RegistrSchema>();
    private fieldStorage = new Map<string, FieldDefinition[]>();

    // 必须实现基类的 storage（可以指向主仓库或仅作为占位）
    protected storage = this.schemaStorage;

    /**
     * 统一注册入口
     */
    register(name: string, fields: FieldDefinition[]): void; // 注册字段组
    register(entry: FieldDefinition[]): void; // 注册实体
    register(arg1: any, arg2?: any): void {
        this.checkLock();

        if (typeof arg1 === 'string' && Array.isArray(arg2)) {
            // 类型 A: 字段库注册
            this.fieldStorage.set(arg1, arg2);
        } else {
            // 类型 B: 实体注册
            const entry = arg1 as RegistrSchema;
            this.schemaStorage.set(entry.name, entry);
        }
    }

    /**
     * 删除注册项
     */
    unregister(id: string): void {
        this.checkLock();
        this.schemaStorage.delete(id);
        this.fieldStorage.delete(id);
    }

    /**
     * 获取逻辑：默认获取实体，可指定类型
     */
    get<T = RegistrSchema>(name: string, type: 'schema' | 'field' = 'schema'): T {
        if (type === 'field') {
            return this.fieldStorage.get(name) as any;
        }

        const entry = this.schemaStorage.get(name);
        return entry as any;
    }

    /**
     * 专门获取字段的快捷接口
     */
    getField(groupName: string): FieldDefinition[] {
        return this.get(groupName, 'field');
    }

    clear(): void {
        this.checkLock();
        this.schemaStorage.clear();
        this.fieldStorage.clear();
    }

    /**
     * 输出内部状态
     */
    protected doInspect(): void {
        console.log('%c--- Field Templates ---', 'color: #4CAF50; font-weight: bold');
        console.table(Object.fromEntries(this.fieldStorage));

        console.log('%c--- Business Entities ---', 'color: #2196F3; font-weight: bold');
        console.table(Array.from(this.schemaStorage.values()));
    }
}

declare module '@orbitjs/registry' {
    interface Registrars {
        [SchemaRegistrarName]: typeof SchemaRegistrar;
    }
}
