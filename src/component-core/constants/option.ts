/** 需要走 setStyle 的选项属性 */
export const OPTION_STYLE_PROPS = new Set([
    'left',
    'top',
    'right',
    'bottom',
    'width',
    'height',
    'minWidth',
    'maxWidth',
    'minHeight',
    'maxHeight',
    'position',
    'zIndex',
    'transform',
    'cursor',
    'pointerEvents',
]);

/** 需要走 setAttribute 的选项属性 */
export const OPTION_ATTRIBUTE_PROPS = new Set(['role', 'hint']);

/** 需要走 addCls 的选项属性 */
export const OPTION_CLS_PROPS = ['cls'] as const;

/** 需要自定义处理的选项属性 */
export const OPTION_CUSTOM_PROPS = [
    'style',
    'attribute',
    'order',
    'hidden',
    'disabled',
    'i18n',
    'viewportPosition',
    'radius',
] as const;
