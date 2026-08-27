import { RegistrarBase } from '@qimenjs/registry';
import { IOptionHandler } from './types';

/**
 * 选项处理器注册器
 *
 * 两层注册：
 * - register()：普通选项处理器（按 handler.name 查找）
 * - registerTargetHandler()：target-to 子处理器（按 to 值查找）
 */
export class OptionHandlerRegistrar extends RegistrarBase<Map<string, IOptionHandler>> {
    public readonly name = 'OptionHandlerRegistrar';

    protected storage: Map<string, IOptionHandler> = new Map();
    private _targetMap = new Map<string, IOptionHandler>();

    register(handler: IOptionHandler): this {
        this.checkLock();
        this.storage.set(handler.name, handler);
        return this;
    }

    unregister(name: string) {
        this.checkLock();
        this.storage.delete(name);
    }

    get(name: string): IOptionHandler | undefined {
        return this.storage.get(name);
    }

    /**
     * 注册 target-to 子处理器
     */
    registerTargetHandler(key: string, fn: IOptionHandler): this {
        this.checkLock();
        this._targetMap.set(key, fn);
        return this;
    }

    /**
     * 获取 target-to 子处理器
     */
    getTargetHandler(key: string): IOptionHandler | undefined {
        return this._targetMap.get(key);
    }

    clear(): void {
        this.checkLock();
        this.storage.clear();
        this._targetMap.clear();
    }

    protected doInspect(): void {
        for (const [key, handlers] of this.storage) {
            console.group(`Key: ${key} (handlers)`);
            console.log(handlers);
            console.groupEnd();
        }
        for (const [key, fn] of this._targetMap) {
            console.group(`TargetTo: ${key}`);
            console.log(fn);
            console.groupEnd();
        }
    }
}
