#!/usr/bin/env node
'use strict';

/**
 * 图标构建脚本 — 从定义生成 SVG + 字体 + CSS + JSON
 *
 * 流程：
 *   1. 从 definitions.ts 编译获取图标定义（或直接内联）
 *   2. 生成 SVG 文件到 src/icon/svg/
 *   3. 用 fantasticon 从 SVG 生成字体文件（ttf/woff2）
 *   4. 生成 icon-map.json（name → unicode 映射）
 *   5. 生成 q-icon.css 的图标 class 映射部分
 *
 * 用法：
 *   node scripts/build-icons.js
 *   npm run build:icons
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const ICON_DIR = path.join(ROOT, 'src', 'icon');
const SVG_DIR = path.join(ICON_DIR, 'svg');
const FONTS_DIR = path.join(ICON_DIR, 'fonts');

// ---- 笔画原语（与 strokes.ts 保持同步） ----
const P = {
    line: (x1, y1, x2, y2) => `M${x1} ${y1} L${x2} ${y2}`,
    polyline: (...pts) => {
        if (pts.length < 2) return '';
        return `M${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(p => `L${p[0]} ${p[1]}`).join(' ');
    },
    arc: (cx, cy, r, sa, ea) => {
        const x1 = +(cx + r * Math.cos(sa)).toFixed(2);
        const y1 = +(cy + r * Math.sin(sa)).toFixed(2);
        const x2 = +(cx + r * Math.cos(ea)).toFixed(2);
        const y2 = +(cy + r * Math.sin(ea)).toFixed(2);
        const largeArc = Math.abs(ea - sa) > Math.PI ? 1 : 0;
        const sweep = ea > sa ? 1 : 0;
        return `M${x1} ${y1} A${r} ${r} 0 ${largeArc} ${sweep} ${x2} ${y2}`;
    },
    circle: (cx, cy, r) => `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`,
    rect: (x, y, w, h, rx = 0) => {
        if (rx > 0) {
            return `M${x + rx} ${y} L${x + w - rx} ${y} A${rx} ${rx} 0 0 1 ${x + w} ${y + rx} L${x + w} ${y + h - rx} A${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h} L${x + rx} ${y + h} A${rx} ${rx} 0 0 1 ${x} ${y + h - rx} L${x} ${y + rx} A${rx} ${rx} 0 0 1 ${x + rx} ${y} Z`;
        }
        return `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`;
    },
    qcurve: (x1, y1, cx, cy, x2, y2) => `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`,
    ccurve: (x1, y1, c1x, c1y, c2x, c2y, x2, y2) => `M${x1} ${y1} C${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`,
    triangle: (x1, y1, x2, y2, x3, y3) => `M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z`,
    polygon: (...pts) => {
        if (pts.length < 2) return '';
        return `M${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map(p => `L${p[0]} ${p[1]}`).join(' ') + ' Z';
    },
    gear: (cx, cy, innerR, outerR, teeth) => {
        const step = (Math.PI * 2) / teeth;
        const toothW = step * 0.35;
        const gapW = step * 0.35;
        const transW = (step - toothW - gapW) / 2;
        const pts = [];
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

// ---- 图标定义（与 definitions.ts 保持同步） ----
const SW = 2;
const VIEWBOX = '0 0 24 24';

const icons = [
    // 状态确认
    { name: 'check', paths: [{ d: P.polyline([4, 12], [9, 17], [20, 6]) }] },
    { name: 'close', paths: [{ d: P.line(6, 6, 18, 18) }, { d: P.line(18, 6, 6, 18) }] },
    { name: 'add', paths: [{ d: P.line(12, 4, 12, 20) }, { d: P.line(4, 12, 20, 12) }] },
    { name: 'minus', paths: [{ d: P.line(4, 12, 20, 12) }] },
    // Checkbox/Radio
    { name: 'checkbox', paths: [{ d: P.rect(3, 3, 18, 18, 2) }] },
    { name: 'checkbox-check', paths: [{ d: P.rect(3, 3, 18, 18, 2) }, { d: P.polyline([7, 12], [10, 15], [17, 8]) }] },
    { name: 'radio', paths: [{ d: P.circle(12, 12, 9) }] },
    { name: 'radio-check', paths: [{ d: P.circle(12, 12, 9) }, { d: P.circle(12, 12, 4), fill: 'currentColor' }] },
    // 搜索/筛选
    { name: 'search', paths: [{ d: P.circle(10, 10, 6) }, { d: P.line(15, 15, 21, 21) }] },
    { name: 'filter', paths: [{ d: P.polygon([3, 4], [21, 4], [15, 12], [15, 20], [9, 20], [9, 12]) }] },
    // 方向箭头
    { name: 'arrow-down', paths: [{ d: P.line(12, 4, 12, 20) }, { d: P.polyline([6, 14], [12, 20], [18, 14]) }] },
    { name: 'arrow-up', paths: [{ d: P.line(12, 4, 12, 20) }, { d: P.polyline([6, 10], [12, 4], [18, 10]) }] },
    { name: 'arrow-left', paths: [{ d: P.line(4, 12, 20, 12) }, { d: P.polyline([10, 6], [4, 12], [10, 18]) }] },
    { name: 'arrow-right', paths: [{ d: P.line(4, 12, 20, 12) }, { d: P.polyline([14, 6], [20, 12], [14, 18]) }] },
    // 小箭头/展开标记
    { name: 'caret-down', paths: [{ d: P.triangle(6, 8, 18, 8, 12, 16), fill: 'currentColor' }], strokeWidth: 0 },
    { name: 'caret-up', paths: [{ d: P.triangle(6, 16, 18, 16, 12, 8), fill: 'currentColor' }], strokeWidth: 0 },
    { name: 'caret-left', paths: [{ d: P.triangle(8, 6, 8, 18, 16, 12), fill: 'currentColor' }], strokeWidth: 0 },
    { name: 'caret-right', paths: [{ d: P.triangle(16, 6, 16, 18, 8, 12), fill: 'currentColor' }], strokeWidth: 0 },
    // 编辑操作
    { name: 'edit', paths: [{ d: P.polygon([2, 22], [7, 19], [17, 9], [15, 7], [5, 17]) }] },
    { name: 'delete', paths: [{ d: P.line(4, 6, 20, 6) }, { d: P.polyline([7, 6], [7, 21], [17, 21], [17, 6]) }, { d: P.line(9, 3, 15, 3) }, { d: P.line(10, 10, 10, 17) }, { d: P.line(14, 10, 14, 17) }] },
    // 设置/菜单
    { name: 'settings', paths: [{ d: P.gear(12, 12, 6.5, 9.5, 8) }, { d: P.circle(12, 12, 3) }] },
    { name: 'menu', paths: [{ d: P.line(3, 6, 21, 6) }, { d: P.line(3, 12, 21, 12) }, { d: P.line(3, 18, 21, 18) }] },
    { name: 'more', paths: [{ d: P.circle(5, 12, 2.2), fill: 'currentColor' }, { d: P.circle(12, 12, 2.2), fill: 'currentColor' }, { d: P.circle(19, 12, 2.2), fill: 'currentColor' }], strokeWidth: 0 },
    // 导航
    { name: 'home', paths: [{ d: P.polyline([3, 12], [12, 3], [21, 12]) }, { d: P.polyline([5, 10], [5, 21], [9, 21], [9, 14], [15, 14], [15, 21], [19, 21], [19, 10]) }] },
    { name: 'refresh', paths: [{ d: P.arc(12, 12, 7, 0, Math.PI * 1.5) + ' M15 2 L12 5 M18 5 L12 5' }] },
];

// ---- Unicode 映射（私用区 E900-E9FF） ----
const BASE_UNICODE = 0xE900;

function getUnicode(index) {
    return BASE_UNICODE + index;
}

// ---- 生成 SVG 文件 ----
function generateSvgFiles() {
    console.log('\n📝 生成 SVG 文件...');

    // 清除旧 SVG 文件
    if (fs.existsSync(SVG_DIR)) {
        const oldFiles = fs.readdirSync(SVG_DIR).filter(f => f.endsWith('.svg'));
        for (const f of oldFiles) {
            fs.unlinkSync(path.join(SVG_DIR, f));
        }
        console.log(`  清除 ${oldFiles.length} 个旧 SVG 文件`);
    } else {
        fs.mkdirSync(SVG_DIR, { recursive: true });
    }

    for (const icon of icons) {
        const sw = icon.strokeWidth !== undefined ? icon.strokeWidth : SW;
        const paths = icon.paths.map(p => {
            const fill = p.fill || 'none';
            const psw = p.strokeWidth || sw;
            return `  <path d="${p.d}" fill="${fill}" stroke="currentColor" stroke-width="${psw}" stroke-linecap="round" stroke-linejoin="round"/>`;
        }).join('\n');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}">\n${paths}\n</svg>`;
        fs.writeFileSync(path.join(SVG_DIR, `${icon.name}.svg`), svg);
    }

    console.log(`  ✓ 生成 ${icons.length} 个 SVG 文件`);
}

// ---- 生成字体文件（用 fantasticon） ----
async function generateFontFiles() {
    console.log('\n🔤 生成字体文件...');

    if (!fs.existsSync(FONTS_DIR)) {
        fs.mkdirSync(FONTS_DIR, { recursive: true });
    }

    // 生成 icon-map.json
    const iconMap = {};
    for (let i = 0; i < icons.length; i++) {
        const hex = getUnicode(i).toString(16).toUpperCase();
        iconMap[icons[i].name] = hex;
    }
    fs.writeFileSync(path.join(FONTS_DIR, 'icon-map.json'), JSON.stringify(iconMap, null, 2));
    console.log(`  ✓ 生成 icon-map.json (${icons.length} 个映射)`);

    // 用 fantasticon 生成字体
    try {
        const { generateFonts } = require('fantasticon');
        const result = await generateFonts({
            name: 'q-icon',
            prefix: 'q-icon',
            inputDir: SVG_DIR,
            outputDir: FONTS_DIR,
            fontTypes: ['ttf', 'woff2', 'woff'],
            assetTypes: ['css'],
            normalize: true,
            fontHeight: 1000,
            descent: 150,
            tag: 'i',
            templates: {},
        });

        console.log(`  ✓ fantasticon 生成字体完成`);
        if (result.codepoints) {
            // 更新 icon-map.json 使用 fantasticon 的 codepoints
            const codepoints = {};
            for (const [name, cp] of Object.entries(result.codepoints)) {
                codepoints[name] = cp.toString(16).toUpperCase();
            }
            fs.writeFileSync(path.join(FONTS_DIR, 'icon-map.json'), JSON.stringify(codepoints, null, 2));
            console.log(`  ✓ 更新 icon-map.json (fantasticon codepoints)`);
        }
    } catch (e) {
        console.log(`  ⚠ fantasticon 失败: ${e.message}`);
        console.log(`  → 回退到 svg2ttf 方案...`);
        await generateFontFallback();
    }
}

// ---- 回退方案：用 svg2ttf 手动生成 ----
async function generateFontFallback() {
    const SvgPath = require('svgpath');
    const svg2ttf = require('svg2ttf');

    const UNITS_PER_EM = 1000;
    const ASCENT = 850;
    const DESCENT = -150;

    function convertD(svgD) {
        const scale = UNITS_PER_EM / 24;
        const matrixStr = `matrix(${scale},0,0,${-scale},0,${ASCENT})`;
        return new SvgPath(svgD).abs().unshort().transform(matrixStr).toString();
    }

    let svgFont = `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg">
<defs>
  <font id="QIcon" horiz-adv-x="${UNITS_PER_EM}">
    <font-face font-family="QIcon" font-weight="400" units-per-em="${UNITS_PER_EM}" ascent="${ASCENT}" descent="${DESCENT}"/>
    <missing-glyph horiz-adv-x="${UNITS_PER_EM}"/>
`;

    for (let i = 0; i < icons.length; i++) {
        const icon = icons[i];
        const unicode = getUnicode(i);
        const allD = icon.paths.map(p => convertD(p.d)).join(' ');
        svgFont += `    <glyph glyph-name="${icon.name}" unicode="&#x${unicode.toString(16).toUpperCase()};" horiz-adv-x="${UNITS_PER_EM}" d="${allD}"/>\n`;
    }

    svgFont += `  </font>\n</defs>\n</svg>`;

    const ttf = svg2ttf(svgFont, {});
    fs.writeFileSync(path.join(FONTS_DIR, 'q-icon.ttf'), Buffer.from(ttf.buffer));
    console.log(`  ✓ TTF 生成完成 (svg2ttf 回退方案)`);
}

// ---- 生成 q-icon.css 图标映射部分 ----
function generateCssMapping() {
    console.log('\n🎨 生成 CSS 映射...');

    const iconMap = JSON.parse(fs.readFileSync(path.join(FONTS_DIR, 'icon-map.json'), 'utf-8'));
    let css = '';

    for (const icon of icons) {
        const hex = iconMap[icon.name];
        if (hex) {
            css += `.q-icon-${icon.name}:before { content: "\\${hex.toLowerCase()}"; }\n`;
        }
    }

    // 写入单独文件，供 q-icon.css 导入或手动合并
    fs.writeFileSync(path.join(ICON_DIR, 'icon-classes.css'), css);
    console.log(`  ✓ 生成 icon-classes.css (${icons.length} 个 class)`);
}

// ---- 主流程 ----
async function main() {
    console.log('========================================');
    console.log('  图标构建系统 — QimenJS');
    console.log('========================================');
    console.log(`图标数量: ${icons.length}`);

    generateSvgFiles();
    await generateFontFiles();

    console.log('\n✅ SVG + icon-map.json 构建完成！');
    console.log(`  SVG:  ${SVG_DIR}`);
    console.log(`  JSON: ${path.join(FONTS_DIR, 'icon-map.json')}`);
    console.log('  (CSS 映射由 build-icon-font.js 自动更新到 q-icon.css)');
}

main().catch(e => {
    console.error('❌ 构建失败:', e);
    process.exit(1);
});
