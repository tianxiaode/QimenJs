/**
 * template-constants.ts — 模板相关常量
 */

/** 内容模式映射表，将模式名映射为节点属性定义数组 */
export const CONTENT_MODE_MAP: Record<string, any[]> = {
    text: [{ nodeProp: 'text' }],
    html: [{ nodeProp: 'text' }, { nodeProp: 'html' }],
    value: [{ nodeProp: 'value' }],
    src: [{ nodeProp: 'src' }],
    link: [{ nodeProp: 'text' }, { nodeProp: 'href' }],
};

/** 通用节点属性名列表，所有节点均可使用的属性 */
export const COMMON_NODE_PROPS = [
    'cls',
    'style',
    'hidden',
    'disabled',
    'width',
    'height',
    'margin',
    'padding',
    'fontSize',
    'color',
    'bg',
    'cursor',
    'border',
] as const;

/** 模板解析保留键集合，这些键名不允许作为节点属性名 */
export const RESERVED_KEYS = new Set([
    'constructor',
    'dispose',
    'el',
    'meta',
    'props',
    'nodeMap',
    'tag',
    'type',
    'template',
    'id',
    'on',
    'off',
    'emit',
    'debounce',
    'parent',
]);

/** 动画预设关键帧映射表，提供 fadeIn/fadeOut/slideInUp 等常用动画 */
export const ANIMATION_PRESETS: Record<string, Keyframe[]> = {
    fadeIn: [{ opacity: 0 }, { opacity: 1 }],
    fadeOut: [{ opacity: 1 }, { opacity: 0 }],
    slideInUp: [
        { transform: 'translateY(20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 },
    ],
    slideOutDown: [
        { transform: 'translateY(0)', opacity: 1 },
        { transform: 'translateY(20px)', opacity: 0 },
    ],
    slideInLeft: [
        { transform: 'translateX(-20px)', opacity: 0 },
        { transform: 'translateX(0)', opacity: 1 },
    ],
    slideOutRight: [
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(20px)', opacity: 0 },
    ],
    scaleIn: [
        { transform: 'scale(0.9)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
    ],
    scaleOut: [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.9)', opacity: 0 },
    ],
};

export const TPL_CORE_KEYS = [
    'name',
    'type',
    'tag',
    'text',
    'contentMode',
    'action',
    'hidden',
    'hiddenMode',
    'i18n',
    'permission',
    'disabled',
    'readonly',
    'placeholder',
    'required',
    'title',
    'src',
    'value',
    'accept',
    'multiple',
    'checked',
    'selected',
    'for',
    'order',
    'zIndex',
    'role',
];
