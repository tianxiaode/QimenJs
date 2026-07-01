/**
 * Spring 数据处理管道类型定义
 *
 * @module data-processor-spring/types
 */

/**
 * Spring 分页请求参数
 *
 * Spring Data 使用 page/size 分页模式（0-based 索引）
 */
export interface SpringPaginationParams {
    /** 页码（从 0 开始） */
    page?: number;
    /** 每页大小（默认 20） */
    size?: number;
    /** 排序字段 */
    sort?: string;
}

/**
 * Spring 分页响应（Page<T>）
 *
 * Spring Data 标准分页返回格式
 */
export interface SpringPage<T = any> {
    /** 数据列表 */
    content: T[];
    /** 分页元数据 */
    pageable: {
        /** 当前页码（从 0 开始） */
        pageNumber: number;
        /** 每页大小 */
        pageSize: number;
        /** 排序信息 */
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        /** 偏移量 */
        offset: number;
        /** 是否未分页 */
        unpaged: boolean;
        /** 是否分页 */
        paged: boolean;
    };
    /** 是否最后一页 */
    last: boolean;
    /** 总页数 */
    totalPages: number;
    /** 总元素数 */
    totalElements: number;
    /** 每页大小 */
    size: number;
    /** 当前页码 */
    number: number;
    /** 排序信息 */
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    /** 是否第一页 */
    first: boolean;
    /** 元素数量 */
    numberOfElements: number;
    /** 是否为空 */
    empty: boolean;
}

/**
 * Spring 错误响应
 *
 * Spring Boot 标准错误返回格式
 */
export interface SpringErrorResponse {
    /** 时间戳 */
    timestamp?: string;
    /** HTTP 状态码 */
    status?: number;
    /** 错误描述 */
    error?: string;
    /** 异常类名 */
    exception?: string;
    /** 错误消息 */
    message?: string;
    /** 请求路径 */
    path?: string;
    /** 追踪 ID */
    traceId?: string;
    /** 验证错误 */
    errors?: Array<{
        /** 字段名 */
        field: string;
        /** 拒绝值 */
        rejectedValue?: any;
        /** 错误消息 */
        message: string;
    }>;
}

/**
 * Spring 管道配置
 */
export interface SpringPipelineOptions {
    /** 分页默认大小（默认 20） */
    defaultPageSize?: number;
    /** 是否使用 0-based 页码（默认 true，Spring 标准） */
    zeroBasedPageIndex?: boolean;
}
