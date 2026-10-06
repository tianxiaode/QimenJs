/**
 * 从 SVG 文件生成图标字体
 *
 * 输入：src/icon/svg/*.svg
 * 输出：src/icon/fonts/q-icon.ttf / q-icon.woff2
 *
 * 流程：
 *   1. 读取 svg/ 目录下所有 SVG 文件
 *   2. 用 svgpath 库正确解析 SVG path（处理 flag 参数拼接等边界情况）
 *   3. 将 stroke 路径预处理为 fill 路径（stroke offset）
 *   4. 坐标系变换：SVG (0,0)-(24,24) y向下 → 字体 (0,0)-(1000,1000) y向上
 *   5. 生成 SVG 字体 → svg2ttf → TTF → ttf2woff2 → WOFF2
 */

const fs = require('fs');
const path = require('path');
const SvgPath = require('svgpath');

const svgDir = path.resolve(__dirname, '../src/icon/svg');
const outputDir = path.resolve(__dirname, '../src/icon/fonts');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 动态生成 Unicode 映射：从 SVG 文件列表按顺序分配 E900+
const svgFilesForMap = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg')).map(f => f.replace('.svg', '')).sort();
const iconUnicodeMap = {};
const BASE_UNICODE = 0xE900;
for (let i = 0; i < svgFilesForMap.length; i++) {
  iconUnicodeMap[svgFilesForMap[i]] = BASE_UNICODE + i;
}

const UNITS_PER_EM = 1000;
const ASCENT = 850;
const DESCENT = -150;

/**
 * 用 svgpath 库解析 SVG path d 属性
 * 返回绝对坐标命令数组 [{ cmd, params }]
 */
function parseSvgPath(d) {
  const commands = [];
  new SvgPath(d).iterate(function(cmd, x, y, args) {
    // svgpath iterate 回调：cmd 是命令字母，x/y 是当前点，args 是参数
    // 但实际上 svgpath 的 iterate 签名是 (segment, x, y, args)
    // segment 是 [cmd, ...params] 数组
  });
  // svgpath 的 iterate 不太方便，用 .segments 属性
  const sp = new SvgPath(d);
  // 转为绝对坐标
  const abs = sp.abs().unshort().segments;
  for (const seg of abs) {
    const cmd = seg[0];
    const params = seg.slice(1);
    commands.push({ cmd, params });
  }
  return commands;
}

/**
 * 将绝对坐标命令序列转换为点列表（用于 stroke offset）
 * 将曲线细分为直线段
 */
function commandsToSubPaths(absCommands) {
  const subPaths = [];
  let current = [];
  let cx = 0, cy = 0;

  for (const { cmd, params } of absCommands) {
    switch (cmd) {
      case 'M':
        if (current.length > 0) subPaths.push(current);
        current = [{ x: params[0], y: params[1], type: 'M' }];
        cx = params[0]; cy = params[1];
        break;
      case 'L':
        current.push({ x: params[0], y: params[1], type: 'L', fromX: cx, fromY: cy });
        cx = params[0]; cy = params[1];
        break;
      case 'C': {
        const steps = 8;
        const x0 = cx, y0 = cy;
        for (let i = 0; i < params.length; i += 6) {
          const x1 = params[i], y1 = params[i+1];
          const x2 = params[i+2], y2 = params[i+3];
          const x3 = params[i+4], y3 = params[i+5];
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const mt = 1 - t;
            const px = mt*mt*mt*x0 + 3*mt*mt*t*x1 + 3*mt*t*t*x2 + t*t*t*x3;
            const py = mt*mt*mt*y0 + 3*mt*mt*t*y1 + 3*mt*t*t*y2 + t*t*t*y3;
            current.push({ x: px, y: py, type: 'L', fromX: cx, fromY: cy });
            cx = px; cy = py;
          }
        }
        break;
      }
      case 'Q': {
        const steps = 8;
        const x0 = cx, y0 = cy;
        for (let i = 0; i < params.length; i += 4) {
          const x1 = params[i], y1 = params[i+1];
          const x2 = params[i+2], y2 = params[i+3];
          for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const mt = 1 - t;
            const px = mt*mt*x0 + 2*mt*t*x1 + t*t*x2;
            const py = mt*mt*y0 + 2*mt*t*y1 + t*t*y2;
            current.push({ x: px, y: py, type: 'L', fromX: cx, fromY: cy });
            cx = px; cy = py;
          }
        }
        break;
      }
      case 'A': {
        const r = params[0];
        const largeArc = params[3];
        const sweep = params[4];
        const ex = params[5];
        const ey = params[6];
        const x1 = cx, y1 = cy;

        const x1p = (x1 - ex) / 2;
        const y1p = (y1 - ey) / 2;
        const r2 = r * r;
        const denom = x1p * x1p + y1p * y1p;

        if (denom === 0 || r2 < denom) {
          current.push({ x: ex, y: ey, type: 'L', fromX: cx, fromY: cy });
          cx = ex; cy = ey;
          break;
        }

        const factor = Math.sqrt(Math.max(0, r2 / denom - 1));
        const svgSign = (largeArc !== sweep) ? 1 : -1;
        const cxp = svgSign * factor * y1p;
        const cyp = svgSign * factor * (-x1p);
        const centerX = (x1 + ex) / 2 + cxp;
        const centerY = (y1 + ey) / 2 + cyp;

        const startAngle = Math.atan2(y1 - centerY, x1 - centerX);
        const endAngle = Math.atan2(ey - centerY, ex - centerX);

        let angleSweep;
        if (sweep === 1) {
          angleSweep = endAngle - startAngle;
          if (angleSweep < 0) angleSweep += Math.PI * 2;
        } else {
          angleSweep = startAngle - endAngle;
          if (angleSweep < 0) angleSweep += Math.PI * 2;
        }

        if (largeArc === 1 && angleSweep < Math.PI) {
          angleSweep = Math.PI * 2 - angleSweep;
        } else if (largeArc === 0 && angleSweep > Math.PI) {
          angleSweep = Math.PI * 2 - angleSweep;
        }

        const steps = Math.max(8, Math.ceil(angleSweep / (Math.PI / 36)));
        const direction = (sweep === 1) ? 1 : -1;

        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const angle = startAngle + direction * angleSweep * t;
          const px = centerX + r * Math.cos(angle);
          const py = centerY + r * Math.sin(angle);
          current.push({ x: px, y: py, type: 'L', fromX: cx, fromY: cy });
          cx = px; cy = py;
        }
        break;
      }
      case 'Z':
        current.push({ type: 'Z' });
        subPaths.push(current);
        current = [];
        break;
    }
  }
  if (current.length > 0) subPaths.push(current);
  return subPaths;
}

/**
 * 对子路径做 stroke → fill 转换（tubes 方案）
 * 每条线段 → 矩形（两侧偏移 halfWidth）
 * 每个顶点 → 圆（半径 halfWidth，实现 round join/cap）
 */
function strokeOffsetToFillD(subPaths, halfWidth) {
  if (halfWidth <= 0) return '';
  let d = '';
  for (const subPath of subPaths) {
    const verts = [];
    let isClosed = false;
    for (const pt of subPath) {
      if (pt.type === 'Z') { isClosed = true; continue; }
      verts.push({ x: pt.x, y: pt.y });
    }
    if (verts.length < 2) continue;

    const n = verts.length;
    const segCount = isClosed ? n : n - 1;

    for (let i = 0; i < segCount; i++) {
      const p1 = verts[i];
      const p2 = verts[(i + 1) % n];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 0.001) continue;

      const nx = -dy / len * halfWidth;
      const ny = dx / len * halfWidth;

      d += ` M${(p1.x + nx).toFixed(2)} ${(p1.y + ny).toFixed(2)}`;
      d += ` L${(p2.x + nx).toFixed(2)} ${(p2.y + ny).toFixed(2)}`;
      d += ` L${(p2.x - nx).toFixed(2)} ${(p2.y - ny).toFixed(2)}`;
      d += ` L${(p1.x - nx).toFixed(2)} ${(p1.y - ny).toFixed(2)}`;
      d += 'Z';
    }

    for (let i = 0; i < n; i++) {
      d += ' ' + circleD(verts[i].x, verts[i].y, halfWidth);
    }
  }
  return d.trim();
}

function circleD(cx, cy, r) {
  if (r <= 0) return '';
  return `M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy}Z`;
}

function rectD(x, y, w, h, rx) {
  if (rx > 0) {
    return `M${x + rx},${y} L${x + w - rx},${y} A${rx},${rx} 0 0,1 ${x + w},${y + rx} L${x + w},${y + h - rx} A${rx},${rx} 0 0,1 ${x + w - rx},${y + h} L${x + rx},${y + h} A${rx},${rx} 0 0,1 ${x},${y + h - rx} L${x},${y + rx} A${rx},${rx} 0 0,1 ${x + rx},${y}Z`;
  }
  return `M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h}Z`;
}

/**
 * 将 SVG 坐标系的 path d 转换为字体坐标系
 * 使用 svgpath 库进行坐标变换
 */
function convertDToFont(svgD, vbW, vbH) {
  const scale = UNITS_PER_EM / vbW;
  // svgpath transform: matrix(a, b, c, d, e, f)
  // x' = a*x + c*y + e, y' = b*x + d*y + f
  // SVG → 字体：x' = x * scale, y' = ASCENT - y * scale
  // ASCENT=850 而非 UNITS_PER_EM=1000，使图标在 ascent/descent 范围内居中
  const matrixStr = `matrix(${scale},0,0,${-scale},0,${ASCENT})`;
  const transformed = new SvgPath(svgD)
    .abs()
    .unshort()
    .transform(matrixStr)
    .toString();
  return transformed;
}

/**
 * 从 SVG 内容提取所有元素，转换为 SVG 字体 glyph 的 d 属性
 */
function svgToGlyphD(svgContent, vbW, vbH) {
  const swMatch = svgContent.match(/stroke-width="([^"]+)"/);
  const defaultSW = swMatch ? parseFloat(swMatch[1]) : 1.5;

  let allD = '';

  // 提取 path 元素
  const pathRegex = /<path([^>]*?)\/?>/g;
  let pathMatch;
  while ((pathMatch = pathRegex.exec(svgContent)) !== null) {
    const attrs = pathMatch[1];
    const dMatch = attrs.match(/\bd="([^"]*)"/);
    const fillMatch = attrs.match(/\bfill="([^"]*)"/);
    const strokeMatch = attrs.match(/\bstroke="([^"]*)"/);
    const swAttrMatch = attrs.match(/\bstroke-width="([^"]*)"/);
    const sw = swAttrMatch ? parseFloat(swAttrMatch[1]) : defaultSW;

    if (!dMatch) continue;

    const isStroke = strokeMatch && strokeMatch[1] !== 'none';
    const isFill = fillMatch && fillMatch[1] !== 'none';

    let pathD = dMatch[1];

    if (isStroke && !isFill) {
      // stroke 路径：用 svgpath 解析，做 stroke offset
      const absCommands = parseSvgPath(pathD);
      const subPaths = commandsToSubPaths(absCommands);
      pathD = strokeOffsetToFillD(subPaths, sw / 2);
    }

    // 坐标系变换
    const fontD = convertDToFont(pathD, vbW, vbH);
    if (allD) allD += ' ';
    allD += fontD;
  }

  // 提取 circle 元素
  const circleRegex = /<circle([^>]*?)\/?>/g;
  let circleMatch;
  while ((circleMatch = circleRegex.exec(svgContent)) !== null) {
    const attrs = circleMatch[1];
    const cxM = attrs.match(/\bcx="([^"]*)"/);
    const cyM = attrs.match(/\bcy="([^"]*)"/);
    const rM = attrs.match(/\br="([^"]*)"/);
    const fillM = attrs.match(/\bfill="([^"]*)"/);
    const strokeM = attrs.match(/\bstroke="([^"]*)"/);

    if (cxM && cyM && rM) {
      const cx = parseFloat(cxM[1]);
      const cy = parseFloat(cyM[1]);
      const r = parseFloat(rM[1]);
      const isStroke = strokeM && strokeM[1] !== 'none';
      const isFill = fillM && fillM[1] !== 'none';

      let d;
      if (isStroke && !isFill) {
        const outerR = r + defaultSW / 2;
        const innerR = Math.max(0, r - defaultSW / 2);
        d = circleD(cx, cy, outerR) + ' ' + circleD(cx, cy, innerR);
      } else {
        d = circleD(cx, cy, r);
      }
      const fontD = convertDToFont(d, vbW, vbH);
      if (allD) allD += ' ';
      allD += fontD;
    }
  }

  // 提取 rect 元素
  const rectRegex = /<rect([^>]*?)\/?>/g;
  let rectMatch;
  while ((rectMatch = rectRegex.exec(svgContent)) !== null) {
    const attrs = rectMatch[1];
    const xM = attrs.match(/\bx="([^"]*)"/);
    const yM = attrs.match(/\by="([^"]*)"/);
    const wM = attrs.match(/\bwidth="([^"]*)"/);
    const hM = attrs.match(/\bheight="([^"]*)"/);
    const rxM = attrs.match(/\brx="([^"]*)"/);
    const fillM = attrs.match(/\bfill="([^"]*)"/);
    const strokeM = attrs.match(/\bstroke="([^"]*)"/);

    if (wM && hM) {
      const x = xM ? parseFloat(xM[1]) : 0;
      const y = yM ? parseFloat(yM[1]) : 0;
      const w = parseFloat(wM[1]);
      const h = parseFloat(hM[1]);
      const rx = rxM ? parseFloat(rxM[1]) : 0;
      const isStroke = strokeM && strokeM[1] !== 'none';
      const isFill = fillM && fillM[1] !== 'none';

      let d;
      if (isStroke && !isFill) {
        const sw2 = defaultSW / 2;
        const outerD = rectD(x - sw2, y - sw2, w + defaultSW, h + defaultSW, rx + sw2);
        const innerD = rectD(x + sw2, y + sw2, w - defaultSW, h - defaultSW, Math.max(0, rx - sw2));
        d = outerD + ' ' + innerD;
      } else {
        d = rectD(x, y, w, h, rx);
      }
      const fontD = convertDToFont(d, vbW, vbH);
      if (allD) allD += ' ';
      allD += fontD;
    }
  }

  // 提取 line 元素
  const lineRegex = /<line([^>]*?)\/?>/g;
  let lineMatch;
  while ((lineMatch = lineRegex.exec(svgContent)) !== null) {
    const attrs = lineMatch[1];
    const x1M = attrs.match(/\bx1="([^"]*)"/);
    const y1M = attrs.match(/\by1="([^"]*)"/);
    const x2M = attrs.match(/\bx2="([^"]*)"/);
    const y2M = attrs.match(/\by2="([^"]*)"/);

    if (x1M && y1M && x2M && y2M) {
      const x1 = parseFloat(x1M[1]), y1 = parseFloat(y1M[1]);
      const x2 = parseFloat(x2M[1]), y2 = parseFloat(y2M[1]);
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        const hw = defaultSW / 2;
        const nx = -dy / len * hw;
        const ny = dx / len * hw;
        const d = `M${x1 + nx},${y1 + ny} L${x2 + nx},${y2 + ny} L${x2 - nx},${y2 - ny} L${x1 - nx},${y1 - ny}Z`;
        const fontD = convertDToFont(d, vbW, vbH);
        if (allD) allD += ' ';
        allD += fontD;
      }
    }
  }

  return allD;
}

// ---- 主流程 ----

const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));
console.log(`找到 ${svgFiles.length} 个 SVG 文件\n`);

const glyphs = [];
let processed = 0, skipped = 0;

for (const file of svgFiles) {
  const name = file.replace('.svg', '');
  const unicode = iconUnicodeMap[name];

  if (!unicode) {
    console.log(`  ⚠ ${name}: 无 Unicode 映射，跳过`);
    skipped++;
    continue;
  }

  const svgContent = fs.readFileSync(path.join(svgDir, file), 'utf-8');
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
  const vbParts = viewBox.split(' ').map(Number);
  const vbW = vbParts[2] || 24;
  const vbH = vbParts[3] || 24;

  const glyphD = svgToGlyphD(svgContent, vbW, vbH);

  glyphs.push({
    name,
    unicode: String.fromCharCode(unicode),
    unicodeHex: unicode.toString(16).toUpperCase(),
    d: glyphD,
  });

  processed++;
  console.log(`  ✓ ${name} → U+${unicode.toString(16).toUpperCase()}`);
}

console.log(`\n已处理 ${processed} 个，跳过 ${skipped} 个\n`);

// 生成 SVG 字体
let svgFont = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg">
<defs>
  <font id="QIcon" horiz-adv-x="${UNITS_PER_EM}">
    <font-face
      font-family="QIcon"
      font-weight="400"
      font-stretch="normal"
      units-per-em="${UNITS_PER_EM}"
      ascent="${ASCENT}"
      descent="${DESCENT}"
    />
    <missing-glyph horiz-adv-x="${UNITS_PER_EM}" />
`;

for (const glyph of glyphs) {
  svgFont += `    <glyph glyph-name="${glyph.name}" unicode="${glyph.unicode}" horiz-adv-x="${UNITS_PER_EM}" d="${glyph.d}" />\n`;
}

svgFont += `  </font>\n</defs>\n</svg>`;

const svgFontPath = path.join(outputDir, 'q-icon.svg');
fs.writeFileSync(svgFontPath, svgFont, 'utf-8');
console.log(`✓ SVG 字体已生成: ${svgFontPath}`);

// 生成图标名映射 JSON
const iconMap = {};
for (const glyph of glyphs) {
  iconMap[glyph.name] = glyph.unicodeHex;
}
fs.writeFileSync(path.join(outputDir, 'icon-map.json'), JSON.stringify(iconMap, null, 2), 'utf-8');

// 转换为 TTF / WOFF2
try {
  const svg2ttf = require('svg2ttf');
  const { default: ttf2woff2 } = require('ttf2woff2');

  const ttf = svg2ttf(svgFont, {});
  const ttfPath = path.join(outputDir, 'q-icon.ttf');
  fs.writeFileSync(ttfPath, Buffer.from(ttf.buffer));
  console.log(`✓ TTF 已生成: ${ttfPath} (${ttf.buffer.byteLength} bytes)`);

  const ttfBuffer = fs.readFileSync(ttfPath);
  const woff2 = ttf2woff2(ttfBuffer);
  const woff2Path = path.join(outputDir, 'q-icon.woff2');
  fs.writeFileSync(woff2Path, woff2);
  console.log(`✓ WOFF2 已生成: ${woff2Path} (${woff2.length} bytes)`);

  fs.unlinkSync(svgFontPath);
  console.log(`✓ 已清理中间产物: ${svgFontPath}`);
} catch (e) {
  console.log(`\n⚠ 字体格式转换失败: ${e.message}`);
  console.log(`  SVG 字体保留在: ${svgFontPath}`);
}

// ---- 自动更新 q-icon.css 的图标映射部分 ----
function updateQIconCss() {
  const cssPath = path.resolve(__dirname, '../src/icon/q-icon.css');
  if (!fs.existsSync(cssPath)) {
    console.log('⚠ q-icon.css 不存在，跳过 CSS 更新');
    return;
  }

  let css = fs.readFileSync(cssPath, 'utf-8');

  const sectionHeader = '/* ========================================\n   10. 图标定义 (Unicode 私用区 E900-E9FF)\n   自动生成 — 勿手动编辑\n   ======================================== */';

  const sectionStart = css.indexOf(sectionHeader);
  if (sectionStart === -1) {
    console.log('⚠ q-icon.css 中找不到图标定义区域，跳过 CSS 更新');
    return;
  }

  const sortedNames = Object.keys(iconMap).sort();
  let iconClasses = '';
  for (const name of sortedNames) {
    const hex = iconMap[name].toLowerCase();
    const selector = `.q-icon-${name}:before`;
    iconClasses += `${selector.padEnd(30)} { content: "\\${hex}"; }\n`;
  }

  const newSection = sectionHeader + '\n\n' + iconClasses;
  css = css.substring(0, sectionStart) + newSection;

  fs.writeFileSync(cssPath, css, 'utf-8');
  console.log(`✓ q-icon.css 图标映射已更新 (${sortedNames.length} 个图标)`);
}

updateQIconCss();
