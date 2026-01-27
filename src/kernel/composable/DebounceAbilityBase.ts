import { IComposableBase } from '../types';
import { AbilityBase } from './AbilityBase';
import { debounce } from '@orbitjs/async'; 

export abstract class DebounceAbilityBase<T extends IComposableBase> extends AbilityBase<T> {
    private debouncedMap = new Map<string, any>();

    /**
     * 创建一个带缓存的防抖方法
     * @param key 唯一标识（如 action 名）
     * @param fn 原始执行逻辑
     * @param wait 延迟时间
     * @param immediate 是否立即执行
     */
    protected createDebounced<A extends (...args: any[]) => any>(
        key: string,
        fn: A,
        wait: number,
        immediate: boolean = false
    ): A {
        if (!this.debouncedMap.has(key)) {
            this.debouncedMap.set(key, debounce(fn, wait, immediate)); //
        }
        return this.debouncedMap.get(key);
    }

    public dispose() {
        // 销毁时自动清理所有定时器
        this.debouncedMap.forEach(d => d.cancel?.());
        this.debouncedMap.clear();
        super.dispose();
    }
}
