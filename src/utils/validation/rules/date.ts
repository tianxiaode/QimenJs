/**
 * 日期验证规则接口
 */
export interface DateRule {
  type: 'date'

  /** 是否必填 */
  required?: boolean

  /** 是否允许 null */
  nullable?: boolean

  /** 最小日期（含） */
  min?: Date

  /** 最大日期（含） */
  max?: Date
}

export interface DateAdvanceRule extends DateRule {
    today?: boolean;
    yesterday?: boolean;
    tomorrow?: boolean;
    past?: boolean;
    future?: boolean;
    weekend?: number | number[];
}
