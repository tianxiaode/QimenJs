/**
 * 搜索位置常量
 *
 * 定义搜索各 UI 元素的位置权重，用于排序。
 * 位置值越小越靠前，确保渲染顺序一致。
 *
 * 搜索区域位于 CRUD 按钮之前（CRUD 从 10 开始）。
 */

export const SEARCH_POSITIONS = {
    INPUT: 5,
    BUTTON: 8,
} as const;
