/**
 * HTML 属性常量定义
 */

/** HTML 标准属性集合 */
export const HTML_PROPS_SET = new Set([
    // 通用属性
    'id',
    'class',
    'style',
    'title',
    'lang',
    'dir',
    'hidden',
    'tabindex',
    'accesskey',
    'contenteditable',
    'draggable',
    'spellcheck',
    'translate',
    // 表单属性
    'name',
    'value',
    'placeholder',
    'disabled',
    'readonly',
    'required',
    'checked',
    'selected',
    'multiple',
    'maxlength',
    'minlength',
    'pattern',
    'autocomplete',
    'autofocus',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'list',
    'step',
    'min',
    'max',
    // 链接和图像属性
    'href',
    'target',
    'rel',
    'download',
    'src',
    'alt',
    'width',
    'height',
    'loading',
    'decoding',
    'srcset',
    'sizes',
    'usemap',
    'ismap',
    // 音视频属性
    'autoplay',
    'controls',
    'loop',
    'muted',
    'preload',
    'poster',
    'playsinline',
    // 其他
    'colspan',
    'rowspan',
    'headers',
    'scope',
    'datetime',
    'cite',
    'data',
    'label',
    'open',
    'reversed',
    'start',
    'wrap',
    'accept',
    'accept-charset',
    'action',
    'enctype',
    'method',
    'novalidate',
    'for',
    'span',
    'summary',
]);

/** 字段名映射（hint → title） */
export const FIELD_ALIAS_MAP: Record<string, string> = {
    hint: 'title', // hint 映射为 title
};

/** 特性名称集合（组件特性，不作为普通属性） */
export const FEATURE_SET = new Set([
    // 布局特性
    'flex',
    'grid',
    // 拖拽特性
    'drag',
    'drop',
    'dragHandle',
    'dropZone',
    // 浮层特性
    'float',
    'badge',
    'tooltip',
    'dialog',
    'popover',
    // 动画特性
    'animation',
    // 其他特性
    'indicator',
]);

/** 权限相关字段 */
export const PERMISSION_FIELDS = new Set(['permission']);
