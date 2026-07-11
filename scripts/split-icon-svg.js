/**
 * 将 q-icon.svg 拆分为独立的 SVG 文件
 *
 * 输入：src/icon/q-icon.svg（包含多个 <svg> 标签的大文件）
 * 输出：src/icon/svg/{name}.svg（每个图标一个文件）
 *
 * 同时清理硬编码颜色，使图标可通过 CSS color 属性控制：
 *   - stroke="#c41a1a" → stroke="currentColor"
 *   - fill="#c41a1a" → fill="currentColor"
 *   - stroke="#2a1a0a" → stroke="currentColor"
 *   - 移除 opacity 属性（装饰性元素）
 */

const fs = require('fs');
const path = require('path');

const inputFile = path.resolve(__dirname, '../src/icon/q-icon.svg');
const outputDir = path.resolve(__dirname, '../src/icon/svg');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 读取源文件
const content = fs.readFileSync(inputFile, 'utf-8');

// 用正则提取每个 SVG 块及其前面的注释
const regex = /<!--\s*icons\/(\w[\w-]*)\.svg\s*-\s*(.*?)\s*-->\s*\n(<svg[\s\S]*?<\/svg>)/g;

let match;
let count = 0;

while ((match = regex.exec(content)) !== null) {
  const name = match[1];
  const description = match[2];
  let svg = match[3];

  // 清理硬编码颜色 → currentColor
  svg = svg
    .replace(/stroke="#c41a1a"/g, 'stroke="currentColor"')
    .replace(/fill="#c41a1a"/g, 'fill="currentColor"')
    .replace(/stroke="#2a1a0a"/g, 'stroke="currentColor"')
    .replace(/fill="#2a1a0a"/g, 'fill="currentColor"')
    // 移除装饰性 opacity
    .replace(/\s+opacity="[\d.]+"/g, '');

  // 写入文件
  const outputPath = path.join(outputDir, `${name}.svg`);
  fs.writeFileSync(outputPath, svg.trim() + '\n', 'utf-8');
  count++;
  console.log(`  ✓ ${name}.svg (${description})`);
}

console.log(`\n共拆分 ${count} 个图标到 ${outputDir}`);
