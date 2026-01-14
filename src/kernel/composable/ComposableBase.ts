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

    constructor() {
        // 1. 内置日志，初始化即可用
        this.logger = Logger.for(this.constructor.name);
    }

    /**
     * 自动装配方法：建议在各级构造函数的 super() 后调用
     */
    protected setupAbilities() {
        const registrar = ComposableRegistrar.getInstance();
        const ctor = this.constructor;
        let entries: ComposableEntry[];

        // 2. 优先走 Registrar 内部的“类级缓存”，避免重复爬链
        if (registrar.hasClassCache(ctor)) {
            entries = registrar.getClassCache(ctor);
        } else {
            // 3. 缓存失效或首次装载时，爬取原型链并解析 MRO
            const allKeys = this.collectFromPrototypeChain();
            entries = registrar.getRecursive(allKeys, ctor);
        }

        // 4. 增量实例化：确保不重复创建，支持多层级调用
        entries.forEach(entry => {
            if (this._loadedAbilities.has(entry.name)) return;

            try {
                const instance = new entry.ctor();
                instance.attach(this); // 注入宿主引用
                
                this._instances.push(instance);
                this._loadedAbilities.add(entry.name);
                this.logger.debug(`Ability attached: ${entry.name}`);
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