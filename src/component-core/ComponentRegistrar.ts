/**
 * 组件注册器
 *
 * 统一管理组件类型注册和组件实例注册，复用 RegistrarBase 模式。
 *
 * 类型注册：通过 type 注册和获取组件定义（组件类）。
 * 实例注册：组件创建时自动注册（按 id 或 cid），销毁时自动移除。
 *
 * @example
 * ```typescript
 * const registrar = ComponentRegistrar.getInstance();
 *
 * // 类型注册
 * registrar.register({ type: ComponentTypes.BUTTON, component: ButtonComponent });
 * const ButtonClass = registrar.get(ComponentTypes.BUTTON);
 *
 * // 实例查找
 * const table = registrar.getInstance('userTable'); // 按 id 查找
 * const comp = registrar.getInstance('q-comp-1234567890-1'); // 按 cid 查找
 * ```
 */

import { RegistrarBase } from '@qimenjs/registry';
import type { TemplateComponent } from './TemplateComponent';
import { EventSourceRegistrar } from '@qimenjs/events';

/**
 * 组件定义
 */
export interface ComponentDefinition {
    /** 组件类型标识 */
    type: string;
    /** 组件类（withTemplate 强类或直接继承 TemplateComponent 的类） */
    component: new (props?: Record<string, any>) => any;
}

/**
 * 组件注册器
 *
 * 管理 type → ComponentClass 的映射 + id/cid → 组件实例的映射
 */
export class ComponentRegistrar extends RegistrarBase<Map<string, ComponentDefinition>> {
    public readonly name = 'component';
    protected storage = new Map<string, ComponentDefinition>();

    // ─── 实例管理存储 ──

    /** id → 组件实例映射 */
    private readonly byId = new Map<string, TemplateComponent>();

    /** cid → 组件实例映射 */
    private readonly byCid = new Map<string, TemplateComponent>();

    // ─── 类型注册 ──

    /**
     * 注册组件定义
     *
     * @param definition - 组件定义，包含 type 和 component 类
     */
    register(definition: ComponentDefinition): void;
    register(type: string, component: new (props?: Record<string, any>) => any): void;
    register(
        typeOrDef: string | ComponentDefinition,
        component?: new (props?: Record<string, any>) => any
    ): void {
        this.checkLock();

        const def: ComponentDefinition =
            typeof typeOrDef === 'string' ? { type: typeOrDef, component: component! } : typeOrDef;

        if (
            typeof (def.component as any)._compilePendingTemplate === 'function' &&
            !(def.component as any)._templateCompiled
        ) {
            (def.component as any)._compilePendingTemplate();
        }

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
    get(type: string): (new (props?: Record<string, any>) => any) | undefined {
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

    // ─── 实例管理 ──

    /**
     * 注册组件实例（组件创建时自动调用）
     *
     * 注册 cid（必有）和 id（可选）。
     * id 重复时覆盖并 console.warn 提示。
     * 注册 id 时同步注册到 EventSourceRegistrar。
     *
     * @param component - 组件实例
     */
    registerInstance(component: TemplateComponent): void {
        // 注册 cid（必有）
        this.byCid.set(component.cid, component);

        // 注册 id（可选）
        if (component.id) {
            const existing = this.byId.get(component.id);
            if (existing && existing !== component) {
                console.warn(
                    `ComponentRegistrar: id "${component.id}" already registered by ${existing.constructor.name}, ` +
                        `overwriting with ${component.constructor.name}`
                );
            }
            this.byId.set(component.id, component);

            // 同步注册到 EventSourceRegistrar
            EventSourceRegistrar.getInstance().register(component.id, component);
        }
    }

    /**
     * 注销组件实例（组件销毁时自动调用）
     *
     * @param component - 组件实例
     */
    unregisterInstance(component: TemplateComponent): void {
        this.byCid.delete(component.cid);

        if (component.id) {
            this.byId.delete(component.id);

            // 同步从 EventSourceRegistrar 注销
            EventSourceRegistrar.getInstance().unregister(component.id);
        }
    }

    /**
     * 根据 id 或 cid 精确查找组件实例
     *
     * id 优先查找，找不到再查 cid
     *
     * @param idOrCid - 组件 id 或 cid
     * @returns 组件实例，未找到返回 undefined
     */
    getInstance(idOrCid: string): TemplateComponent | undefined {
        // id 优先查找
        const byId = this.byId.get(idOrCid);
        if (byId) return byId;
        // 找不到再查 cid
        return this.byCid.get(idOrCid);
    }

    /**
     * 获取所有已注册的组件实例（调试用）
     */
    getAllInstances(): TemplateComponent[] {
        return [...this.byCid.values()];
    }

    /**
     * 获取已注册的组件实例数量
     */
    get instanceCount(): number {
        return this.byCid.size;
    }

    // ─── 调试 ──

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

/**
 * 便捷全局方法 - 根据 id 获取组件实例
 *
 * @param id - 组件 id 或 cid
 * @returns 组件实例，未找到返回 undefined
 */
export const getCmp = (id: string): TemplateComponent | undefined => {
    return ComponentRegistrar.getInstance().getInstance(id);
};
