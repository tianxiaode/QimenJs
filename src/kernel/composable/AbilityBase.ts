import { IComposable, AbilityHostBase, IExposeResult } from '../types';

/**
 * Ability 抽象基类：封装通用的宿主管理逻辑
 * 
 * @template T - 宿主类型，必须实现 IComposableBase 接口
 */
export abstract class AbilityBase<T extends AbilityHostBase> implements IComposable {
    /**
     * 宿主对象的引用
     * @private
     */
    protected host: T = null as any;

    /**
     * 记录当前 Ability 注入到 host 上的所有属性/方法名
     * @private
     */
    private _injectedKeys: (string | symbol)[] = [];

    /**
     * 存储每个宿主对象上各个键对应的 Ability 名称的弱映射
     * @private
     */
    private static ownerMap = new WeakMap<object, Map<string | symbol, string>>();

    /**
     * 将能力附加到宿主对象
     * 
     * @param host - 要附加到的宿主对象
     */
    public attach(host: T): void {
        this.host = host;
        // 自动注入声明的属性
        const props = this.expose();
        if (props) {
            this.mountProperties(props);
        }
    }

    /**
     * 挂载属性到宿主对象
     * 
     * @param props - 要挂载到宿主对象的属性集合
     * @private
     */
    private mountProperties(props: Record<string | symbol, any>) {
        const keys = [...Object.keys(props), ...Object.getOwnPropertySymbols(props)];

        keys.forEach(key => {
            // 冲突检查逻辑 (使用 key in this.host)
            this.trackConflict(key);

            const value = props[key as any];
            const descriptor = this.makeDescriptor(value);

            Object.defineProperty(this.host, key, {
                ...descriptor,
                configurable: true,
                enumerable: true,
            });
            this._injectedKeys.push(key);
        });
    }

    /**
     * 跟踪属性冲突并记录警告或错误日志
     * 
     * @param key - 要检查冲突的属性键
     * @private
     */
    private trackConflict(key: string | symbol) {
        const keyName = String(key);
        const hostOwners = AbilityBase.ownerMap.get(this.host);
        const hasKey = key in this.host;

        if (hasKey) {
            const previousAbility = hostOwners?.get(key);

            if (previousAbility) {
                // 场景 1：能力 vs 能力 (Ability Composition)
                this.host.logger.warn(
                    `[Ability Conflict] Composition Error: \n` +
                        `Property: "${keyName}" \n` +
                        `Current Ability: [${this.constructor.name}] \n` +
                        `Previously Exposed by: [${previousAbility}] \n` +
                        `Result: The previous implementation is now hidden. Ensure the loading order of abilities is correct.`
                );
            } else {
                // 场景 2：能力 vs 宿主原型 (Prototype Shadowing)
                // 检查这个 key 是不是在 Host 实例上，还是在更深的原型链上
                const isOwnProp = Object.prototype.hasOwnProperty.call(this.host, key);
                const source = isOwnProp ? 'Instance' : 'Class Prototype';

                this.host.logger.error(
                    `[Security Violation] Ability [${this.constructor.name}] is shadowing a ${source} member: \n` +
                        `Property: "${keyName}" \n` +
                        `Host Class: [${this.host.constructor.name}] \n` +
                        `Impact: This will bypass the original method logic in the Entity class. \n` +
                        `Recommendation: Rename the ability property or use "applyOverrides()" to extend the base method.`
                );
            }
        }
        
        // 更新宿主的拥有者映射
        if (!hostOwners) {
            AbilityBase.ownerMap.set(this.host, new Map());
        }
        const currentHostOwners = AbilityBase.ownerMap.get(this.host)!;
        currentHostOwners.set(key, this.constructor.name);
    }

    /**
     * 创建属性描述符
     * 
     * @param value - 属性值
     * @returns 属性描述符对象
     * @private
     */
    private makeDescriptor(value: any): PropertyDescriptor {
        let descriptor: PropertyDescriptor;
        if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
            descriptor = {
                ...value,
                configurable: true,
                enumerable: true,
            };
        } else {
            // 普通值或函数
            descriptor = {
                value: typeof value === 'function' ? value.bind(this.host) : value,
                writable: true,
                configurable: true,
                enumerable: true,
            };
        }
        return descriptor;
    }

    /**
     * 销毁能力实例，清理注入到宿主对象的属性
     */
    public dispose(): void {
        if (this.host) {
            this.onDispose();

            // 清理 host 上的注入
            const hostOwners = AbilityBase.ownerMap.get(this.host);
            this._injectedKeys.forEach(key => {
                delete (this.host as any)[key];
                // 同时从记录表中移除
                hostOwners?.delete(key);
            });

            this._injectedKeys = [];
            this.host = null as any;
        }
    }

    /**
     * 抽象方法，子类需要实现此方法返回要暴露给宿主对象的属性
     * 
     * @returns 要暴露给宿主对象的属性对象
     */
    protected abstract expose(): IExposeResult;

    /**
     * 可选的清理方法，子类可以重写此方法执行自定义清理操作
     * 
     * @protected
     */
    protected onDispose(): void {} // 变成可选
}