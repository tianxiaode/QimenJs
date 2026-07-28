/**
 * ComponentRegistrar — 组件注册器
 *
 * 统一管理组件类型注册和组件元数据注册，复用 RegistrarBase 模式。
 *
 * 元数据注册：通过 registerMeta 注册组件元数据（defaultEventData 等）。
 * 类型注册：通过 register 注册组件类型到组件类的映射。
 *
 * @example
 * ```ts
 * const registrar = ComponentRegistrar.getInstance();
 *
 * // 元数据注册
 * registrar.registerMeta('Button', { defaultEventData: ['name', 'text'] });
 *
 * // 类型注册
 * registrar.register('Button', ButtonComponent);
 *
 * // 获取元数据
 * const meta = registrar.getMeta('Button');
 * // meta.defaultEventData → ['name', 'text']
 * ```
 */

import { RegistrarBase } from '@qimenjs/registry';

/**
 * 组件元数据 — 注册到组件类型上的声明式配置
 *
 * 用于事件系统中自动合并 defaultEventData 到事件数据中。
 */
export interface ComponentMeta {
    /** 默认事件数据字段 — 组件注册时声明的基础字段 */
    defaultEventData?: string[];
    /** 允许自定义扩展字段 */
    [key: string]: any;
}

/**
 * 组件定义
 */
export interface ComponentDefinition {
    /** 组件类型标识 */
    type: string;
    /** 组件类 */
    component: new (props?: Record<string, any>) => any;
}

/**
 * 组件注册器
 *
 * 管理 type → ComponentClass 的映射 + type → ComponentMeta 的映射
 */
export class ComponentRegistrar extends RegistrarBase<Map<string, ComponentDefinition>> {
    readonly name = 'component';

    /** 类型 → 组件类映射 */
    protected storage: Map<string, ComponentDefinition> = new Map();

    /** 类型 → 元数据映射 */
    private readonly metaStorage: Map<string, ComponentMeta> = new Map();

    /**
     * 注册组件定义
     */
    register(definition: ComponentDefinition): void;
    register(type: string, component: new (props?: Record<string, any>) => any): void;
    register(arg1: any, arg2?: any): void {
        this.checkLock();
        const type = typeof arg1 === 'string' ? arg1 : arg1.type;
        const component = typeof arg1 === 'string' ? arg2 : arg1.component;
        this.storage.set(type, { type, component });
    }

    /**
     * 注册组件元数据
     *
     * @param type - 组件类型标识
     * @param meta - 组件元数据
     */
    registerMeta(type: string, meta: ComponentMeta): void {
        this.checkLock();
        this.metaStorage.set(type, { ...meta });
    }

    /**
     * 获取组件元数据
     *
     * @param type - 组件类型标识
     * @returns 组件元数据，未找到返回 undefined
     */
    getMeta(type: string): ComponentMeta | undefined {
        return this.metaStorage.get(type);
    }

    /**
     * 获取组件类
     *
     * @param type - 组件类型标识
     * @returns 组件类，未找到返回 undefined
     */
    get(type: string): (new (props?: Record<string, any>) => any) | undefined {
        return this.storage.get(type)?.component;
    }

    /**
     * 获取组件定义
     *
     * @param type - 组件类型标识
     * @returns 组件定义，未找到返回 undefined
     */
    getDefinition(type: string): ComponentDefinition | undefined {
        return this.storage.get(type);
    }

    /**
     * 判断组件类型是否已注册
     */
    has(type: string): boolean {
        return this.storage.has(type) || this.metaStorage.has(type);
    }

    /**
     * 注销组件类型
     */
    unregister(type: string): void {
        this.checkLock();
        this.storage.delete(type);
        this.metaStorage.delete(type);
    }

    /**
     * 获取所有已注册的组件名称
     */
    names(): string[] {
        const set = new Set<string>();
        for (const key of this.storage.keys()) set.add(key);
        for (const key of this.metaStorage.keys()) set.add(key);
        return Array.from(set);
    }

    /**
     * 清空所有注册
     */
    clear(): void {
        this.checkLock();
        this.storage.clear();
        this.metaStorage.clear();
    }

    /**
     * 输出注册器状态信息
     */
    protected doInspect(): void {
        const names = this.names();
        console.log(`📦 ComponentRegistrar: ${names.length} components registered`);
        for (const name of names) {
            const meta = this.metaStorage.get(name);
            const hasType = this.storage.has(name);
            console.log(`  - ${name} [type:${hasType} meta:${!!meta}]`);
        }
    }
}

/**
 * 便捷全局方法 - 根据 id 获取组件实例
 */
export function getCmp(id: string): any | undefined {
    return ComponentRegistrar.getInstance().get(id);
}