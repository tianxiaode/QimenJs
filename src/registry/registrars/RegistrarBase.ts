/**
 * 注册器基类
 * 定义了注册器的基本结构和通用操作方法
 */
export abstract class RegistrarBase<M = any> {
    /**
     * 存储所有注册器实例，确保单例模式
     * @private
     */
    private static instances = new Map<any, any>();

    /**
     * 注册器的唯一名称，子类必须实现
     */
    public abstract readonly name: string;

    /**
     * 注册器锁定状态
     * @protected
     */
    protected isLocked = false;
    
    /**
     * 存储数据的具体实现，由子类提供
     * @protected
     */
    protected abstract storage: M;

    /**
     * 获取注册器实例，确保单例模式
     * @returns 注册器实例
     */
    static getInstance<T extends RegistrarBase<any>>(this: new () => T): T {
        const constructor = this as any;
        if (!RegistrarBase.instances.has(constructor)) {
            RegistrarBase.instances.set(constructor, new this());
        }
        return RegistrarBase.instances.get(constructor) as T;
    }

    /**
     * 检查注册器是否被锁定
     * 如果已锁定则抛出错误
     * @throws Error - 当注册器被锁定时抛出
     * @protected
     */
    protected checkLock(): void {
        if (this.isLocked) {
            throw new Error(`[Registrar: ${this.name}] modification denied: Locked.`);
        }
    }

    /**
     * 锁定注册器，阻止后续修改
     */
    lock(): void {
        this.isLocked = true;
    }

    /**
     * 清空存储的数据
     * 根据存储类型的不同采用不同的清空方式
     */
    clear(): void {
        this.checkLock();
        if (!this.storage) return;

        if (typeof (this.storage as any).clear === 'function') {
            (this.storage as any).clear();
        } else if (Array.isArray(this.storage)) {
            this.storage.length = 0;
        } else if (typeof this.storage === 'object') {
            Object.keys(this.storage).forEach(key => delete (this.storage as any)[key]);
        }
    }

    /**
     * 输出注册器的当前状态信息
     * 以分组的形式输出注册器的信息
     */
    inspect(): void {
        console.group(`🔍 Registrar: ${this.name} [${this.isLocked ? '🔒' : '🔓'}]`);
        this.doInspect(); // 子类只负责核心数据的呈现方式
        console.groupEnd();
    }

    /**
     * 抽象方法：注册项目
     * 子类必须实现此方法来提供具体的注册逻辑
     * @param args - 注册参数
     */
    abstract register(...args: any[]): void;
    
    /**
     * 抽象方法：注销项目
     * 子类必须实现此方法来提供具体的注销逻辑
     * @param id - 要注销的项目的ID
     */
    abstract unregister(id: string): void;
    
    /**
     * 抽象方法：获取项目
     * 子类必须实现此方法来提供具体的数据获取逻辑
     * @param args - 获取参数
     * @returns 获取到的数据
     */
    abstract get(...args: any[]): any;
    
    /**
     * 抽象方法：实现具体的输出逻辑
     * 子类必须实现此方法来定义如何输出注册器的状态信息
     * @protected
     */
    protected abstract doInspect(): void; // 子类实现具体的打印逻辑
}