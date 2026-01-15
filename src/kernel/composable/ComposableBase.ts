import { ILogger, Logger } from '@/logger';
import { ComposableRegistrar } from '../registrars';
import { ComposableEntry, IComposable, IComposableBase } from '../types';

const ABILITIES_KEY = Symbol('__abilities__');

/**
 * 装饰器：声明该类需要的能力
 */
export function Ability(...keys: string[]) {
    return (ctor: any) => {
        ctor[ABILITIES_KEY] = keys;
    };
}

export abstract class ComposableBase implements IComposableBase {
    private _loadedAbilities = new Set<string>();
    private _instances: IComposable[] = [];
    logger: ILogger;
    [key: string]: any;

    constructor() {
        // 1. 内置日志，初始化即可用
        this.logger = Logger.for(this.constructor.name);
    }

    /**
     * 提供给子类或 Ability 使用：获取类级缓存
     */
    public getStatic<T>(key: string | symbol): T | undefined {
        const ctor = this.constructor as any;
        return ctor._static_storage_?.get(key);
    }

    /**
     * 提供给子类或 Ability 使用：设置类级缓存
     */
    public setStatic<T>(key: string | symbol, value: T): void {
        const ctor = this.constructor as any;
        if (!ctor._static_storage_) {
            Object.defineProperty(ctor, '_static_storage_', {
                value: new Map<string | symbol, any>(),
                enumerable: false,
            });
        }
        ctor._static_storage_.set(key, value);
    }

    /**
     * 自动装配方法：建议在各级构造函数的 super() 后调用
     */
    protected setupAbilities() {
        // 1. 缓存 KEY 改为描述最终的装配清单
        const CACHE_KEY = '__resolved_ability_entries__';
        let entries = this.getStatic<ComposableEntry[]>(CACHE_KEY);

        // 2. 只有第一次实例化时，执行完整的“搜刮 + 递归查找”逻辑
        if (!entries) {
            // 爬取原型链拿到所有 Key (如 ['Schema', 'Event'])
            const abilityKeys = this.collectFromPrototypeChain();

            // 去注册中心一次性换取所有的 Entry (包含 Name 和 Ctor)
            const registrar = ComposableRegistrar.getInstance();
            entries = registrar.getRecursive(abilityKeys);

            // 【关键】：将最终的 Entry 数组存入类级静态缓存
            this.setStatic(CACHE_KEY, entries);

            this.logger.debug(
                `Ability entries parsed and cached for class: ${this.constructor.name}`
            );
        }

        // 3. 增量实例化 ( entries 此时已经是现成的了 )
        entries.forEach(entry => {
            // 依然需要这个判断，防止在多层继承中 setupAbilities 被重复调用导致重复 attach
            if (this._loadedAbilities.has(entry.name)) return;

            try {
                const instance = new entry.ctor();
                instance.attach(this);
                this._instances.push(instance);
                this._loadedAbilities.add(entry.name);
            } catch (e) {
                this.logger.error(`Failed to attach ability ${entry.name}:`, e);
            }
        });
    }

    /**
     * 沿着原型链搜刮所有层级声明的 Ability Keys
     */
    private collectFromPrototypeChain(): string[] {
        const keys = new Set<string>();
        let proto = Object.getPrototypeOf(this);

        // 爬到 ComposableBase 为止
        while (proto && proto.constructor !== Object) {
            const ownKeys = (proto.constructor as any)[ABILITIES_KEY];
            if (Array.isArray(ownKeys)) {
                ownKeys.forEach(k => keys.add(k));
            }
            proto = Object.getPrototypeOf(proto);
        }
        return Array.from(keys);
    }

    /**
     * 统一销毁：按装配顺序的逆序执行
     */
    public dispose() {
        for (let i = this._instances.length - 1; i >= 0; i--) {
            const c = this._instances[i];
            try {
                c.dispose?.();
            } catch (e) {
                this.logger.error(`Dispose error in ${c.constructor.name}:`, e);
            }
        }
        this._instances = [];
        this._loadedAbilities.clear();
    }
}
