import { RegistrarBase } from '@qimenjs/registry';
import { IOptionHandler } from '../types';

/**
 * 选项处理器注册器
 *
 * 继承自 RegistrarBase，使用 key 作为 map 的 key 实现精准命中
 * - 普通选项（如 'style'、'cls'）：直接按 key 查找
 * - 带 definition 的选项（如 target/to 映射）：使用 'target-to' 特殊 key
 *
 * @class OptionHandlerRegistrar
 */
export class OptionHandlerRegistrar extends RegistrarBase<Map<string, IOptionHandler>> {
    /** 注册器名称 */
    public readonly name = 'OptionHandlerRegistrar';

    /** 存储结构：key -> 处理器数组（按优先级降序） */
    protected storage: Map<string, IOptionHandler> = new Map();

    /**
     * 注册处理器
     *
     * @param handler - 处理器实例
     * @returns 返回 this 以支持链式调用
     */
    register(handler: IOptionHandler): this {
        this.checkLock();

        const key = handler.name;
        this.storage.set(key, handler);

        return this;
    }

    /**
     * 移除处理器
     *
     * @param name - 处理器名称
     * @param key - 可选的选项键名，不传则遍历所有 key 查找
     * @returns 是否成功移除
     */
    unregister(name: string) {
        this.checkLock();

        this.storage.delete(name);
    }

    /**
     * 获取指定 key 的处理器列表
     *
     * @param key - 选项键名
     * @returns 处理器数组（按优先级降序），若无则返回空数组
     */
    get(name: string): IOptionHandler | undefined {
        return this.storage.get(name);
    }

    /**
     * 清空所有处理器
     */
    clear(): void {
        this.checkLock();
        this.storage.clear();
    }

    /**
     * 实现具体的输出逻辑
     *
     * @protected
     */
    protected doInspect(): void {
        for (const [key, handlers] of this.storage) {
            console.group(`Key: ${key} (handlers)`);
            console.log(handlers);
            console.groupEnd();
        }
    }
}
