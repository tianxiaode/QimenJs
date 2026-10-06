/**
 * 笔画原语系统 — 中文字体笔画模式
 *
 * 中文字体笔画可归类为：
 *   直线：横（一）、竖（丨）、撇（丿）、捺（丶）
 *   弧线：弯（弯曲转折）、钩（末端钩）、折（直角转折）
 *
 * SVG path 对应：
 *   直线 → L (lineto)
 *   弧线 → A (arc) / Q (quadratic bezier) / C (cubic bezier)
 *
 * 所有图标基于 16x16 viewBox，用这些原语组合生成。
 */

/** 图标定义 */
export interface IconDef {
    name: string;
    paths: PathDef[];
    viewBox?: string;
    strokeWidth?: number;
}

/** 路径定义 */
export interface PathDef {
    d: string;
    fill?: 'currentColor' | 'none';
    strokeWidth?: number;
}

/** 笔画原语生成函数 */
export const P = {
    /** 横/竖/撇/捺 — 直线 */
    line(x1: number, y1: number, x2: number, y2: number): string {
        return `M${x1} ${y1} L${x2} ${y2}`;
    },

    /** 折 — 多段折线 */
    polyline(...pts: [number, number][]): string {
        if (pts.length < 2) return '';
        return `M${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(p => `L${p[0]} ${p[1]}`).join(' ');
    },

    /** 弯/钩 — 弧线 */
    arc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
        const x1 = +(cx + r * Math.cos(startAngle)).toFixed(2);
        const y1 = +(cy + r * Math.sin(startAngle)).toFixed(2);
        const x2 = +(cx + r * Math.cos(endAngle)).toFixed(2);
        const y2 = +(cy + r * Math.sin(endAngle)).toFixed(2);
        const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
        const sweep = endAngle > startAngle ? 1 : 0;
        return `M${x1} ${y1} A${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
    },

    /** 圆 — 全弧线闭合 */
    circle(cx: number, cy: number, r: number): string {
        return `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
    },

    /** 矩形 — 四条直线闭合 */
    rect(x: number, y: number, w: number, h: number, rx = 0): string {
        if (rx > 0) {
            return `M${x + rx} ${y} L${x + w - rx} ${y} A${rx} ${rx} 0 0 1 ${x + w} ${y + rx} L${x + w} ${y + h - rx} A${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h} L${x + rx} ${y + h} A${rx} ${rx} 0 0 1 ${x} ${y + h - rx} L${x} ${y + rx} A${rx} ${rx} 0 0 1 ${x + rx} ${y} Z`;
        }
        return `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`;
    },

    /** 二次贝塞尔 — 弯钩 */
    qcurve(x1: number, y1: number, cx: number, cy: number, x2: number, y2: number): string {
        return `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
    },

    /** 三次贝塞尔 — 复杂弧线 */
    ccurve(x1: number, y1: number, c1x: number, c1y: number, c2x: number, c2y: number, x2: number, y2: number): string {
        return `M${x1} ${y1} C${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
    },

    /** 三角形 — 实心填充 */
    triangle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): string {
        return `M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z`;
    },

    /** 多边形 — 闭合折线 */
    polygon(...pts: [number, number][]): string {
        if (pts.length < 2) return '';
        return `M${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(p => `L${p[0]} ${p[1]}`).join(' ') + ' Z';
    },

    /** 齿轮 — 带齿凸起的圆轮廓 */
    gear(cx: number, cy: number, innerR: number, outerR: number, teeth: number): string {
        const step = (Math.PI * 2) / teeth;
        const toothW = step * 0.35;
        const gapW = step * 0.35;
        const transW = (step - toothW - gapW) / 2;

        const pts: [number, number][] = [];
        for (let i = 0; i < teeth; i++) {
            const base = i * step - Math.PI / 2;
            const a1 = base + gapW;
            const a2 = a1 + transW;
            const a3 = a2 + toothW;
            const a4 = a3 + transW;

            pts.push([+(cx + innerR * Math.cos(a1)).toFixed(2), +(cy + innerR * Math.sin(a1)).toFixed(2)]);
            pts.push([+(cx + outerR * Math.cos(a2)).toFixed(2), +(cy + outerR * Math.sin(a2)).toFixed(2)]);
            pts.push([+(cx + outerR * Math.cos(a3)).toFixed(2), +(cy + outerR * Math.sin(a3)).toFixed(2)]);
            pts.push([+(cx + innerR * Math.cos(a4)).toFixed(2), +(cy + innerR * Math.sin(a4)).toFixed(2)]);
        }
        return 'M' + pts.map(p => `${p[0]} ${p[1]}`).join(' L') + ' Z';
    },
};

/** 默认 viewBox */
export const DEFAULT_VIEWBOX = '0 0 24 24';

/** 默认描边宽度 */
export const DEFAULT_STROKE_WIDTH = 2;

/** 将 IconDef 编译为 SVG 文件内容 */
export function iconToSvg(icon: IconDef): string {
    const viewBox = icon.viewBox || DEFAULT_VIEWBOX;
    const sw = icon.strokeWidth || DEFAULT_STROKE_WIDTH;
    const paths = icon.paths.map(p => {
        const fill = p.fill || 'none';
        const psw = p.strokeWidth || sw;
        return `  <path d="${p.d}" fill="${fill}" stroke="currentColor" stroke-width="${psw}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('\n');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">\n${paths}\n</svg>`;
}

/** 将 IconDef 编译为 inline SVG 字符串（用于运行时注入 DOM） */
export function iconToInlineSvg(icon: IconDef, size = 16): string {
    const viewBox = icon.viewBox || DEFAULT_VIEWBOX;
    const sw = icon.strokeWidth || DEFAULT_STROKE_WIDTH;
    const paths = icon.paths.map(p => {
        const fill = p.fill || 'none';
        const psw = p.strokeWidth || sw;
        return `<path d="${p.d}" fill="${fill}" stroke="currentColor" stroke-width="${psw}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}">${paths}</svg>`;
}
