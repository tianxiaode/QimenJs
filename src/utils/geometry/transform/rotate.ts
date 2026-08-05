import { multiply } from './matrix';
import { translate } from './translate';

/** 绕指定中心点旋转，返回旋转后的仿射变换矩阵 */
export function rotate(angle: number, cx = 0, cy = 0) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    return multiply(multiply(translate(cx, cy), [cos, sin, -sin, cos, 0, 0]), translate(-cx, -cy));
}
