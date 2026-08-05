import { multiply } from './matrix';
import { translate } from './translate';

/** 绕指定中心点缩放，返回缩放后的仿射变换矩阵 */
export function matrixScale(sx: number, sy: number, cx = 0, cy = 0) {
    return multiply(multiply(translate(cx, cy), [sx, 0, 0, sy, 0, 0]), translate(-cx, -cy));
}
