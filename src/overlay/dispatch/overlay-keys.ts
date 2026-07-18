/**
 * Overlay 配置键定义
 *
 * 统一管理 body.overlays 中每个浮层声明的合法配置键，
 * 供校验、警告和文档参考。
 *
 * 覆盖场景：
 * - tooltip：hover 触发，轻量提示
 * - dropdown：click 触发，菜单列表
 * - popover：click/hover 触发，富内容弹窗
 * - contextmenu：contextmenu 触发，右键菜单
 */

export type OverlayTrigger = 'hover' | 'click' | 'focus' | 'contextmenu' | 'manual';

export type OverlayPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';

export interface OverlayKeyDef {
    required?: boolean;
    description: string;
}

export const OVERLAY_DECL_KEYS: Record<string, OverlayKeyDef> = {
    prefix: {
        required: true,
        description: '浮层类型前缀，对应 ComponentRegistrar 中注册的组件类名（如 tips/dropdown/popover）',
    },
    typeOverride: {
        description: '覆盖从 prefix 推导的组件类查找名，用于差异化浮层组件',
    },
    trigger: {
        description: '触发方式：hover/click/focus/contextmenu/manual（默认 manual）',
    },
    placement: {
        description: '浮层相对锚定元素的位置：top/bottom/left/right + -start/-end（默认 bottom-start）',
    },
    offset: {
        description: '浮层与锚定元素的间距（像素，默认 4）',
    },
    items: {
        description: '菜单项列表，用于 dropdown/contextmenu（如 [{ text: "编辑", action: "edit" }]）',
    },
    closeOnClickOutside: {
        description: '点击浮层外部是否关闭（默认 true）',
    },
    closeOnEscape: {
        description: '按 ESC 是否关闭（默认 true）',
    },
    overlayProps: {
        description: '传递给浮层组件的额外 props（anchor/component/placement 由框架自动注入）',
    },
};

export const OVERLAY_DECL_KEY_SET = new Set(Object.keys(OVERLAY_DECL_KEYS));

export const OVERLAY_TRIGGER_SET = new Set<OverlayTrigger>(['hover', 'click', 'focus', 'contextmenu', 'manual']);

export const OVERLAY_PLACEMENT_SET = new Set<OverlayPlacement>([
    'top', 'top-start', 'top-end',
    'bottom', 'bottom-start', 'bottom-end',
    'left', 'left-start', 'left-end',
    'right', 'right-start', 'right-end',
]);

export function validateOverlayDecl(overlayKey: string, decl: Record<string, any>): void {
    if (!decl.prefix) {
        console.warn(`[OverlayConfig] overlayKey="${overlayKey}" missing required field "prefix"`);
    }

    for (const key of Object.keys(decl)) {
        if (!OVERLAY_DECL_KEY_SET.has(key)) {
            console.warn(`[OverlayConfig] overlayKey="${overlayKey}" unknown field "${key}", valid fields:`, [...OVERLAY_DECL_KEY_SET]);
        }
    }

    if (decl.trigger && !OVERLAY_TRIGGER_SET.has(decl.trigger)) {
        console.warn(`[OverlayConfig] overlayKey="${overlayKey}" unknown trigger "${decl.trigger}", valid:`, [...OVERLAY_TRIGGER_SET]);
    }

    if (decl.placement && !OVERLAY_PLACEMENT_SET.has(decl.placement)) {
        console.warn(`[OverlayConfig] overlayKey="${overlayKey}" unknown placement "${decl.placement}", valid:`, [...OVERLAY_PLACEMENT_SET]);
    }
}
