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

const iconUnicodeMap = {
  save: 0xE900, refresh: 0xE901, edit: 0xE902, delete: 0xE903,
  add: 0xE904, copy: 0xE905, paste: 0xE906, cut: 0xE907,
  undo: 0xE908, redo: 0xE909, close: 0xE90A, check: 0xE90B,
  print: 0xE90C, lock: 0xE90D, unlock: 0xE90E, export: 0xE90F,
  back: 0xE910, forward: 0xE911, up: 0xE912, down: 0xE913,
  left: 0xE914, right: 0xE915, upload: 0xE916, download: 0xE917,
  search: 0xE918, filter: 0xE919, settings: 0xE91A, menu: 0xE91B,
  more: 0xE91C, home: 0xE91D, dashboard: 0xE91E, notification: 0xE91F,
  success: 0xE920, warning: 0xE921, error: 0xE922, info: 0xE923,
  question: 0xE924, star: 0xE925, 'star-empty': 0xE926, heart: 0xE927,
  'heart-empty': 0xE928, flag: 0xE929, tag: 0xE92A, bell: 0xE92B,
  file: 0xE930, folder: 0xE931, 'folder-open': 0xE932, 'file-open': 0xE933,
  'file-pdf': 0xE934, 'file-word': 0xE935, 'file-excel': 0xE936, 'file-image': 0xE937,
  'file-archive': 0xE938, 'file-code': 0xE939,
  user: 0xE940, users: 0xE941, 'user-add': 0xE942, 'user-remove': 0xE943,
  'user-check': 0xE944, 'user-clock': 0xE945, role: 0xE946, permission: 0xE947,
  profile: 0xE948,
  calendar: 0xE950, clock: 0xE951, time: 0xE952, hourglass: 0xE953,
  mail: 0xE960, 'mail-open': 0xE961, chat: 0xE962, comment: 0xE963,
  send: 0xE964, inbox: 0xE965,
  'chart-bar': 0xE970, 'chart-line': 0xE971, 'chart-pie': 0xE972, 'chart-area': 0xE973,
  table: 0xE974, list: 0xE975,
  shopping: 0xE980, cart: 0xE981, wallet: 0xE982, coin: 0xE983,
  credit: 0xE984, order: 0xE985, invoice: 0xE986,
  dragon: 0xE990, phoenix: 0xE991, lantern: 0xE992, teapot: 0xE993,
  bamboo: 0xE994, plum: 0xE995, seal: 0xE996, scroll: 0xE997,
  abacus: 0xE998, brush: 0xE999, ink: 0xE99A, fan: 0xE99B,
  temple: 0xE99C, greatwall: 0xE99D, china: 0xE99E, 'yin-yang': 0xE99F,
};

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
        // 弧线近似为直线（简化）
        current.push({ x: params[5], y: params[6], type: 'L', fromX: cx, fromY: cy });
        cx = params[5]; cy = params[6];
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
 * 对子路径做 stroke offset，生成填充路径的 d 属性
 */
function strokeOffsetToFillD(subPaths, halfWidth) {
  let d = '';
  for (const subPath of subPaths) {
    if (subPath.length < 2) continue;
    const leftPts = [];
    const rightPts = [];

    for (let i = 0; i < subPath.length; i++) {
      const pt = subPath[i];
      if (pt.type === 'M') continue;
      if (pt.type === 'Z') {
        const startPt = subPath[0];
        if (startPt && pt.fromX !== undefined) {
          const dx = startPt.x - pt.fromX;
          const dy = startPt.y - pt.fromY;
          const len = Math.sqrt(dx * dx + dy * dy);
          if (len > 0) {
            const nx = -dy / len * halfWidth;
            const ny = dx / len * halfWidth;
            leftPts.push({ x: pt.fromX + nx, y: pt.fromY + ny });
            leftPts.push({ x: startPt.x + nx, y: startPt.y + ny });
            rightPts.push({ x: pt.fromX - nx, y: pt.fromY - ny });
            rightPts.push({ x: startPt.x - nx, y: startPt.y - ny });
          }
        }
        continue;
      }
      const dx = pt.x - pt.fromX;
      const dy = pt.y - pt.fromY;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        const nx = -dy / len * halfWidth;
        const ny = dx / len * halfWidth;
        leftPts.push({ x: pt.fromX + nx, y: pt.fromY + ny });
        leftPts.push({ x: pt.x + nx, y: pt.y + ny });
        rightPts.push({ x: pt.fromX - nx, y: pt.fromY - ny });
        rightPts.push({ x: pt.x - nx, y: pt.y - ny });
      }
    }

    if (leftPts.length < 2) continue;
    d += `M${leftPts[0].x.toFixed(2)} ${leftPts[0].y.toFixed(2)}`;
    for (let i = 1; i < leftPts.length; i++) {
      d += ` L${leftPts[i].x.toFixed(2)} ${leftPts[i].y.toFixed(2)}`;
    }
    d += ` L${rightPts[rightPts.length - 1].x.toFixed(2)} ${rightPts[rightPts.length - 1].y.toFixed(2)}`;
    for (let i = rightPts.length - 2; i >= 0; i--) {
      d += ` L${rightPts[i].x.toFixed(2)} ${rightPts[i].y.toFixed(2)}`;
    }
    d += 'Z ';
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
  // SVG → 字体：x' = x * scale, y' = UNITS_PER_EM - y * scale
  const matrixStr = `matrix(${scale},0,0,${-scale},0,${UNITS_PER_EM})`;
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
