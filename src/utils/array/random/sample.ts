/**
 * 从数组中随机采样一个或多个元素
 * @template T 数组元素类型
 * @param {T[]} arr 需要采样的原数组
 * @param {number} [count=1] 采样元素的数量，默认为1
 * @returns {T | T[]} 如果count为1则返回单个元素，否则返回包含采样元素的数组
 */
export function sample<T>(arr: T[], count: number = 1): T | T[] {
    if (count <= 0) {
        // 如果count小于等于0，返回空数组
        return [] as T[];
    }
    
    if (count === 1) {
        // 如果只采样一个元素，直接返回随机索引位置的元素
        if (arr.length === 0) {
            return undefined as T;
        }
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Fisher-Yates 洗牌算法取前 count 个
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 返回洗牌后数组的前 count 个元素，如果count大于数组长度，则返回整个数组
    return shuffled.slice(0, Math.min(count, arr.length));
}