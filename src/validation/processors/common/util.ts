import { ValidationContext } from "@/validation/types";

/**
 * 公共方法：刷新上下文状态快照
 * 建议在每个 Processor 执行前由调度器自动调用，或在 PresenceProcessor 开头调用
 */
export const refreshContextStatus = (context: ValidationContext): void => {
    const { value, rawValue } = context;
    context.status.isUndefined = value === undefined;
    context.status.isNull = value === null;
    context.status.isNaN = typeof value === 'number' && Number.isNaN(value);

    // 这里的 isEmpty 可以根据不同类型扩展
    context.status.isEmpty =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0);

    context.status.isModified = value !== rawValue;
};
