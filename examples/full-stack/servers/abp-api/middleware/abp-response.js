/**
 * ABP 响应格式包装中间件
 * 
 * 将普通数据包装为 ABP 标准响应格式：
 * - 列表：{ totalCount, items }
 * - 详情：直接返回
 * - 错误：{ error: { code, message, details, validationErrors } }
 */

/**
 * 包装分页列表为 ABP PagedResultDto 格式
 */
function pagedResult(items, skipCount, maxResultCount) {
    const totalCount = items.length;
    const pagedItems = items.slice(skipCount, skipCount + maxResultCount);
    return { totalCount, items: pagedItems };
}

/**
 * 包装 ABP 错误响应
 */
function abpError(code, message, validationErrors) {
    return {
        error: {
            code,
            message,
            details: '',
            validationErrors: validationErrors || null,
        },
    };
}

module.exports = { pagedResult, abpError };
