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

// constants/style-props.ts

/**
 * 样式属性（应该放在 style 中）
 *
 * 这些是 CSS 样式属性，通过 el.style 设置
 * 不应该作为 DOM 属性直接赋值
 */
export const STYLE_PROPS = new Set([
    // 尺寸
    'width',
    'height',
    'minWidth',
    'minHeight',
    'maxWidth',
    'maxHeight',
    // 间距
    'margin',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'padding',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    // 定位
    'x',
    'y', // 通常是 left/top 的别名
    'top',
    'right',
    'bottom',
    'left',
    'position',
    'zIndex',
    // 排版
    'fontSize',
    'fontFamily',
    'fontWeight',
    'lineHeight',
    'color',
    'backgroundColor',
    'background',
    'textAlign',
    'textDecoration',
    'textTransform',
    // 边框
    'border',
    'borderRadius',
    'borderColor',
    'borderWidth',
    // 显示
    'display',
    'opacity',
    'visibility',
    // 其他
    'cursor',
    'overflow',
    'flex',
    'flexDirection',
    'justifyContent',
    'alignItems',
    'gap',
    'grid',
    'gridTemplateColumns',
]);

/**
 * HTML 标准属性（可以直接赋值）
 *
 * 这些属性可以直接用 el[prop] 赋值
 * 不是所有属性都需要列举，只列举需要特殊处理的
 */
// constants/html-direct-props.ts

/**
 * HTML 直接属性（可直接赋值）
 *
 * 这些属性可以直接用 el[prop] = value
 * 不包含样式属性（样式属性放 style）
 */
export const HTML_DIRECT_PROPS = new Set([
    // 通用
    'lang',
    'dir',
    'hidden',
    'tabIndex',
    'accessKey',
    'draggable',
    'spellCheck',
    // 表单
    'name',
    'value',
    'placeholder',
    'disabled',
    'readOnly',
    'required',
    'checked',
    'selected',
    'multiple',
    'maxLength',
    'minLength',
    'pattern',
    'autoComplete',
    'autoFocus',
    'step',
    'min',
    'max',
    // 链接/图片（但不是尺寸）
    'href',
    'target',
    'rel',
    'download',
    'src',
    'alt',
    // ❌ 移除 width, height（用 style）
    // 音视频
    'autoplay',
    'controls',
    'loop',
    'muted',
    'preload',
    'poster',
    // 其他
    'colSpan',
    'rowSpan',
    'open',
    'reversed',
    'start',
    'wrap',
    'accept',
    'enctype',
    'method',
    'noValidate',
    'htmlFor',
]);
// /**
//  * 判断是否需要用 setAttribute
//  */
// export function shouldUseSetAttribute(key: string): boolean {
//     return key.startsWith('data-') || key.startsWith('aria-');
// }

// /**
//  * 获取 DOM 属性名
//  */
// export function getDomPropKey(key: string): string {
//     return ATTR_PROP_MAP[key] || key;
// }
