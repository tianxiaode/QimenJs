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
 * registrar.register('Button', ButtonComponent);
 * const ButtonClass = registrar.get('Button');
 *
 * const table = registrar.getInstance('userTable');
 * ```
 */

import { RegistrarBase } from '@qimenjs/registry';
import type { TemplateComponent } from './TemplateComponent';
import { EventSourceRegistrar } from '@qimenjs/events';

/**
 * 组件注册器
 *
 * 管理 type → ComponentClass 的映射 + id/cid → 组件实例的映射
 */
export class ComponentRegistrar extends RegistrarBase<
    Map<string, new (props?: Record<string, any>) => any>
> {
    public readonly name = 'component';
    protected storage = new Map<string, new (props?: Record<string, any>) => any>();

    // ─── 实例管理存储 ──

    /** id → 组件实例映射 */
    private readonly byId = new Map<string, TemplateComponent>();

    /** cid → 组件实例映射 */
    private readonly byCid = new Map<string, TemplateComponent>();

    // ─── 类型注册 ──

    /**
     * 注册组件类
     */
    register(type: string, component: new (props?: Record<string, any>) => any): void {
        this.checkLock();

        if (
            typeof (component as any)._compilePendingTemplate === 'function' &&
            !(component as any)._templateCompiled
        ) {
            (component as any)._compilePendingTemplate();
        }

        this.storage.set(type, component);
    }

    /**
     * 注销组件类
     */
    unregister(type: string): void {
        this.checkLock();
        this.storage.delete(type);
    }

    /**
     * 获取组件类
     */
    get(type: string): (new (props?: Record<string, any>) => any) | undefined {
        return this.storage.get(type);
    }

    /**
     * 判断组件类型是否已注册
     */
    has(type: string): boolean {
        return this.storage.has(type);
    }

    /**
     * 获取所有已注册的组件类
     */
    getAll(): (new (props?: Record<string, any>) => any)[] {
        return [...this.storage.values()];
    }

    // ─── 实例管理 ──

    /**
     * 注册组件实例（组件创建时自动调用）
     *
     * 注册 cid（必有）和 id（可选）。
     * id 重复时覆盖并 console.warn 提示。
     */
    registerInstance(component: TemplateComponent): void {
        this.byCid.set(component.cid, component);

        if (component.id) {
            const existing = this.byId.get(component.id);
            if (existing && existing !== component) {
                console.warn(
                    `ComponentRegistrar: id "${component.id}" already registered by ${existing.constructor.name}, ` +
                        `overwriting with ${component.constructor.name}`
                );
            }
            this.byId.set(component.id, component);

            EventSourceRegistrar.getInstance().register(component.id, component);
        }
    }

    /**
     * 注销组件实例（组件销毁时自动调用）
     */
    unregisterInstance(component: TemplateComponent): void {
        this.byCid.delete(component.cid);

        if (component.id) {
            this.byId.delete(component.id);
            EventSourceRegistrar.getInstance().unregister(component.id);
        }
    }

    /**
     * 根据 id 或 cid 精确查找组件实例
     *
     * id 优先查找，找不到再查 cid
     */
    getInstance(idOrCid: string): TemplateComponent | undefined {
        const byId = this.byId.get(idOrCid);
        if (byId) return byId;
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

    protected doInspect(): void {
        const data: Record<string, string> = {};
        this.storage.forEach((component, type) => {
            data[type] = component.name || 'Anonymous';
        });
        console.table(data);
    }
}

/**
 * 便捷全局方法 - 根据 id 获取组件实例
 */
export const getCmp = (id: string): TemplateComponent | undefined => {
    return ComponentRegistrar.getInstance().getInstance(id);
};
