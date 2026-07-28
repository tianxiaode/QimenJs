/**
 * ComponentRegistrar — 组件注册器
 *
 * 管理组件类的注册和元数据存储。
 * 主要用于：
 *   1. 存储组件类的元数据（如 defaultEventData）
 *   2. 支持事件引擎获取组件的默认事件数据
 *
 * @example
 * ```ts
 * const registrar = ComponentRegistrar.getInstance();
 * registrar.registerMeta('Button', { defaultEventData: ['label', 'value'] });
 * const meta = registrar.getMeta('Button');
 * console.log(meta?.defaultEventData); // ['label', 'value']
 * ```
 */

import { RegistrarBase } from '@/registry/registrars/RegistrarBase';

/**
 * 组件元数据接口
 */
export interface ComponentMeta {
    /**
     * 默认事件数据字段列表
     * 在事件分发时，这些字段会自动从组件实例收集并添加到事件载荷中
     */
    defaultEventData?: string[];

    /**
     * 其他自定义元数据字段
     */
    [key: string]: any;
}

interface ComponentStorage {
    entries: Map<string, ComponentMeta>;
}

/**
 * 组件注册器
 *
 * 继承自 RegistrarBase，提供组件元数据的注册和查询功能。
 * 采用单例模式，确保全局唯一实例。
 */
export class ComponentRegistrar extends RegistrarBase<ComponentStorage> {
    public readonly name = 'component';

    protected storage: ComponentStorage = {
        entries: new Map(),
    };

    /**
     * 注册组件元数据
     *
     * 将组件的元数据注册到注册表中，供运行时使用。
     *
     * @param componentName - 组件名称/类型标识
     * @param meta - 组件元数据对象
     *
     * @example
     * ```ts
     * registrar.registerMeta('Button', {
     *   defaultEventData: ['label', 'value', 'disabled']
     * });
     * ```
     */
    registerMeta(componentName: string, meta: ComponentMeta): void {
        this.storage.entries.set(componentName, meta);
    }

    /**
     * 获取组件元数据
     *
     * 查询指定组件的元数据信息。
     *
     * @param componentName - 组件名称/类型标识
     * @returns 组件元数据对象，如果组件未注册则返回 undefined
     *
     * @example
     * ```ts
     * const meta = registrar.getMeta('Button');
     * if (meta?.defaultEventData) {
     *   // 使用默认事件数据字段
     * }
     * ```
     */
    getMeta(componentName: string): ComponentMeta | undefined {
        return this.storage.entries.get(componentName);
    }

    /**
     * 检查组件是否已注册
     *
     * @param componentName - 组件名称/类型标识
     * @returns 如果组件已注册返回 true，否则返回 false
     */
    has(componentName: string): boolean {
        return this.storage.entries.has(componentName);
    }

    /**
     * 注销组件
     *
     * 从注册表中移除组件的元数据。
     *
     * @param componentName - 组件名称/类型标识
     */
    unregister(componentName: string): void {
        this.storage.entries.delete(componentName);
    }

    /**
     * 获取所有已注册的组件名称
     *
     * @returns 组件名称数组
     */
    names(): string[] {
        return Array.from(this.storage.entries.keys());
    }

    /**
     * 清空所有注册的组件
     */
    clear(): void {
        this.storage.entries.clear();
    }

    /**
     * 获取注册表信息
     */
    protected doInspect(): Record<string, any> {
        const entries: Record<string, ComponentMeta> = {};
        this.storage.entries.forEach((meta, name) => {
            entries[name] = meta;
        });
        return {
            count: this.storage.entries.size,
            entries,
        };
    }
}