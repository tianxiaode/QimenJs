import { ValidationErrorBuilder } from "../errors";
import { ValidationContext } from "../types";

/**
 * 核心正则匹配助手
 * @returns boolean 表示是否通过，内部自动处理错误压栈
 */
export const validatePattern = (
    value: any,
    regex: RegExp,
    context: ValidationContext,
    expected?: string // 预期类型
): boolean => {
    //不要做任何防御，相信传递过滤的参数，直接报错比隐藏错误更好

    if (!regex.test(String(value))) {
        context.errors.push(
            ValidationErrorBuilder.pattern_mismatch(regex.source, value, { context, expected })
        );
        return false;
    }
    return true;
};
