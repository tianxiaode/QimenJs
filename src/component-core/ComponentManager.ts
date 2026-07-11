/**
 * 组件实例管理器
 *
 * 维护所有组件实例的全局注册表。组件创建时自动注册（按 id 或 cid），
 * 销毁时自动移除。提供 get(id) 精确查找方法。
 *
 * @example
 * ```typescript
 * const mgr = ComponentManager.getInstance();
 * const table = mgr.get('userTable'); // 按 id 查找
 * const comp = mgr.get('q-comp-1234567890-1'); // 按 cid 查找
 * ```
 */

import type { TemplateComponent } from './TemplateComponent';
import { EventSourceRegistrar } from '@qimenjs/events';

/**
 * 组件实例管理器
 *
 * 单例模式，双索引（byId + byCid）
 */
export class ComponentManager {
    private static instance: ComponentManager;

    /** id → 组件实例映射 */
    private readonly byId = new Map<string, TemplateComponent>();

    /** cid → 组件实例映射 */
    private readonly byCid = new Map<string, TemplateComponent>();

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): ComponentManager {
        if (!ComponentManager.instance) {
            ComponentManager.instance = new ComponentManager();
        }
        return ComponentManager.instance;
    }

    /**
     * 注册组件实例（组件创建时自动调用）
     *
     * 注册 cid（必有）和 id（可选）。
     * id 重复时覆盖并 console.warn 提示。
     * 注册 id 时同步注册到 EventSourceRegistrar。
     *
     * @param component - 组件实例
     */
    register(component: TemplateComponent): void {
        // 注册 cid（必有）
        this.byCid.set(component.cid, component);

        // 注册 id（可选）
        if (component.id) {
            const existing = this.byId.get(component.id);
            if (existing && existing !== component) {
                console.warn(
                    `ComponentManager: id "${component.id}" already registered by ${existing.constructor.name}, ` +
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
    unregister(component: TemplateComponent): void {
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
    get(idOrCid: string): TemplateComponent | undefined {
        // id 优先查找
        const byId = this.byId.get(idOrCid);
        if (byId) return byId;
        // 找不到再查 cid
        return this.byCid.get(idOrCid);
    }

    /**
     * 获取所有已注册的组件实例（调试用）
     */
    getAll(): TemplateComponent[] {
        return [...this.byCid.values()];
    }

    /**
     * 获取已注册的组件数量
     */
    get size(): number {
        return this.byCid.size;
    }
}

/**
 * 便捷全局方法 - 根据 id 获取组件实例
 *
 * @param id - 组件 id 或 cid
 * @returns 组件实例，未找到返回 undefined
 */
export const getCmp = (id: string): TemplateComponent | undefined => {
    return ComponentManager.getInstance().get(id);
};
