/**
 * Overlay 配置键定义
 *
 * 统一管理 body.overlays 中每个浮层声明的合法配置键，
 * 供校验、警告和文档参考。
 */

export type OverlayTrigger = 'hover' | 'click' | 'focus' | 'manual';

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
        description: '触发方式：hover（悬停）/ click（点击切换）/ focus（聚焦）/ manual（手动控制，默认）',
    },
    overlayProps: {
        description: '传递给浮层组件的 props（anchor 和 component 由框架自动注入）',
    },
};

export const OVERLAY_DECL_KEY_SET = new Set(Object.keys(OVERLAY_DECL_KEYS));

export const OVERLAY_TRIGGER_SET = new Set<OverlayTrigger>(['hover', 'click', 'focus', 'manual']);

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
}