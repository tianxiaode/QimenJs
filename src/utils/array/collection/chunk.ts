/**
 * 将数组按指定大小分块
 * @template T 数组元素类型
 * @param {T[]} arr 需要分块的原数组
 * @param {number} size 每个块的大小，必须为正整数
 * @returns {T[][]} 返回一个包含多个子数组的数组，每个子数组的长度为size（最后一个可能小于size）
 */
export function chunk<T>(arr: T[], size: number): T[][] {
    // 如果size小于等于0，直接返回空数组
    if (size <= 0) {
        return [];
    }

    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }

    return chunks;
}
