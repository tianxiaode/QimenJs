import { IComposableBase } from '../types';
import { AbilityBase } from './AbilityBase';
import { debounce } from '@orbitjs/async';

export abstract class DebounceAbilityBase<T extends IComposableBase> extends AbilityBase<T> {
    private debouncedMap = new Map<string, any>();

    protected getDebouncedAction<A extends (...args: any[]) => any>(
        key: string,
        fn: A,
        wait: number = 300,
        immediate: boolean = false
    ): A {
        if (!this.debouncedMap.has(key)) {
            // 直接包装传入的函数，记得 bind(this) 保证上下文正确
            this.debouncedMap.set(key, debounce(fn.bind(this), wait, immediate));
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
