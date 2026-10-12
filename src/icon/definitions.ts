/**
 * 图标定义 — 简洁笔画风（直线+弧线）
 *
 * 基于 512x512 viewBox，用笔画原语（P）组合生成。
 * 设计原则：
 *   - 去掉圆圈外框，只保留图标核心形状
 *   - 直线对应横/竖/撇/捺，弧线对应弯/钩/折
 *   - stroke-width 42，stroke-linecap round
 *   - 实心图标用 fill: 'currentColor'
 *
 * AI 补充新图标时，先读 ICON_RULES.md（同目录）遵循绘制规则：
 *   1. 分析图标语义，分解为基本笔画
 *   2. 用 P 原语生成 path d 字符串
 *   3. 添加到 icons 数组
 *   4. 同步更新 scripts/build-icons.js 硬编码副本
 *   5. 运行 npm run build:icons 重新生成 SVG + 字体
 */

import { IconDef, P, DEFAULT_STROKE_WIDTH } from './strokes';

const SW = DEFAULT_STROKE_WIDTH;

export const icons: IconDef[] = [
    // ---- 状态确认 ----
    {
        name: 'check',
        paths: [
            { d: P.polyline([85, 267], [192, 374], [427, 139]) },
        ],
    },
    {
        name: 'close',
        paths: [
            { d: P.line(128, 128, 384, 384) },
            { d: P.line(384, 128, 128, 384) },
        ],
    },
    {
        name: 'add',
        paths: [
            { d: P.line(256, 85, 256, 427) },
            { d: P.line(85, 256, 427, 256) },
        ],
    },
    {
        name: 'minus',
        paths: [
            { d: P.line(85, 256, 427, 256) },
        ],
    },

    // ---- Checkbox/Radio（控件状态图标） ----
    {
        name: 'checkbox',
        paths: [
            { d: P.rect(64, 64, 384, 384, 43) },
        ],
    },
    {
        name: 'checkbox-check',
        paths: [
            { d: P.rect(64, 64, 384, 384, 43) },
            { d: P.polyline([149, 256], [213, 320], [363, 171]) },
        ],
    },
    {
        name: 'radio',
        paths: [
            { d: P.circle(256, 256, 192) },
        ],
    },
    {
        name: 'radio-check',
        paths: [
            { d: P.circle(256, 256, 192) },
            { d: P.circle(256, 256, 85), fill: 'currentColor' },
        ],
    },

    // ---- 搜索/筛选 ----
    {
        name: 'search',
        paths: [
            { d: P.circle(256, 256, 128) },
            { d: P.line(384, 384, 448, 448) },
        ],
    },
    {
        name: 'filter',
        paths: [
            { d: P.polygon([64, 85], [448, 85], [320, 256], [320, 427], [192, 427], [192, 256]) },
        ],
    },

    // ---- 方向箭头（线条箭头） ----
    {
        name: 'arrow-down',
        paths: [
            { d: P.line(256, 85, 256, 427) },
            { d: P.polyline([128, 299], [256, 427], [384, 299]) },
        ],
    },
    {
        name: 'arrow-up',
        paths: [
            { d: P.line(256, 85, 256, 427) },
            { d: P.polyline([128, 213], [256, 85], [384, 213]) },
        ],
    },
    {
        name: 'arrow-left',
        paths: [
            { d: P.line(85, 256, 427, 256) },
            { d: P.polyline([213, 128], [85, 256], [213, 384]) },
        ],
    },
    {
        name: 'arrow-right',
        paths: [
            { d: P.line(85, 256, 427, 256) },
            { d: P.polyline([299, 128], [427, 256], [299, 384]) },
        ],
    },

    // ---- 小箭头/展开标记（实心三角形） ----
    {
        name: 'caret-down',
        paths: [
            { d: P.triangle(128, 171, 384, 171, 256, 341), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },
    {
        name: 'caret-up',
        paths: [
            { d: P.triangle(128, 341, 384, 341, 256, 171), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },
    {
        name: 'caret-left',
        paths: [
            { d: P.triangle(171, 128, 171, 384, 341, 256), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },
    {
        name: 'caret-right',
        paths: [
            { d: P.triangle(341, 128, 341, 384, 171, 256), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },

    // ---- V字箭头（chevron，线条版） ----
    {
        name: 'chevron-down',
        paths: [
            { d: P.polyline([128, 192], [256, 320], [384, 192]) },
        ],
    },
    {
        name: 'chevron-up',
        paths: [
            { d: P.polyline([128, 320], [256, 192], [384, 320]) },
        ],
    },
    {
        name: 'chevron-left',
        paths: [
            { d: P.polyline([192, 128], [320, 256], [192, 384]) },
        ],
    },
    {
        name: 'chevron-right',
        paths: [
            { d: P.polyline([320, 128], [192, 256], [320, 384]) },
        ],
    },

    // ---- 编辑操作 ----
    {
        name: 'edit',
        paths: [
            { d: P.polygon([64, 448], [192, 406], [448, 150], [363, 64], [107, 320]) },
            { d: P.line(192, 406, 107, 320) },
        ],
    },
    {
        name: 'delete',
        paths: [
            { d: P.line(85, 128, 427, 128) },
            { d: P.polyline([149, 128], [149, 448], [363, 448], [363, 128]) },
            { d: P.line(192, 64, 320, 64) },
            { d: P.line(213, 213, 213, 363) },
            { d: P.line(299, 213, 299, 363) },
        ],
    },

    // ---- 设置/菜单 ----
    {
        name: 'settings',
        paths: [
            { d: P.gear(256, 256, 139, 203, 8) },
            { d: P.circle(256, 256, 64) },
        ],
    },
    {
        name: 'menu',
        paths: [
            { d: P.line(64, 128, 448, 128) },
            { d: P.line(64, 256, 448, 256) },
            { d: P.line(64, 384, 448, 384) },
        ],
    },
    {
        name: 'more',
        paths: [
            { d: P.circle(107, 256, 47), fill: 'currentColor' },
            { d: P.circle(256, 256, 47), fill: 'currentColor' },
            { d: P.circle(405, 256, 47), fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },

    // ---- 导航 ----
    {
        name: 'home',
        paths: [
            { d: P.polyline([64, 256], [256, 64], [448, 256]) },
            { d: P.polyline([107, 213], [107, 448], [192, 448], [192, 299], [320, 299], [320, 448], [405, 448], [405, 213]) },
        ],
    },
    {
        name: 'refresh',
        paths: [
            { d: P.arc(256, 256, 149, Math.PI * 0.25, Math.PI * 1.75) + ' M320 192 L405 192 M405 107 L405 192' },
        ],
    },

    // ---- 用户/情感 ----
    {
        name: 'user',
        paths: [
            { d: P.circle(256, 155, 75) },
            { d: 'M107 411 A149 149 0 0 1 405 411' },
            { d: P.line(85, 432, 427, 432) },
        ],
    },
    {
        name: 'heart',
        paths: [
            { d: 'M256 438 C171 352 85 267 85 182 C85 118 149 75 256 160 C363 75 427 118 427 182 C427 267 341 352 256 438 Z' },
        ],
    },
    {
        name: 'star',
        paths: [
            { d: P.polygon([256, 96], [299, 203], [427, 224], [320, 288], [363, 416], [256, 331], [149, 416], [192, 288], [85, 224], [213, 203]) },
        ],
    },

    // ---- 状态提示 ----
    {
        name: 'warning',
        paths: [
            { d: P.polygon([256, 75], [448, 438], [64, 438]) },
            { d: P.line(256, 203, 256, 310) },
            { d: P.circle(256, 374, 21), fill: 'currentColor' },
        ],
    },
    {
        name: 'info',
        paths: [
            { d: P.circle(256, 256, 192) },
            { d: P.circle(256, 149, 26), fill: 'currentColor' },
            { d: P.line(256, 213, 256, 341) },
        ],
    },

    // ---- 文件操作 ----
    {
        name: 'save',
        paths: [
            { d: P.rect(64, 64, 384, 384, 43) },
            { d: P.line(64, 192, 448, 192) },
            { d: P.rect(149, 64, 213, 128) },
            { d: P.rect(149, 277, 213, 171) },
        ],
    },
    {
        name: 'folder',
        paths: [
            { d: P.polygon([64, 138], [64, 416], [448, 416], [448, 138], [277, 138], [235, 96], [64, 96]) },
        ],
    },
    {
        name: 'folder-open',
        paths: [
            { d: P.polyline([64, 234], [64, 106], [192, 106], [235, 149], [363, 149], [363, 234]) },
            { d: P.polygon([64, 405], [149, 234], [448, 234], [363, 405]) },
        ],
    },

    // ---- 天体/外观 ----
    {
        name: 'sun',
        paths: [
            { d: P.circle(256, 256, 85) },
            { d: P.line(256, 43, 256, 107) },
            { d: P.line(256, 405, 256, 469) },
            { d: P.line(43, 256, 107, 256) },
            { d: P.line(405, 256, 469, 256) },
            { d: P.line(107, 107, 149, 149) },
            { d: P.line(363, 363, 405, 405) },
            { d: P.line(107, 405, 149, 363) },
            { d: P.line(363, 149, 405, 107) },
        ],
    },
    {
        name: 'moon',
        paths: [
            { d: 'M171 150 A171 171 0 1 0 342 363 A149 149 0 0 1 171 150 Z' },
        ],
    },
    {
        name: 'dark',
        paths: [
            { d: 'M171 150 A171 171 0 1 0 342 363 A149 149 0 0 1 171 150 Z', fill: 'currentColor' },
        ],
        strokeWidth: 0,
    },
    {
        name: 'palette',
        paths: [
            { d: 'M362 160 A213 213 0 1 0 341 374 A128 128 0 0 1 362 160 Z' },
            { d: P.circle(106, 203, 32), fill: 'currentColor' },
            { d: P.circle(213, 139, 32), fill: 'currentColor' },
            { d: P.circle(128, 331, 32), fill: 'currentColor' },
        ],
    },
    {
        name: 'globe',
        paths: [
            { d: P.circle(256, 256, 192) },
            { d: P.line(64, 256, 448, 256) },
            { d: P.polyline([256, 64], [171, 256], [256, 448]) },
            { d: P.polyline([256, 64], [341, 256], [256, 448]) },
        ],
    },
];

/** 按 name 索引 */
export const iconMap: Record<string, IconDef> = Object.fromEntries(
    icons.map(i => [i.name, i])
);
