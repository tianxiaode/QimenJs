export abstract class RegistrarBase<M = any> {
    private static instances = new Map<any, any>();

    // 简化为 name，子类必须定义，如 'system', 'html'
    public abstract readonly name: string;

    protected isLocked = false;
    protected abstract storage: M;

    static getInstance<T extends RegistrarBase<any>>(this: new () => T): T {
        const constructor = this as any;
        if (!RegistrarBase.instances.has(constructor)) {
            RegistrarBase.instances.set(constructor, new this());
        }
        return RegistrarBase.instances.get(constructor) as T;
    }

    /** 统一锁检查 */
    protected checkLock(): void {
        if (this.isLocked) {
            throw new Error(`[Registrar: ${this.name}] modification denied: Locked.`);
        }
    }

    lock(): void {
        this.isLocked = true;
    }

    /** 增强型通用清理 */
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

    /** 基类负责打印外壳 */
    inspect(): void {
        console.group(`🔍 Registrar: ${this.name} [${this.isLocked ? '🔒' : '🔓'}]`);
        this.doInspect(); // 子类只负责核心数据的呈现方式
        console.groupEnd();
    }

    // 核心契约
    abstract register(...args: any[]): void;
    abstract unregister(id: string): void;
    abstract get(...args: any[]): any;
    protected abstract doInspect(): void; // 子类实现具体的打印逻辑
}
