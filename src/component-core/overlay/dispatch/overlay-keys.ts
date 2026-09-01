import {
    OVERLAY_DECL_KEY_SET,
    OVERLAY_TRIGGER_SET,
    OVERLAY_PLACEMENT_SET,
} from './constants';

export function validateOverlayDecl(overlayKey: string, decl: Record<string, any>): void {
    if (!decl.type) {
        console.warn(`[OverlayConfig] overlayKey="${overlayKey}" missing required field "type"`);
    }

    for (const key of Object.keys(decl)) {
        if (!OVERLAY_DECL_KEY_SET.has(key)) {
            console.warn(
                `[OverlayConfig] overlayKey="${overlayKey}" unknown field "${key}", valid fields:`,
                [...OVERLAY_DECL_KEY_SET]
            );
        }
    }

    if (decl.trigger && !OVERLAY_TRIGGER_SET.has(decl.trigger)) {
        console.warn(
            `[OverlayConfig] overlayKey="${overlayKey}" unknown trigger "${decl.trigger}", valid:`,
            [...OVERLAY_TRIGGER_SET]
        );
    }

    if (decl.placement && !OVERLAY_PLACEMENT_SET.has(decl.placement)) {
        console.warn(
            `[OverlayConfig] overlayKey="${overlayKey}" unknown placement "${decl.placement}", valid:`,
            [...OVERLAY_PLACEMENT_SET]
        );
    }
}
