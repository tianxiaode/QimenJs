/**
 * 根据多个排序条件对数组进行排序
 * @template T 数组元素类型
 * @param {T[]} arr 要排序的数组
 * @param {Array<{ key?: keyof T; keySelector?: (item: T) => any; order?: 'asc' | 'desc' }>} orders 排序条件数组
 * @returns {T[]} 返回排序后的新数组，不修改原数组
 */
export function orderBy<T>(
    arr: T[],
    orders: Array<{
        // 字段名或键提取函数，二选一
        key?: keyof T;
        keySelector?: (item: T) => any;
        order?: 'asc' | 'desc';
    }>
): T[] {
    if (orders.length === 0) {
        return [...arr]; // 没有排序条件，返回副本
    }

    // 验证每个排序条件
    orders.forEach((order, index) => {
        if (!order.key && !order.keySelector) {
            throw new Error(
                `Order condition at index ${index} must have either 'key' or 'keySelector'`
            );
        }

        if (order.key && order.keySelector) {
            throw new Error(
                `Order condition at index ${index} cannot have both 'key' and 'keySelector'`
            );
        }
    });

    // 创建组合比较函数
    const compareFn = (a: T, b: T): number => {
        for (const condition of orders) {
            let keyA: any;
            let keyB: any;

            if (condition.keySelector) {
                keyA = condition.keySelector(a);
                keyB = condition.keySelector(b);
            } else if (condition.key) {
                keyA = a[condition.key];
                keyB = b[condition.key];
            }

            const order = condition.order || 'asc';

            // 处理 null/undefined
            if (keyA == null && keyB == null) continue;
            if (keyA == null) return order === 'asc' ? -1 : 1;
            if (keyB == null) return order === 'asc' ? 1 : -1;

            // 数字比较
            if (typeof keyA === 'number' && typeof keyB === 'number') {
                const diff = keyA - keyB;
                if (diff !== 0) {
                    return order === 'asc' ? diff : -diff;
                }
                continue; // 相等则继续下一个条件
            }

            // 日期比较
            if (keyA instanceof Date && keyB instanceof Date) {
                const diff = keyA.getTime() - keyB.getTime();
                if (diff !== 0) {
                    return order === 'asc' ? diff : -diff;
                }
                continue;
            }

            // 字符串比较
            const strA = String(keyA);
            const strB = String(keyB);
            const diff = strA.localeCompare(strB);
            if (diff !== 0) {
                return order === 'asc' ? diff : -diff;
            }
            // 相等则继续下一个条件
        }

        return 0; // 所有条件都相等
    };

    // 使用 sortWith 函数进行排序
    return sortWith(arr, compareFn);
}

// 导入 sortWith 函数，因为它在 orderBy 中被使用
import { sortWith } from './sortWith';