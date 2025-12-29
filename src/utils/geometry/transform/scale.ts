import { multiply } from './matrix';
import { translate } from './translate';

export function matrixScale(sx: number, sy: number, cx = 0, cy = 0) {
    return multiply(multiply(translate(cx, cy), [sx, 0, 0, sy, 0, 0]), translate(-cx, -cy));
}
