/**
 * 从 SVG 文件生成图标字体
 *
 * 输入：src/icon/svg/*.svg
 * 输出：src/icon/fonts/zi-icon.svg  (SVG 字体，可被浏览器直接使用)
 *
 * 流程：
 *   1. 读取 svg/ 目录下所有 SVG 文件
 *   2. 提取每个 SVG 的 path 数据
 *   3. 按 CSS 中的 Unicode 码点映射
 *   4. 生成 SVG 字体文件（.svg 格式）
 *   5. 用工具转换为 woff2/woff/ttf
 *
 * 注意：SVG 字体（.svg 格式）是中间产物，最终需要转换为 woff2/ttf。
 *       如果没有转换工具，浏览器也可以直接使用 SVG 字体。
 */

const fs = require('fs');
const path = require('path');

const svgDir = path.resolve(__dirname, '../src/icon/svg');
const outputDir = path.resolve(__dirname, '../src/icon/fonts');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 图标名 → Unicode 码点映射
 * 与 q-icon.css 中的定义一一对应
 */
const iconUnicodeMap = {
  // 通用操作 (E900-E90F)
  save: 0xE900,
  refresh: 0xE901,
  edit: 0xE902,
  delete: 0xE903,
  add: 0xE904,
  copy: 0xE905,
  paste: 0xE906,
  cut: 0xE907,
  undo: 0xE908,
  redo: 0xE909,
  close: 0xE90A,
  check: 0xE90B,
  print: 0xE90C,
  lock: 0xE90D,
  unlock: 0xE90E,
  export: 0xE90F,

  // 导航操作 (E910-E91F)
  back: 0xE910,
  forward: 0xE911,
  up: 0xE912,
  down: 0xE913,
  left: 0xE914,
  right: 0xE915,
  upload: 0xE916,
  download: 0xE917,
  search: 0xE918,
  filter: 0xE919,
  settings: 0xE91A,
  menu: 0xE91B,
  more: 0xE91C,
  home: 0xE91D,
  dashboard: 0xE91E,
  notification: 0xE91F,

  // 状态提示 (E920-E92F)
  success: 0xE920,
  warning: 0xE921,
  error: 0xE922,
  info: 0xE923,
  question: 0xE924,
  star: 0xE925,
  'star-empty': 0xE926,
  heart: 0xE927,
  'heart-empty': 0xE928,
  flag: 0xE929,
  tag: 0xE92A,
  bell: 0xE92B,

  // 文件文档 (E930-E93F)
  file: 0xE930,
  folder: 0xE931,
  'folder-open': 0xE932,
  'file-open': 0xE933,
  'file-pdf': 0xE934,
  'file-word': 0xE935,
  'file-excel': 0xE936,
  'file-image': 0xE937,
  'file-archive': 0xE938,
  'file-code': 0xE939,

  // 用户管理 (E940-E94F)
  user: 0xE940,
  users: 0xE941,
  'user-add': 0xE942,
  'user-remove': 0xE943,
  'user-check': 0xE944,
  'user-clock': 0xE945,
  role: 0xE946,
  permission: 0xE947,
  profile: 0xE948,

  // 日期时间 (E950-E95F)
  calendar: 0xE950,
  clock: 0xE951,
  time: 0xE952,
  hourglass: 0xE953,

  // 通讯消息 (E960-E96F)
  mail: 0xE960,
  'mail-open': 0xE961,
  chat: 0xE962,
  comment: 0xE963,
  send: 0xE964,
  inbox: 0xE965,

  // 数据图表 (E970-E97F)
  'chart-bar': 0xE970,
  'chart-line': 0xE971,
  'chart-pie': 0xE972,
  'chart-area': 0xE973,
  table: 0xE974,
  list: 0xE975,

  // 电商/财务 (E980-E98F)
  shopping: 0xE980,
  cart: 0xE981,
  wallet: 0xE982,
  coin: 0xE983,
  credit: 0xE984,
  order: 0xE985,
  invoice: 0xE986,

  // 中国风特色 (E990-E9FF)
  dragon: 0xE990,
  phoenix: 0xE991,
  lantern: 0xE992,
  teapot: 0xE993,
  bamboo: 0xE994,
  plum: 0xE995,
  seal: 0xE996,
  scroll: 0xE997,
  abacus: 0xE998,
  brush: 0xE999,
  ink: 0xE99A,
  fan: 0xE99B,
  temple: 0xE99C,
  greatwall: 0xE99D,
  china: 0xE99E,
  'yin-yang': 0xE99F,
};

/**
 * 从 SVG 内容中提取所有绘制命令（path d、circle、rect、line 等）
 * 转换为 SVG 字体的 <glyph> 元素
 */
function extractGlyphData(svgContent) {
  // 提取 viewBox
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

  // 提取所有 path 的 d 属性
  const paths = [];
  const pathRegex = /<path[^>]*\sd="([^"]*)"[^>]*\/?>/g;
  let pathMatch;
  while ((pathMatch = pathRegex.exec(svgContent)) !== null) {
    paths.push({ type: 'path', d: pathMatch[1] });
  }

  // 提取 circle
  const circles = [];
  const circleRegex = /<circle[^>]*\scx="([^"]*)"[^>]*\scy="([^"]*)"[^>]*\sr="([^"]*)"[^>]*\/?>/g;
  let circleMatch;
  while ((circleMatch = circleRegex.exec(svgContent)) !== null) {
    circles.push({
      type: 'circle',
      cx: circleMatch[1],
      cy: circleMatch[2],
      r: circleMatch[3],
    });
  }

  // 提取 rect
  const rects = [];
  const rectRegex = /<rect[^>]*\sx="([^"]*)"[^>]*\sy="([^"]*)"[^>]*\swidth="([^"]*)"[^>]*\sheight="([^"]*)"[^>]*\/?>/g;
  let rectMatch;
  while ((rectMatch = rectRegex.exec(svgContent)) !== null) {
    rects.push({
      type: 'rect',
      x: rectMatch[1],
      y: rectMatch[2],
      width: rectMatch[3],
      height: rectMatch[4],
    });
  }

  // 提取 line
  const lines = [];
  const lineRegex = /<line[^>]*\sx1="([^"]*)"[^>]*\sy1="([^"]*)"[^>]*\sx2="([^"]*)"[^>]*\sy2="([^"]*)"[^>]*\/?>/g;
  let lineMatch;
  while ((lineMatch = lineRegex.exec(svgContent)) !== null) {
    lines.push({
      type: 'line',
      x1: lineMatch[1],
      y1: lineMatch[2],
      x2: lineMatch[3],
      y2: lineMatch[4],
    });
  }

  return { viewBox, paths, circles, rects, lines };
}

/**
 * 将 SVG 图形元素转换为 path d 属性
 * SVG 字体的 <glyph> 只支持 d 属性
 */
function shapesToPathD(shapes, viewBox) {
  const parts = viewBox.split(' ').map(Number);
  const vbX = parts[0] || 0;
  const vbY = parts[1] || 0;
  const vbW = parts[2] || 24;
  const vbH = parts[3] || 24;

  // SVG 字体的坐标系：em 方块 (0,0)-(1,1)，y 轴向上
  // 需要将 SVG 坐标 (0,0)-(24,24) y轴向下 转换为字体坐标
  const scale = 1 / vbH;
  const offsetY = vbH; // 翻转 y 轴

  let d = '';

  // 添加 path
  for (const p of shapes.paths) {
    if (d) d += ' ';
    d += p.d;
  }

  // 添加 circle → 弧线近似
  for (const c of shapes.circles) {
    const cx = parseFloat(c.cx);
    const cy = parseFloat(c.cy);
    const r = parseFloat(c.r);
    if (r > 0) {
      // 用两个弧线近似圆
      d += ` M${cx - r},${cy} A${r},${r} 0 1,0 ${cx + r},${cy} A${r},${r} 0 1,0 ${cx - r},${cy}Z`;
    }
  }

  // 添加 rect
  for (const r of shapes.rects) {
    const x = parseFloat(r.x);
    const y = parseFloat(r.y);
    const w = parseFloat(r.width);
    const h = parseFloat(r.height);
    d += ` M${x},${y} L${x + w},${y} L${x + w},${y + h} L${x},${y + h}Z`;
  }

  // 添加 line
  for (const l of shapes.lines) {
    d += ` M${l.x1},${l.y1} L${l.x2},${l.y2}`;
  }

  return d;
}

// ---- 主流程 ----

// 读取所有 SVG 文件
const svgFiles = fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'));

console.log(`找到 ${svgFiles.length} 个 SVG 文件\n`);

const glyphs = [];
let processed = 0;
let skipped = 0;

for (const file of svgFiles) {
  const name = file.replace('.svg', '');
  const unicode = iconUnicodeMap[name];

  if (!unicode) {
    console.log(`  ⚠ ${name}: 无 Unicode 映射，跳过`);
    skipped++;
    continue;
  }

  const svgContent = fs.readFileSync(path.join(svgDir, file), 'utf-8');
  const shapes = extractGlyphData(svgContent);
  const d = shapesToPathD(shapes, shapes.viewBox);

  glyphs.push({
    name,
    unicode: String.fromCharCode(unicode),
    unicodeHex: unicode.toString(16).toUpperCase(),
    d,
  });

  processed++;
  console.log(`  ✓ ${name} → U+${unicode.toString(16).toUpperCase()}`);
}

console.log(`\n已处理 ${processed} 个，跳过 ${skipped} 个\n`);

// 生成 SVG 字体
const fontId = 'QIcon';
const fontFamily = 'QIcon';
const ascent = 850;
const descent = -150;
const unitsPerEm = 1000;

let svgFont = `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg">
<defs>
  <font id="${fontId}" horiz-adv-x="${unitsPerEm}">
    <font-face
      font-family="${fontFamily}"
      font-weight="400"
      font-stretch="normal"
      units-per-em="${unitsPerEm}"
      ascent="${ascent}"
      descent="${descent}"
    />
    <missing-glyph horiz-adv-x="${unitsPerEm}" />
`;

for (const glyph of glyphs) {
  svgFont += `    <glyph
      glyph-name="${glyph.name}"
      unicode="${glyph.unicode}"
      horiz-adv-x="${unitsPerEm}"
      d="${glyph.d}"
    />
`;
}

svgFont += `  </font>
</defs>
</svg>`;

// 写入 SVG 字体（中间产物）
const svgFontPath = path.join(outputDir, 'q-icon.svg');
fs.writeFileSync(svgFontPath, svgFont, 'utf-8');
console.log(`✓ SVG 字体已生成: ${svgFontPath}`);

// 生成图标名映射 JSON（供 JS 使用）
const iconMap = {};
for (const glyph of glyphs) {
  iconMap[glyph.name] = glyph.unicodeHex;
}
const mapPath = path.join(outputDir, 'icon-map.json');
fs.writeFileSync(mapPath, JSON.stringify(iconMap, null, 2), 'utf-8');
console.log(`✓ 图标映射已生成: ${mapPath}`);

// ---- 转换为 TTF / WOFF2 / WOFF ----
try {
  const svg2ttf = require('svg2ttf');
  const { default: ttf2woff2 } = require('ttf2woff2');

  // SVG font -> TTF
  const ttf = svg2ttf(svgFont, {});
  const ttfPath = path.join(outputDir, 'q-icon.ttf');
  fs.writeFileSync(ttfPath, Buffer.from(ttf.buffer));
  console.log(`✓ TTF 已生成: ${ttfPath} (${ttf.buffer.byteLength} bytes)`);

  // TTF -> WOFF2
  const ttfBuffer = fs.readFileSync(ttfPath);
  const woff2 = ttf2woff2(ttfBuffer);
  const woff2Path = path.join(outputDir, 'q-icon.woff2');
  fs.writeFileSync(woff2Path, woff2);
  console.log(`✓ WOFF2 已生成: ${woff2Path} (${woff2.length} bytes)`);

  // TTF -> WOFF (直接复制 TTF 作为 fallback，现代浏览器优先用 WOFF2)
  const woffPath = path.join(outputDir, 'q-icon.woff');
  fs.writeFileSync(woffPath, ttfBuffer);
  console.log(`✓ WOFF 已生成: ${woffPath} (TTF fallback)`);

  // 删除中间产物 SVG 字体
  fs.unlinkSync(svgFontPath);
  console.log(`✓ 已清理中间产物: ${svgFontPath}`);
} catch (e) {
  console.log(`\n⚠ 字体格式转换失败: ${e.message}`);
  console.log(`  请安装 svg2ttf 和 ttf2woff2: pnpm add -D svg2ttf ttf2woff2`);
  console.log(`  SVG 字体保留在: ${svgFontPath}`);
}
