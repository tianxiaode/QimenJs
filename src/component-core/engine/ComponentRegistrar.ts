/**
 * ComponentRegistrar — 组件注册管理器
 *
 * 单例注册表，管理组件类与模板的注册和查询。
 * 提供 register / get / has / clear 等接口供运行时创建组件实例。
 */
export class ComponentRegistrar {
    private static instances = new Map<string, ComponentRegistrar>();
    private _map = new Map<string, { cls: any; tpl: any }>();

    static getInstance(): ComponentRegistrar {
        const key = this.name;
        if (!ComponentRegistrar.instances.has(key)) {
            ComponentRegistrar.instances.set(key, new ComponentRegistrar());
        }
        return ComponentRegistrar.instances.get(key) as ComponentRegistrar;
    }

    register(cls: any, tpl?: any): void {
        this._map.set(cls.type || cls.name, { cls, tpl });
    }

    has(name: string): boolean {
        return this._map.has(name);
    }

    get(name: string): any {
        return this._map.get(name)?.cls;
    }

    getTemplate(name: string): any {
        return this._map.get(name)?.tpl;
    }

    clear(): void {
        this._map.clear();
    }
}
