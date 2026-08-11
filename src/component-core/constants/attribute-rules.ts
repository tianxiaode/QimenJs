// constants/attribute-rules.ts

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
export const ATTR_PREFIXES = ['data-', 'aria-'];

/**
 * 特殊属性（不直接赋值到 DOM）
 */
export const SPECIAL_ATTRS = new Set([
    'style', // 特殊处理
    'cls', // 特殊处理
    'hint', // 特殊处理
    'text', // textContent
    'html', // innerHTML
]);

// types/attribute-sets.ts

/**
 * 类名属性（特殊处理）
 */
export const CLASS_PROPS = new Set(['className', 'class', 'cls']);

/**
 * 样式属性（特殊处理）
 */
export const STYLE_PROPS = new Set([
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
export const HTML_PROPS = new Set([
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
