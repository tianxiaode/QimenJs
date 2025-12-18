/**
 * 范围比较结果类型
 * 'exact' - 值不等于精确值要求
 * 'min' - 值小于最小值要求
 * 'max' - 值大于最大值要求
 * null - 值符合所有范围要求
 */
export type RangeCompareResult = 'exact' | 'min' | 'max' | null

/**
 * 数值范围比较函数
 * 用于检查给定数值是否符合指定的范围条件
 * 
 * @param value - 需要检查的数值
 * @param options - 范围选项配置对象
 * @param options.exact - 精确值要求（可选）
 * @param options.min - 最小值要求（可选）
 * @param options.max - 最大值要求（可选）
 * @returns RangeCompareResult - 比较结果，null表示符合所有条件
 */
export function compareRange(
  value: number,
  options: {
    exact?: number
    min?: number
    max?: number
  }
): RangeCompareResult {
  // 检查精确值条件：如果设置了精确值且当前值不等于精确值
  if (options.exact !== undefined && value !== options.exact) {
    return 'exact'
  }
  
  // 检查最小值条件：如果设置了最小值且当前值小于最小值
  if (options.min !== undefined && value < options.min) {
    return 'min'
  }
  
  // 检查最大值条件：如果设置了最大值且当前值大于最大值
  if (options.max !== undefined && value > options.max) {
    return 'max'
  }
  
  // 所有条件都满足，返回null
  return null
}