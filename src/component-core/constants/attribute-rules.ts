/**
 * 属性规则常量
 *
 * 极简版：只定义必要的规则
 */

/**
 * 需要 setAttribute 的属性前缀
 *
 * data-* 和 aria-* 必须用 setAttribute
 */
export const ATTR_PREFIXES_KEYS = new Set(['data-', 'aria-', 'data_', 'aria_']);

/**
 * 特殊属性（不直接赋值到 DOM）
 */
export const SPECIAL_KEYS = new Set([
    'style', // 特殊处理
    'cls', // 特殊处理
    'hint', // 特殊处理
    'text', // textContent
    'html', // innerHTML
]);

/**
 * 类名属性（特殊处理）
 */
export const CLASS_KEYS = new Set(['className', 'class', 'cls']);

/**
 * 样式属性（特殊处理）
 */
export const STYLE_KEYS = new Set([
    'color',
    'fontSize',
    'order',
    'width',
    'height',
    'padding',
    'margin',
    'display',
    'position',
    'top',
    'left',
    'flex',
    'flexDirection',
    'justifyContent',
    'alignItems',
    'gap',
    'grid',
    'opacity',
    'visibility',
    'cursor',
    'backgroundColor',
    'background',
    'border',
    'borderRadius',
    'transform',
    'transition',
    'boxShadow',
    'zIndex',
]);

/**
 * HTML 属性（统一用 setAttribute 或 el[prop]）
 *
 * 包括：data-*、aria-*、href、src、disabled 等
 */
export const HTML_KEYS = new Set([
    // data-* 和 aria-* 在运行时通过 startsWith 判断
    // 这里列出标准 HTML 属性
    'id',
    'name',
    'value',
    'placeholder',
    'disabled',
    'readOnly',
    'required',
    'checked',
    'selected',
    'href',
    'target',
    'src',
    'alt',
    'title',
    'tabIndex',
    'hidden',
    'autofocus',
    'multiple',
    'maxLength',
    'minLength',
    'pattern',
    'step',
    'min',
    'max',
    'autoplay',
    'controls',
    'loop',
    'muted',
    'preload',
    'colSpan',
    'rowSpan',
    'htmlFor',
    'role',
]);

export const SPLIT_OPTIONS_IGNORE_KEYS = new Set([
    'children',
    'i18n',
    'permission',
    'name',
    'tag',
    'type',
]);
