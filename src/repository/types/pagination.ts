export interface PaginationParams {
  page?: number;
  pageSize?: number;
  [key: string]: any; // 允许携带任意搜索过滤字段
}

/**
 * 标准分页结果接口
 */
export interface PageResult<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}