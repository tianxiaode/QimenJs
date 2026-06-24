export type CompareResult = -1 | 0 | 1 | number;
export interface CompareRule {
    when(a: unknown, b: unknown): boolean;
    compare(a: any, b: any): CompareResult;
}
/**
 * 智能比较函数
 * @param a 第一个比较值
 * @param b 第二个比较值
 * @param strict 是否启用严格模式(默认true)
 * @returns 比较结果
 *
 * 在严格模式下，只允许相同类型的值进行比较
 * 在宽松模式下，允许不同类型但可转换的值进行比较
 */
export declare function smartCompare(a: unknown, b: unknown, strict?: boolean): CompareResult;
//# sourceMappingURL=compare.d.ts.map