/**
 * 使用 Fisher-Yates 洗牌算法随机打乱数组
 * @template T 数组元素类型
 * @param {T[]} arr 需要被打乱的原数组
 * @returns {T[]} 返回一个新的被打乱顺序的数组副本，不修改原数组
 */
export function shuffle<T>(arr: T[]): T[] {
    // 创建原数组的副本以避免修改原数组
    const result = [...arr];
    // Fisher-Yates 洗牌算法实现
    for (let i = result.length - 1; i > 0; i--) {
        // 生成 0 到 i 之间的随机索引
        const j = Math.floor(Math.random() * (i + 1));
        // 交换元素位置
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}