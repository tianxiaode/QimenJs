/**
 * 图标定义 — 简洁笔画风（直线+弧线）
 *
 * 基于 16x16 viewBox，用笔画原语（P）组合生成。
 * 设计原则：
 *   - 去掉圆圈外框，只保留图标核心形状
 *   - 直线对应横/竖/撇/捺，弧线对应弯/钩/折
 *   - stroke-width 1.5，stroke-linecap round
 *   - 实心图标用 fill: 'currentColor'
 *
 * AI 补充新图标时，遵循此格式：
 *   1. 分析图标语义，分解为基本笔画
 *   2. 用 P 原语生成 path d 字符串
 *   3. 添加到 icons 数组
 *   4. 运行 npm run build:icons 重新生成 SVG + 字体
 */

import { IconDef, P, DEFAULT_STROKE_WIDTH } from './strokes';

const SW = DEFAULT_STROKE_WIDTH;

export const icons: IconDef[] = [
    // ---- 状态确认 ----
    {
        name: 'check',
        paths: [
            { d: P.polyline([3, 8], [6, 11], [13, 4]) },
        ],
    },
    {
        name: 'close',
        paths: [
            { d: P.line(4, 4, 12, 12) },
            { d: P.line(12, 4, 4, 12) },
        ],
    },
    {
        name: 'add',
        paths: [
            { d: P.line(8, 3, 8, 13) },
            { d: P.line(3, 8, 13, 8) },
        ],
    },
    {
        name: 'minus',
        paths: [
            { d: P.line(3, 8, 13, 8) },
        ],
    },

    // ---- Checkbox/Radio（控件状态图标） ----
    {
        name: 'checkbox',
        paths: [
            { d: P.rect(2, 2, 12, 12, 1) },
        ],
    },
    {
        name: 'checkbox-check',
        paths: [
            { d: P.rect(2, 2, 12, 12, 1) },
            { d: P.polyline([4, 8], [6, 10], [12, 4]) },
        ],
    },
    {
        name: 'radio',
        paths: [
            { d: P.circle(8, 8, 6) },
        ],
    },
    {
        name: 'radio-check',
        paths: [
            { d: P.circle(8, 8, 6) },
            { d: P.circle(8, 8, 2.5), fill: 'currentColor' },
        ],
    },
    {
        name: 'close',
        paths: [
            { d: P.line(4, 4, 12, 12) },
            { d: P.line(12, 4, 4, 12) },
        ],
    },
    {
        name: 'add',
        paths: [
            { d: P.line(8, 3, 8, 13) },
            { d: P.line(3, 8, 13, 8) },
        ],
    },
    {
        name: 'minus',
        paths: [
            { d: P.line(3, 8, 13, 8) },
        ],
    },

    // ---- 搜索/筛选 ----
    {
        name: 'search',
        paths: [
            { d: P.circle(7, 7, 4) },
            { d: P.line(10, 10, 14, 14) },
        ],
    },
    {
        name: 'filter',
        paths: [
            { d: P.polyline([2, 3], [14, 3]) },
            { d: P.polyline([4, 8], [12, 8]) },
            { d: P.polyline([6, 13], [10, 13]) },
        ],
    },

    // ---- 方向箭头（线条箭头） ----
    {
        name: 'arrow-down',
        paths: [
            { d: P.line(8, 3, 8, 13) },
            { d: P.polyline([4, 9], [8, 13], [12, 9]) },
        ],
    },
    {
        name: 'arrow-up',
        paths: [
            { d: P.line(8, 3, 8, 13) },
            { d: P.polyline([4, 7], [8, 3], [12, 7]) },
        ],
    },
    {
        name: 'arrow-left',
        paths: [
            { d: P.line(3, 8, 13, 8) },
            { d: P.polyline([7, 4], [3, 8], [7, 12]) },
        ],
    },
    {
        name: 'arrow-right',
        paths: [
            { d: P.line(3, 8, 13, 8) },
            { d: P.polyline([9, 4], [13, 8], [9, 12]) },
        ],
    },

    // ---- 小箭头/展开标记（实心三角形） ----
    {
        name: 'caret-down',
        paths: [
            { d: P.triangle(4, 5, 12, 5, 8, 11), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },
    {
        name: 'caret-up',
        paths: [
            { d: P.triangle(4, 11, 12, 11, 8, 5), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },
    {
        name: 'caret-left',
        paths: [
            { d: P.triangle(5, 4, 5, 12, 11, 8), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },
    {
        name: 'caret-right',
        paths: [
            { d: P.triangle(11, 4, 11, 12, 5, 8), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },

    // ---- 编辑操作 ----
    {
        name: 'edit',
        paths: [
            { d: P.polyline([2, 14], [10, 6]) },
            { d: P.polyline([10, 6], [12, 4], [14, 6], [12, 8]) },
            { d: P.line(2, 14, 4, 12) },
        ],
    },
    {
        name: 'delete',
        paths: [
            { d: P.line(3, 4, 13, 4) },
            { d: P.polyline([5, 4], [5, 14], [11, 14], [11, 4]) },
            { d: P.line(7, 2, 9, 2) },
            { d: P.line(7, 7, 7, 11) },
            { d: P.line(9, 7, 9, 11) },
        ],
    },

    // ---- 设置/菜单 ----
    {
        name: 'settings',
        paths: [
            { d: P.circle(8, 8, 3) },
            { d: P.line(8, 1, 8, 3) },
            { d: P.line(8, 13, 8, 15) },
            { d: P.line(1, 8, 3, 8) },
            { d: P.line(13, 8, 15, 8) },
            { d: P.line(3, 3, 4.5, 4.5) },
            { d: P.line(11.5, 11.5, 13, 13) },
            { d: P.line(13, 3, 11.5, 4.5) },
            { d: P.line(4.5, 11.5, 3, 13) },
        ],
    },
    {
        name: 'menu',
        paths: [
            { d: P.line(2, 4, 14, 4) },
            { d: P.line(2, 8, 14, 8) },
            { d: P.line(2, 12, 14, 12) },
        ],
    },
    {
        name: 'more',
        paths: [
            { d: P.circle(3, 8, 1), fill: 'currentColor' },
            { d: P.circle(8, 8, 1), fill: 'currentColor' },
            { d: P.circle(13, 8, 1), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },

    // ---- 导航 ----
    {
        name: 'home',
        paths: [
            { d: P.polyline([2, 8], [8, 2], [14, 8]) },
            { d: P.polyline([4, 7], [4, 14], [12, 14], [12, 7]) },
            { d: P.line(6, 14, 6, 10), strokeWidth: SW },
            { d: P.line(10, 14, 10, 10), strokeWidth: SW },
        ],
    },
    {
        name: 'refresh',
        paths: [
            { d: P.arc(8, 8, 5, 0, Math.PI * 1.5) },
            { d: P.polyline([8, 3], [11, 1], [13, 4]) },
        ],
    },
];

/** 按 name 索引 */
export const iconMap: Record<string, IconDef> = Object.fromEntries(
    icons.map(i => [i.name, i])
);
