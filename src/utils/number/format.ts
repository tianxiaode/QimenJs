/**
 * 对数字进行四舍五入到指定精度
 * @param num 要四舍五入的数字
 * @param precision 小数点后保留的位数
 * @returns 四舍五入后的数字
 */
function round(num: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(num * factor) / factor;
}


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
export function formatNumber(value: number, format: string): string {
    if (!isFinite(value)) return "";

    const isPercent = format.includes("%");
    const hasComma = format.includes(",");
    const [intFmt, decFmt = ""] = format.replace(/%/g, "").split(".");

    let num = isPercent ? value * 100 : value;

    // 计算小数位
    const decimalPlaces = decFmt.replace(/[^0#]/g, "").length;
    num = round(num, decimalPlaces);

    const [intPart, decPart = ""] = Math.abs(num)
        .toFixed(decimalPlaces)
        .split(".");

    const formattedInt = formatInteger(intPart, intFmt, hasComma);
    const formattedDec = formatDecimal(decPart, decFmt);

    const sign = num < 0 ? "-" : "";
    const result =
        formattedDec.length > 0
            ? `${sign}${formattedInt}.${formattedDec}`
            : `${sign}${formattedInt}`;

    return isPercent ? result + "%" : result;
}

/**
 * 格式化整数部分
 * @param digits 整数部分字符串
 * @param format 格式字符串
 * @param useComma 是否使用千分位分隔符
 * @returns 格式化后的整数部分
 */
function formatInteger(
    digits: string,
    format: string,
    useComma: boolean
): string {
    const cleanFormat = format.replace(/,/g, "");
    const minDigits = cleanFormat.replace(/#/g, "").length;

    let result = digits.padStart(minDigits, "0");

    if (useComma) {
        result = addThousandsSeparator(result);
    }

    return result;
}

/**
 * 格式化小数部分
 * @param digits 小数部分字符串
 * @param format 格式字符串
 * @returns 格式化后的小数部分
 */
function formatDecimal(digits: string, format: string): string {
    const max = format.length;
    const min = format.replace(/#/g, "").length;

    const trimmed = digits.slice(0, max);
    return trimmed.padEnd(min, "0");
}

/**
 * 为数字字符串添加千分位分隔符
 * @param value 数字字符串
 * @returns 添加千分位分隔符后的数字字符串
 */
function addThousandsSeparator(value: string): string {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * 根据指定货币符号和格式格式化货币
 * @param number 要格式化的数字
 * @param currency 货币符号
 * @param format 格式字符串
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(number: number, currency: string, format: string): string {
    return currency + formatNumber(number, format);
}