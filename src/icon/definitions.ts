/**
 * 图标定义 — 简洁笔画风（直线+弧线）
 *
 * 基于 24x24 viewBox，用笔画原语（P）组合生成。
 * 设计原则：
 *   - 去掉圆圈外框，只保留图标核心形状
 *   - 直线对应横/竖/撇/捺，弧线对应弯/钩/折
 *   - stroke-width 2，stroke-linecap round
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
            { d: P.polyline([4, 12], [9, 17], [20, 6]) },
        ],
    },
    {
        name: 'close',
        paths: [
            { d: P.line(6, 6, 18, 18) },
            { d: P.line(18, 6, 6, 18) },
        ],
    },
    {
        name: 'add',
        paths: [
            { d: P.line(12, 4, 12, 20) },
            { d: P.line(4, 12, 20, 12) },
        ],
    },
    {
        name: 'minus',
        paths: [
            { d: P.line(4, 12, 20, 12) },
        ],
    },

    // ---- Checkbox/Radio（控件状态图标） ----
    {
        name: 'checkbox',
        paths: [
            { d: P.rect(3, 3, 18, 18, 2) },
        ],
    },
    {
        name: 'checkbox-check',
        paths: [
            { d: P.rect(3, 3, 18, 18, 2) },
            { d: P.polyline([7, 12], [10, 15], [17, 8]) },
        ],
    },
    {
        name: 'radio',
        paths: [
            { d: P.circle(12, 12, 9) },
        ],
    },
    {
        name: 'radio-check',
        paths: [
            { d: P.circle(12, 12, 9) },
            { d: P.circle(12, 12, 4), fill: 'currentColor' },
        ],
    },

    // ---- 搜索/筛选 ----
    {
        name: 'search',
        paths: [
            { d: P.circle(10, 10, 6) },
            { d: P.line(15, 15, 21, 21) },
        ],
    },
    {
        name: 'filter',
        paths: [
            { d: P.polygon([3, 4], [21, 4], [15, 12], [15, 20], [9, 20], [9, 12]) },
        ],
    },

    // ---- 方向箭头（线条箭头） ----
    {
        name: 'arrow-down',
        paths: [
            { d: P.line(12, 4, 12, 20) },
            { d: P.polyline([6, 14], [12, 20], [18, 14]) },
        ],
    },
    {
        name: 'arrow-up',
        paths: [
            { d: P.line(12, 4, 12, 20) },
            { d: P.polyline([6, 10], [12, 4], [18, 10]) },
        ],
    },
    {
        name: 'arrow-left',
        paths: [
            { d: P.line(4, 12, 20, 12) },
            { d: P.polyline([10, 6], [4, 12], [10, 18]) },
        ],
    },
    {
        name: 'arrow-right',
        paths: [
            { d: P.line(4, 12, 20, 12) },
            { d: P.polyline([14, 6], [20, 12], [14, 18]) },
        ],
    },

    // ---- 小箭头/展开标记（实心三角形） ----
    {
        name: 'caret-down',
        paths: [
            { d: P.triangle(6, 8, 18, 8, 12, 16), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },
    {
        name: 'caret-up',
        paths: [
            { d: P.triangle(6, 16, 18, 16, 12, 8), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },
    {
        name: 'caret-left',
        paths: [
            { d: P.triangle(8, 6, 8, 18, 16, 12), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },
    {
        name: 'caret-right',
        paths: [
            { d: P.triangle(16, 6, 16, 18, 8, 12), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },

    // ---- V字箭头（chevron，线条版） ----
    {
        name: 'chevron-down',
        paths: [
            { d: P.polyline([6, 9], [12, 15], [18, 9]) },
        ],
    },
    {
        name: 'chevron-up',
        paths: [
            { d: P.polyline([6, 15], [12, 9], [18, 15]) },
        ],
    },
    {
        name: 'chevron-left',
        paths: [
            { d: P.polyline([9, 6], [15, 12], [9, 18]) },
        ],
    },
    {
        name: 'chevron-right',
        paths: [
            { d: P.polyline([15, 6], [9, 12], [15, 18]) },
        ],
    },

    // ---- 编辑操作 ----
    {
        name: 'edit',
        paths: [
            { d: P.polygon([1, 22], [7, 20], [19, 8], [15, 4], [3, 16]) },
            { d: P.line(7, 20, 3, 16) },
        ],
    },
    {
        name: 'delete',
        paths: [
            { d: P.line(4, 6, 20, 6) },
            { d: P.polyline([7, 6], [7, 21], [17, 21], [17, 6]) },
            { d: P.line(9, 3, 15, 3) },
            { d: P.line(10, 10, 10, 17) },
            { d: P.line(14, 10, 14, 17) },
        ],
    },

    // ---- 设置/菜单 ----
    {
        name: 'settings',
        paths: [
            { d: P.gear(12, 12, 6.5, 9.5, 8) },
            { d: P.circle(12, 12, 3) },
        ],
    },
    {
        name: 'menu',
        paths: [
            { d: P.line(3, 6, 21, 6) },
            { d: P.line(3, 12, 21, 12) },
            { d: P.line(3, 18, 21, 18) },
        ],
    },
    {
        name: 'more',
        paths: [
            { d: P.circle(5, 12, 2.2), fill: 'currentColor' },
            { d: P.circle(12, 12, 2.2), fill: 'currentColor' },
            { d: P.circle(19, 12, 2.2), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },

    // ---- 导航 ----
    {
        name: 'home',
        paths: [
            { d: P.polyline([3, 12], [12, 3], [21, 12]) },
            { d: P.polyline([5, 10], [5, 21], [9, 21], [9, 14], [15, 14], [15, 21], [19, 21], [19, 10]) },
        ],
    },
    {
        name: 'refresh',
        paths: [
            { d: P.arc(12, 12, 7, Math.PI * 0.25, Math.PI * 1.75) + ' M15 9 L19 9 M19 5 L19 9' },
        ],
    },

   <parameter name="newString">    {
        name: 'refresh',
        paths: [
            { d: P.arc(12, 12, 7, Math.PI * 0.25, Math.PI * 1.75) + ' M15 9 L19 9 M19 5 L19 9' },
        ],
    },

    // ---- 用户/情感 ----
    {
        name: 'user',
        paths: [
            { d: P.circle(12, 8, 3.5) },
            { d: 'M5 20 A7 7 0 0 1 19 20' },
        ],
    },
    {
        name: 'heart',
        paths: [
            { d: 'M12 20 C8 16 4 12 4 8 C4 5 7 3 12 7 C17 3 20 5 20 8 C20 12 16 16 12 20 Z' },
        ],
    },
    {
        name: 'star',
        paths: [
            { d: P.polygon([12, 4], [14, 9], [20, 10], [15, 13], [17, 19], [12, 15], [7, 19], [9, 13], [4, 10], [10, 9]) },
        ],
    },

    // ---- 状态提示 ----
    {
        name: 'warning',
        paths: [
            { d: P.polygon([12, 3], [21, 20], [3, 20]) },
            { d: P.line(12, 9, 12, 14) },
            { d: P.circle(12, 17, 1), fill: 'currentColor' },
        ],
    },
    {
        name: 'info',
        paths: [
            { d: P.circle(12, 12, 9) },
            { d: P.circle(12, 7, 1.2), fill: 'currentColor' },
            { d: P.line(12, 10, 12, 16) },
        ],
    },
];

/** 按 name 索引 */
export const iconMap: Record<string, IconDef> = Object.fromEntries(
    icons.map(i => [i.name, i])
);
