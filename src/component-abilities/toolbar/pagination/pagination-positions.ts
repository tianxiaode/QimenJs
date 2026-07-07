/**
 * 分页位置常量
 *
 * 定义分页各 UI 元素的位置权重，用于排序。
 * 位置值越小越靠前，确保渲染顺序一致。
 *
 * 拆分后各子能力共享此常量，新增 JUMPER 和 SIZER 位置。
 */

export const PAGINATION_POSITIONS = {
    FIRST: 610,
    PREV: 620,
    PAGES: 630,
    JUMPER: 635,
    NEXT: 640,
    LAST: 650,
    SIZER: 655,
    INFO: 660,
} as const;
