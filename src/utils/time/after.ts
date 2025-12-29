import type { Cancelable } from './types';

/**
 * 在指定延迟时间后执行回调函数，返回一个可取消的对象
 * 
 * @param delay - 延迟执行的时间（毫秒）
 * @param callback - 延迟时间结束后要执行的回调函数
 * @returns 一个包含cancel和isActive方法的Cancelable对象
 */
export function after(delay: number, callback: () => void): Cancelable {
    let active = true;

    const id = setTimeout(
        () => {
            if (!active) return;
            callback();
            active = false;
        },
        Math.max(0, delay)
    );

    return {
        /**
         * 取消函数执行
         */
        cancel() {
            if (!active) return;
            active = false;
            clearTimeout(id);
        },
        
        /**
         * 检查函数是否仍处于活跃状态（未执行且未被取消）
         * @returns 如果函数仍在等待执行则返回true，否则返回false
         */
        isActive() {
            return active;
        },
    };
}