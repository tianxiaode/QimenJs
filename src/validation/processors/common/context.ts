import {
    ValidationContext,
    ValidationProcessorHandler,
} from '../../types';
/**
 * 基础状态提取处理器
 * 权重建议设为很低（INITIAL 阶段）
 */
export const RefreshContextStatusProcessor: ValidationProcessorHandler = async (
    context: ValidationContext
) => {
    const { value, rawValue } = context;

    // 基础指纹提取
    const status = context.status;
    status.isUndefined = value === undefined;
    status.isNull = value === null;
    status.isNaN = typeof value === 'number' && Number.isNaN(value);

    // 结构化判空
    status.isEmpty =
        status.isUndefined ||
        status.isNull ||
        value === '' ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && value !== null && Object.keys(value).length === 0); // 增加对空对象的支持

    // 变更追踪
    status.isModified = value !== rawValue;
};

