/**
 * QIcon — 运行时图标 API
 *
 * 提供两种使用方式：
 *   1. 字体图标：<i class="q-icon-check">（通过 CSS ::before + content）
 *   2. Inline SVG：QIcon.svg('check') 返回 SVG 字符串，可直接注入 DOM
 *
 * Inline SVG 的优势：
 *   - 尺寸精确可控（width/height 固定 px），不受 font-size/em-box 影响
 *   - 颜色通过 currentColor 跟随文字颜色
 *   - 无字体加载延迟
 */

import { iconMap, icons } from './definitions';
import { iconToInlineSvg, IconDef } from './strokes';

export class QIcon {
    /** 获取 inline SVG 字符串 */
    static svg(name: string, size = 16): string {
        const icon = iconMap[name];
        if (!icon) {
            console.warn(`QIcon: 图标 "${name}" 不存在`);
            return '';
        }
        return iconToInlineSvg(icon, size);
    }

    /** 获取图标定义 */
    static get(name: string): IconDef | undefined {
        return iconMap[name];
    }

    /** 获取所有图标名称 */
    static names(): string[] {
        return icons.map(i => i.name);
    }

    /** 判断图标是否存在 */
    static has(name: string): boolean {
        return name in iconMap;
    }
}
