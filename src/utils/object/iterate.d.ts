/**
 * 遍历对象的属性并执行回调函数
 *
 * 该函数会遍历对象的所有自有属性（不包括继承的属性），对每个属性执行回调函数
 * 如果回调函数返回 false，则遍历会提前终止
 *
 * @param obj 要遍历的对象
 * @param callback 回调函数，接收值和键作为参数，返回 false 可以终止遍历
 * @param scope 回调函数执行时的 this 上下文
 *
 * @example
 * const obj = { a: 1, b: 2, c: 3 };
 * each(obj, (value, key) => {
 *   console.log(key, value);
 *   if (key === 'b') return false; // 提前终止遍历
 * });
 * // 输出:
 * // a 1
 * // b 2
 */
export declare function each(obj: Record<string, any>, callback: (value: any, key: string) => boolean, scope?: any): void;
//# sourceMappingURL=iterate.d.ts.map