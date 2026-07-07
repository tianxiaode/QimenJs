/**
 * 组件注册器
 *
 * 管理组件类型的注册和获取，复用 RegistrarBase 模式。
 * 通过 type 注册和获取组件定义（组件类）。
 *
 * @example
 * ```typescript
 * const registrar = ComponentRegistrar.getInstance();
 * registrar.register({ type: ComponentTypes.BUTTON, component: ButtonComponent });
 * const ButtonClass = registrar.get(ComponentTypes.BUTTON);
 * ```
 */

import { RegistrarBase } from '@qimenjs/registry';
import type { ComponentBase } from './ComponentBase';

/**
 * 组件定义
 */
export interface ComponentDefinition {
    /** 组件类型标识 */
    type: string;
    /** 组件类 */
    component: new (props?: Record<string, any>) => ComponentBase;
}

/**
 * 组件注册器
 *
 * 管理 type → ComponentClass 的映射
 */
export class ComponentRegistrar extends RegistrarBase<Map<string, ComponentDefinition>> {
    public readonly name = 'component';
    protected storage = new Map<string, ComponentDefinition>();

    /**
     * 注册组件定义
     *
     * @param definition - 组件定义，包含 type 和 component 类
     */
    register(definition: ComponentDefinition): void;
    register(type: string, component: new (props?: Record<string, any>) => ComponentBase): void;
    register(typeOrDef: string | ComponentDefinition, component?: new (props?: Record<string, any>) => ComponentBase): void {
        this.checkLock();

        const def: ComponentDefinition = typeof typeOrDef === 'string'
            ? { type: typeOrDef, component: component! }
            : typeOrDef;

        this.storage.set(def.type, def);
    }

    /**
     * 注销组件定义
     *
     * @param type - 组件类型标识
     */
    unregister(type: string): void {
        this.checkLock();
        this.storage.delete(type);
    }

    /**
     * 获取组件类
     *
     * @param type - 组件类型标识
     * @returns 组件类，未找到返回 undefined
     */
    get(type: string): (new (props?: Record<string, any>) => ComponentBase) | undefined {
        const def = this.storage.get(type);
        return def?.component;
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
     *
     * @param type - 组件类型标识
     * @returns 是否已注册
     */
    has(type: string): boolean {
        return this.storage.has(type);
    }

    /**
     * 获取所有已注册的组件定义
     */
    getAll(): ComponentDefinition[] {
        return [...this.storage.values()];
    }

    /**
     * 输出注册器状态信息
     */
    protected doInspect(): void {
        const data: Record<string, string> = {};
        this.storage.forEach((def, type) => {
            data[type] = def.component.name || 'Anonymous';
        });
        console.table(data);
    }
}
