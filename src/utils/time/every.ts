import type { Cancelable } from './types';

/**
 * 按照指定的时间间隔重复执行回调函数，返回一个可取消的对象
 * 
 * @param interval - 执行回调函数的时间间隔（毫秒）
 * @param callback - 需要重复执行的回调函数
 * @returns 一个包含cancel和isActive方法的Cancelable对象
 */
export function every(interval: number, callback: () => void): Cancelable {
    let active = true;

    const id = setInterval(
        () => {
            if (!active) return;
            callback();
        },
        Math.max(0, interval)
    );

    return {
        /**
         * 取消重复执行
         */
        cancel() {
            if (!active) return;
            active = false;
            clearInterval(id);
        },
        
        /**
         * 检查重复执行是否仍处于活跃状态
         * @returns 如果仍在重复执行则返回true，否则返回false
         */
        isActive() {
            return active;
        },
    };
}