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
const SW = 42;
const VIEWBOX = '0 0 512 512';

const icons = [
    // 状态确认
    { name: 'check', paths: [{ d: P.polyline([85, 267], [192, 374], [427, 139]) }] },
    { name: 'close', paths: [{ d: P.line(64, 64, 448, 448) }, { d: P.line(448, 64, 64, 448) }] },
    { name: 'add', paths: [{ d: P.line(256, 85, 256, 427) }, { d: P.line(85, 256, 427, 256) }] },
    { name: 'minus', paths: [{ d: P.line(85, 256, 427, 256) }] },
    // Checkbox/Radio
    { name: 'checkbox', paths: [{ d: P.rect(64, 64, 384, 384, 43) }] },
    { name: 'checkbox-check', paths: [{ d: P.rect(64, 64, 384, 384, 43) }, { d: P.polyline([149, 256], [213, 320], [363, 171]) }] },
    { name: 'radio', paths: [{ d: P.circle(256, 256, 192) }] },
    { name: 'radio-check', paths: [{ d: P.circle(256, 256, 192) }, { d: P.circle(256, 256, 85), fill: 'currentColor' }] },
    // 搜索/筛选
    { name: 'search', paths: [{ d: P.circle(256, 256, 170) }, { d: P.line(384, 384, 448, 448) }] },
    { name: 'filter', paths: [{ d: P.polygon([64, 85], [448, 85], [320, 256], [320, 427], [192, 427], [192, 256]) }] },
    // 方向箭头
    { name: 'arrow-down', paths: [{ d: P.line(256, 64, 256, 448) }, { d: P.polyline([64, 320], [256, 448], [448, 320]) }] },
    { name: 'arrow-up', paths: [{ d: P.line(256, 64, 256, 448) }, { d: P.polyline([64, 192], [256, 64], [448, 192]) }] },
    { name: 'arrow-left', paths: [{ d: P.line(64, 256, 448, 256) }, { d: P.polyline([192, 64], [64, 256], [192, 448]) }] },
    { name: 'arrow-right', paths: [{ d: P.line(64, 256, 448, 256) }, { d: P.polyline([320, 64], [448, 256], [320, 448]) }] },
    // 小箭头/展开标记
    { name: 'caret-down', paths: [{ d: P.triangle(64, 149, 448, 149, 256, 363), fill: 'currentColor' }], strokeWidth: 0 },
    { name: 'caret-up', paths: [{ d: P.triangle(64, 363, 448, 363, 256, 149), fill: 'currentColor' }], strokeWidth: 0 },
    { name: 'caret-left', paths: [{ d: P.triangle(149, 64, 149, 448, 363, 256), fill: 'currentColor' }], strokeWidth: 0 },
    { name: 'caret-right', paths: [{ d: P.triangle(363, 64, 363, 448, 149, 256), fill: 'currentColor' }], strokeWidth: 0 },
    // V字箭头（chevron，线条版）
    { name: 'chevron-down', paths: [{ d: P.polyline([64, 171], [256, 341], [448, 171]) }] },
    { name: 'chevron-up', paths: [{ d: P.polyline([64, 341], [256, 171], [448, 341]) }] },
    { name: 'chevron-left', paths: [{ d: P.polyline([171, 64], [341, 256], [171, 448]) }] },
    { name: 'chevron-right', paths: [{ d: P.polyline([341, 64], [171, 256], [341, 448]) }] },
    // 编辑操作
    { name: 'edit', paths: [{ d: P.polygon([363, 85], [427, 149], [149, 427], [85, 363]) }, { d: P.line(85, 363, 149, 427) }] },
    { name: 'delete', paths: [{ d: 'M192 80 A52 52 0 0 0 320 80' }, { d: P.line(80, 128, 432, 128) }, { d: P.polyline([128, 170], [128, 416], [384, 416], [384, 170]) }, { d: P.line(192, 210, 192, 376) }, { d: P.line(256, 210, 256, 376) }, { d: P.line(320, 210, 320, 376) }] },
    // 设置/菜单
    { name: 'settings', paths: [{ d: P.gear(256, 256, 139, 203, 8) }, { d: P.circle(256, 256, 64) }] },
    { name: 'menu', paths: [{ d: P.line(64, 128, 448, 128) }, { d: P.line(64, 256, 448, 256) }, { d: P.line(64, 384, 448, 384) }] },
    { name: 'more', paths: [{ d: P.circle(107, 256, 32), fill: 'currentColor' }, { d: P.circle(256, 256, 32), fill: 'currentColor' }, { d: P.circle(405, 256, 32), fill: 'currentColor' }], strokeWidth: 0 },
    // 导航
    { name: 'home', paths: [{ d: P.polyline([64, 256], [256, 64], [448, 256]) }, { d: P.polyline([107, 213], [107, 448], [192, 448], [192, 299], [320, 299], [320, 448], [405, 448], [405, 213]) }] },
    { name: 'refresh', paths: [{ d: P.arc(256, 256, 149, Math.PI * 0.25, Math.PI * 1.75) + ' M320 192 L405 192 M405 107 L405 192' }] },
    // 用户/情感
    { name: 'user', paths: [{ d: P.circle(256, 155, 75) }, { d: 'M107 411 A149 149 0 0 1 405 411' }, { d: P.line(85, 432, 427, 432) }] },
    { name: 'heart', paths: [{ d: 'M256 438 C171 352 85 267 85 182 C85 118 149 75 256 160 C363 75 427 118 427 182 C427 267 341 352 256 438 Z' }] },
    { name: 'star', paths: [{ d: P.polygon([256, 96], [299, 203], [427, 224], [320, 288], [363, 416], [256, 331], [149, 416], [192, 288], [85, 224], [213, 203]) }] },
    // 状态提示
    { name: 'warning', paths: [{ d: P.polygon([256, 75], [448, 438], [64, 438]) }, { d: P.line(256, 203, 256, 310) }, { d: P.circle(256, 374, 21), fill: 'currentColor' }] },
    { name: 'info', paths: [{ d: P.circle(256, 256, 192) }, { d: P.circle(256, 149, 26), fill: 'currentColor' }, { d: P.line(256, 213, 256, 341) }] },
    // 文件操作
    { name: 'save', paths: [{ d: P.rect(64, 64, 384, 384, 43) }, { d: P.line(64, 192, 448, 192) }, { d: P.rect(149, 64, 213, 128) }, { d: P.rect(149, 277, 213, 171) }] },
    { name: 'folder', paths: [{ d: P.polygon([64, 138], [64, 416], [448, 416], [448, 138], [277, 138], [235, 96], [64, 96]) }] },
    { name: 'folder-open', paths: [{ d: P.polyline([64, 405], [64, 96], [192, 96], [235, 139], [448, 139], [448, 234]) }, { d: P.polygon([64, 405], [149, 234], [448, 234], [363, 405]) }] },
    // 天体/世界
    { name: 'sun', paths: [{ d: P.circle(256, 256, 85) }, { d: P.line(256, 43, 256, 107) }, { d: P.line(256, 405, 256, 469) }, { d: P.line(43, 256, 107, 256) }, { d: P.line(405, 256, 469, 256) }, { d: P.line(107, 107, 149, 149) }, { d: P.line(363, 363, 405, 405) }, { d: P.line(107, 405, 149, 363) }, { d: P.line(363, 149, 405, 107) }] },
    { name: 'moon', paths: [{ d: 'M149 128 A180 180 0 1 0 363 384 A140 140 0 0 1 149 128 Z' }] },
    { name: 'dark', paths: [{ d: 'M149 128 A180 180 0 1 0 363 384 A140 140 0 0 1 149 128 Z', fill: 'currentColor' }], strokeWidth: 0 },
    { name: 'palette', paths: [{ d: 'M427 363 A192 192 0 1 0 213 448 A96 96 0 0 1 427 363 Z' }, { d: P.circle(171, 171, 36), fill: 'currentColor' }, { d: P.circle(320, 149, 36), fill: 'currentColor' }, { d: P.circle(149, 320, 36), fill: 'currentColor' }] },
    { name: 'globe', paths: [{ d: P.circle(256, 256, 192) }, { d: P.line(64, 256, 448, 256) }, { d: P.polyline([256, 64], [171, 256], [256, 448]) }, { d: P.polyline([256, 64], [341, 256], [256, 448]) }] },
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
        const vb = icon.viewBox || VIEWBOX;
        const paths = icon.paths.map(p => {
            const fill = p.fill || 'none';
            const psw = p.strokeWidth || sw;
            return `  <path d="${p.d}" fill="${fill}" stroke="currentColor" stroke-width="${psw}" stroke-linecap="round" stroke-linejoin="round"/>`;
        }).join('\n');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">\n${paths}\n</svg>`;
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

    function convertD(svgD, vbW) {
        const scale = UNITS_PER_EM / vbW;
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
        const vb = icon.viewBox || VIEWBOX;
        const vbW = parseFloat(vb.split(' ')[2]) || 24;
        const allD = icon.paths.map(p => convertD(p.d, vbW)).join(' ');
        svgFont += `    <glyph glyph-name="${icon.name}" unicode="&#x${unicode.toString(16).toUpperCase()};" horiz-adv-x="${UNITS_PER_EM}" d="${allD}"/>\n`;
    }

    svgFont += `  </font>\n</defs>\n</svg>`;

    const ttf = svg2ttf(svgFont, {});
    fs.writeFileSync(path.join(FONTS_DIR, 'q-icon.ttf'), Buffer.from(ttf.buffer));
    console.log(`  ✓ TTF 生成完成 (svg2ttf 回退方案)`);
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
