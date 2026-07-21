/**
 * 组件注册器
 *
 * 管理组件类型注册，复用 RegistrarBase 模式。
 * 通过 type 注册和获取组件定义（组件类）。
 *
 * @example
 * ```typescript
 * const registrar = ComponentRegistrar.getInstance();
 *
 * registrar.register('Button', ButtonComponent);
 * const ButtonClass = registrar.get('Button');
 * ```
 */

import { RegistrarBase } from '@qimenjs/registry';

/**
 * 组件注册器
 *
 * 管理 type → ComponentClass 的映射
 */
export class ComponentRegistrar extends RegistrarBase<
    Map<string, new (props?: Record<string, any>) => any>
> {
    public readonly name = 'component';
    protected storage = new Map<string, new (props?: Record<string, any>) => any>();

    /**
     * 注册组件类
     */
    register(type: string, component: new (props?: Record<string, any>) => any): void {
        this.checkLock();

        if (this.storage.has(type)) {
            const existing = this.storage.get(type)!;
            this.logger.warn(
                `type "${type}" already registered by ${existing.name}, ` +
                    `overwriting with ${component.name}`
            );
        }

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

    // ─── 调试 ──

    protected doInspect(): void {
        const data: Record<string, string> = {};
        this.storage.forEach((component, type) => {
            data[type] = component.name || 'Anonymous';
        });
        console.table(data);
    }
}
