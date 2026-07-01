/**
 * ABP 数据处理管道类型定义
 *
 * @module data-processor-abp/types
 */

/**
 * ABP 分页请求参数
 *
 * ABP 使用 skipCount/takeCount 分页模式
 */
export interface AbpPaginationParams {
    /** 跳过记录数（默认 0） */
    skipCount?: number;
    /** 获取记录数（默认 10） */
    takeCount?: number;
}

/**
 * ABP 分页响应（PagedResultDto）
 *
 * ABP 标准分页返回格式
 */
export interface AbpPagedResult<T = any> {
    /** 数据列表 */
    items: T[];
    /** 总记录数 */
    totalCount: number;
}

/**
 * ABP 审计字段
 *
 * ABP 实体自带的审计信息
 */
export interface AbpAuditFields {
    /** 创建时间 */
    creationTime?: string;
    /** 创建者 ID */
    creatorId?: string;
    /** 最后修改时间 */
    lastModificationTime?: string | null;
    /** 最后修改者 ID */
    lastModifierId?: string | null;
    /** 是否软删除 */
    isDeleted?: boolean;
    /** 删除时间 */
    deletionTime?: string | null;
    /** 删除者 ID */
    deleterId?: string | null;
}

/**
 * ABP 实体 DTO（EntityDto）
 *
 * ABP 标准实体返回格式
 */
export interface AbpEntityDto {
    /** 实体 ID */
    id: string | number;
}

/**
 * ABP 错误响应
 *
 * ABP 标准错误返回格式（RemoteServiceErrorResponse）
 */
export interface AbpErrorResponse {
    error: {
        /** 错误码 */
        code: string | null;
        /** 错误消息 */
        message: string | null;
        /** 详细信息 */
        details: string | null;
        /** 验证错误 */
        validationErrors?: Array<{
            /** 错误消息 */
            message: string;
            /** 关联成员（字段名列表） */
            members: string[];
        }>;
    };
}

/**
 * 字段级验证错误映射
 *
 * 以字段名为 key，错误消息列表为值，方便前端表单校验展示
 *
 * @example
 * ```typescript
 * // ABP 原始格式：
 * // validationErrors: [
 * //   { message: 'Name is required', members: ['name'] },
 * //   { message: 'Email is invalid', members: ['email'] },
 * //   { message: 'Password too short', members: ['password', 'confirmPassword'] },
 * // ]
 * //
 * // 转换后：
 * // { name: ['Name is required'], email: ['Email is invalid'], password: ['Password too short'], confirmPassword: ['Password too short'] }
 * ```
 */
export type AbpFieldErrors = Record<string, string[]>;

/**
 * ABP 管道配置
 */
export interface AbpPipelineOptions {
    /** 租户 ID（注入 X-Tenant-Id Header） */
    tenantId?: string;
    /** 分页默认大小（默认 10） */
    defaultPageSize?: number;
    /** 是否移除审计字段（默认 true） */
    removeAuditFields?: boolean;
    /** 是否处理软删除（默认 true，过滤 isDeleted=true 的记录） */
    filterSoftDeleted?: boolean;
}
