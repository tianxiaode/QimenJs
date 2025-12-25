/**
 * 使用自定义比较函数对数组进行排序
 * @template T 数组元素类型
 * @param {T[]} arr 要排序的数组
 * @param {(a: T, b: T) => number} compareFn 比较函数，接收两个参数，返回数字表示比较结果
 * @returns {T[]} 返回排序后的新数组，不修改原数组
 */
export function sortWith<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
    // 返回新数组，不修改原数组
    return [...arr].sort(compareFn);
}