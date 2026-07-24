/**
 * TemplateConstants — 模板相关常量
 */

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

export interface ContentPropDef {
    nodeProp: string;
}

export const CONTENT_MODE_MAP: Record<string, ContentPropDef[]> = {
    text: [{ nodeProp: 'text' }],
    html: [{ nodeProp: 'html' }],
    value: [{ nodeProp: 'value' }],
    src: [{ nodeProp: 'src' }],
    link: [{ nodeProp: 'text' }, { nodeProp: 'href' }],
};

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

export interface AnimationOptions {
    duration?: number;
    easing?: string;
    fill?: FillMode;
}
