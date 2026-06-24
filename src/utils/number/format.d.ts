/**
 * 根据指定格式格式化数字
 * 0 - 用对应的数字（如果存在）替换零；否则，将在结果字符串中显示零。
 * # - 用对应的数字（如果存在）替换"#"符号；否则，不会在结果字符串中显示任何数字
 * . - 确定小数点分隔符在结果字符串中的位置。
 * , - 用作组分隔符和数字比例换算说明符。 作为组分隔符时，它在各个组之间插入本地化的组分隔符字符。 作为数字比例换算说明符，对于每个指定的逗号，它将数字除以 1000
 * % - 将数字乘以 100，并在结果字符串中插入本地化的百分比符号
 * @param value 要格式化的数字
 * @param format 格式字符串
 * @returns 格式化后的字符串
 */
export declare function formatNumber(value: number, format: string): string;
/**
 * 根据指定货币符号和格式格式化货币
 * @param number 要格式化的数字
 * @param currency 货币符号
 * @param format 格式字符串
 * @returns 格式化后的货币字符串
 */
export declare function formatCurrency(number: number, currency: string, format: string): string;
//# sourceMappingURL=format.d.ts.map