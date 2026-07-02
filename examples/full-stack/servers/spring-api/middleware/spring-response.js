/**
 * Spring 响应格式包装工具
 * 
 * Spring Data 标准分页格式：
 * {
 *   content: T[],
 *   pageable: { pageNumber, pageSize, ... },
 *   totalElements: number,
 *   totalPages: number,
 *   last: boolean,
 *   first: boolean,
 *   size: number,
 *   number: number,
 *   numberOfElements: number,
 *   empty: boolean
 * }
 */

/**
 * 包装分页列表为 Spring Page<T> 格式
 */
function pageResult(items, pageNumber, pageSize) {
    const totalElements = items.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const start = pageNumber * pageSize;
    const content = items.slice(start, start + pageSize);

    return {
        content,
        pageable: {
            pageNumber,
            pageSize,
            offset: start,
            paged: true,
            unpaged: false,
        },
        totalElements,
        totalPages,
        last: pageNumber >= totalPages - 1,
        first: pageNumber === 0,
        size: pageSize,
        number: pageNumber,
        numberOfElements: content.length,
        empty: content.length === 0,
    };
}

/**
 * 包装 Spring 错误响应
 */
function springError(status, message, path) {
    return {
        timestamp: new Date().toISOString(),
        status,
        error: status >= 500 ? 'Internal Server Error' : status >= 400 ? 'Bad Request' : 'Error',
        message,
        path,
    };
}

module.exports = { pageResult, springError };
