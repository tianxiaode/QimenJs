/**
 * template-constants.ts — 模板相关常量
 */

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

export const ALIGN_MAP: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
};

export const PACK_MAP: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
};
