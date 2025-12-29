import { LengthValue } from "./parse";
import { LengthContext } from "./types";

export function pxToRem(px: number, root: number): number {
    return px / root;
}

export function remToPx(rem: number, root: number): number {
    return rem * root;
}

export function pxToVw(px: number, vw: number): number {
    return (px / vw) * 100;
}

export function toPx(length: LengthValue, ctx: LengthContext): number {
    const { value, unit } = length;

    switch (unit) {
        case 'px':
            return value;
        case 'rem':
            return value * ctx.rootFontSize;
        case 'em':
            return value * ctx.fontSize;
        case 'vw':
            return (value / 100) * ctx.viewportWidth;
        case 'vh':
            return (value / 100) * ctx.viewportHeight;
        case '%':
            if (ctx.percentBase == null) {
                throw new Error('percentBase is required for % unit');
            }
            return (value / 100) * ctx.percentBase;
    }
}
