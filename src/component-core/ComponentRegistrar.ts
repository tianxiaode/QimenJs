import { RegistrarBase } from '@/registry';
import type { ComponentClass } from './types';

/**
 * ComponentRegistrar — 组件注册表
 *
 * 单例注册表，按类型名注册组件构造器，供运行时按 type 字符串解析组件类。
 * 用于打破「能力 ↔ 组件」之间的循环依赖：
 * 组件在自身模块加载时 register，能力在运行时 getByType 获取。
 */
export class ComponentRegistrar extends RegistrarBase<Map<string, ComponentClass>> {
    public readonly name = 'ComponentRegistrar';

    protected storage = new Map<string, ComponentClass>();

    register(component: ComponentClass): this {
        this.checkLock();
        const type = (component as any).type ?? (component as any).name;
        this.storage.set(type, component);
        return this;
    }

    unregister(type: string): void {
        this.checkLock();
        this.storage.delete(type);
    }

    get(type: string): ComponentClass | undefined {
        return this.storage.get(type);
    }

    getByType(type: string): ComponentClass | undefined {
        return this.get(type);
    }

    protected doInspect(): void {
        for (const type of this.storage.keys()) {
            console.log(`${type}:`, this.storage.get(type) ?? 'undefined');
        }
    }
}
