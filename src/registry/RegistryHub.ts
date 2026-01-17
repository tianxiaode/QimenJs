import { RegistryHubLockedError, RegistryHubConflictError } from './errors';
import { RegistrarBase } from './registrars';
import { Registrars } from './types';

/**
 * 注册中心Hub - 用于统一管理各种注册器
 * 提供注册、锁定、调试等功能
 */
export class RegistryHub {
    /**
     * 存储所有注册器实例
     * @private
     */
    private static readonly registars = new Map<string, RegistrarBase<any>>();;
    
    /**
     * 注册中心锁定状态
     * @private
     */
    private static isLocked = false; // 锁定状态位

    /**
     * 锁定注册中心
     * 调用后，任何对 use 的调用都会抛出错误
     * 通常在应用启动完成时调用，防止后续意外修改
     */
    static lock(): void {
        this.isLocked = true;
        this.registars.forEach(ins => {
            // 如果注册器自己也支持锁定逻辑（比如关闭 add 接口）
            ins.lock();
        });
        Object.freeze(this.registars);
    }

    /**
     * 注册子注册器
     * @param registrar - 注册器实例
     * @param force - 是否强制注册（覆盖已有注册器）
     * @returns 注册器实例
     */
    static use<T extends RegistrarBase<any>>(registrar: T, force: boolean = false): T {
        // 1. 优先检查锁定状态
        if (this.isLocked) {
            throw new RegistryHubLockedError({
                registrarName: registrar.name,
            });
        }

        const { name } = registrar;

        // 2. 冲突检查
        if (this.registars.has(name) && !force) {
            throw new RegistryHubConflictError(name);
        }

        this.registars.set(name, registrar);
        return registrar;
    }

    /**
     * 调试接口：列出注册表信息
     * @param targets - 指定注册器名，不传则列出全部
     */
    static debug(...targets:string[]): void {
        // 情况 A: 如果传了参数，就只打印指定的
        if (targets.length > 0) {
            targets.forEach(name => {
                const registar = this.registars.get(name);
                // 不做 instance 是否存在的防御，找不到就直接让它抛异常
                // 不做 inspect 是否是函数的防御，没定义就让它报错
                registar!.inspect();
            });
            return;
        }

        // 情况 B: 没传参数，打印全部
        this.registars.forEach(registar => registar.inspect());
    }

    /**
     * 根据名称安全地获取注册器实例
     * 这种方式在 doValidate 等核心逻辑中调用，不会产生循环依赖
     * @param name - 注册器名称
     * @returns 注册器实例
     */
    static get<T extends RegistrarBase<any>>(name: string): T {
        const registar = this.registars.get(name);
        return registar as T;
    }

    /**
     * 导出顶级访问代理
     * 通过代理提供对注册器的便捷访问
     */
    static readonly root = new Proxy(
        {},
        {
            get: (_, prop: string) => {
                // 直接尝试获取，如果不存在，外部调用 Registry.nonExistent.get()
                // 会因为 Registry.nonExistent 是 undefined 而立刻抛出异常
                return this.registars.get(prop);
            },
        }
    ) as Registrars;

}

/**
 * Registry - 通过Proxy提供的注册中心根访问点
 */
export const Registry = RegistryHub.root;