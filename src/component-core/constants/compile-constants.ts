/**
 * compile-constants.ts — 编译引擎常量
 */

/** 骨架占位符 CSS 类名 */
export const SKELETON_CLS = 'q-skeleton';

/** HTML 自闭合标签集合，这些标签不需要闭合标签 */
export const VOID_TAGS = new Set([
    'input',
    'img',
    'br',
    'hr',
    'col',
    'area',
    'base',
    'embed',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
]);
