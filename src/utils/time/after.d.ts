import type { Cancelable } from './types';
/**
 * 在指定延迟时间后执行回调函数，返回一个可取消的对象
 *
 * @param delay - 延迟执行的时间（毫秒）
 * @param callback - 延迟时间结束后要执行的回调函数
 * @returns 一个包含cancel和isActive方法的Cancelable对象
 */
export declare function after(delay: number, callback: () => void): Cancelable;
//# sourceMappingURL=after.d.ts.map