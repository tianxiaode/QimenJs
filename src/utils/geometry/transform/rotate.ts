import { multiply } from './matrix';
import { translate } from './translate';

export function rotate(angle: number, cx = 0, cy = 0) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return multiply(multiply(translate(cx, cy), [cos, sin, -sin, cos, 0, 0]), translate(-cx, -cy));
}
