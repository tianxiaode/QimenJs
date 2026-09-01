import type { OverlayKeyDef, OverlayTrigger, OverlayPlacement } from './types';

export const OVERLAY_DECL_KEYS: Record<string, OverlayKeyDef> = {
    type: {
        required: true,
        description:
            '浮层组件类型名，对应 ComponentRegistrar 中注册的组件类名（如 tips/dropdown/popover）',
    },
    trigger: {
        description:
            '触发方式：hover/click/focus/contextmenu/manual/always（默认 manual），always 表示初始化时直接显示',
    },
    placement: {
        description:
            '浮层相对锚定元素的位置：top/bottom/left/right + -start/-end（默认 bottom-start）',
    },
    offset: {
        description: '浮层与锚定元素的间距（像素，默认 4）',
    },
    closeOnClickOutside: {
        description: '点击浮层外部是否关闭（默认 true）',
    },
    closeOnEscape: {
        description: '按 ESC 是否关闭（默认 true）',
    },
    data: {
        description: '传递给浮层组件的额外数据，支持对象或返回对象的函数（this = 宿主组件实例）',
    },
    onOverlayChange: {
        description:
            '自定义更新策略，覆盖浮层组件的默认 onOverlayChange 方法。签名：(overlay, data) => void',
    },
    mask: {
        description:
            '是否显示遮罩层。true = 默认半透明黑色遮罩，字符串 = 自定义遮罩颜色（如 rgba(255,255,255,0.7)）',
    },
};

export const OVERLAY_DECL_KEY_SET = new Set(Object.keys(OVERLAY_DECL_KEYS));

export const OVERLAY_TRIGGER_SET = new Set<OverlayTrigger>([
    'hover',
    'click',
    'focus',
    'contextmenu',
    'manual',
    'always',
]);

export const OVERLAY_PLACEMENT_SET = new Set<OverlayPlacement>([
    'top',
    'top-start',
    'top-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'left',
    'left-start',
    'left-end',
    'right',
    'right-start',
    'right-end',
    'center',
]);
