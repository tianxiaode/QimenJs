'use strict'; // ✅ 使用严格模式

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building OrbitJS...');

// 清理 dist 目录
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true });
}

// 创建 dist 目录
fs.mkdirSync('dist', { recursive: true });

// 构建配置
const packages = [
  {
    name: 'core',
    entry: 'src/core/index.ts',
    outDir: 'dist/core'
  },
  {
    name: 'utils',
    entry: 'src/utils/index.ts',
    outDir: 'dist/utils'
  }
];

// 辅助函数：执行命令并处理错误
function executeCommand(command, cwd = process.cwd()) {
  try {
    console.log(`  ↳ ${command}`);
    execSync(command, { stdio: 'inherit', cwd });
    return true;
  } catch (error) {
    console.error(`  ❌ Command failed: ${command}`);
    console.error(`     ${error.message}`);
    return false;
  }
}

// 构建每个包
packages.forEach(pkg => {
  console.log(`\n📦 Building ${pkg.name}...`);
  
  // 创建输出目录
  fs.mkdirSync(pkg.outDir, { recursive: true });
  
  // 使用 tsconfig.build.json 构建
  const buildConfig = path.join(__dirname, '..', 'tsconfig.build.json');
  
  // 构建 CJS 版本
  console.log('  Building CJS version...');
  if (!executeCommand(`npx tsc --project ${buildConfig} --module commonjs --outDir ${pkg.outDir}`)) {
    process.exit(1);
  }
  
  // 构建 ESM 版本
  console.log('  Building ESM version...');
  if (!executeCommand(`npx tsc --project ${buildConfig} --module esnext --outDir ${pkg.outDir}`)) {
    process.exit(1);
  }
  
  // 重命名 ESM 文件
  console.log('  Renaming ESM files...');
  const files = fs.readdirSync(pkg.outDir);
  files.forEach(file => {
    if (file.endsWith('.js') && !file.endsWith('.esm.js')) {
      const oldPath = path.join(pkg.outDir, file);
      const newPath = path.join(pkg.outDir, file.replace('.js', '.esm.js'));
      fs.renameSync(oldPath, newPath);
    }
  });
  
  console.log(`✅ ${pkg.name} built successfully`);
});

// 创建 package.json 文件用于子包导出
console.log('\n📄 Creating package.json files for sub-packages...');

const rootPackage = require('../package.json');

// 创建 core 包的 package.json
const corePackageJson = {
  name: '@orbitjs/core',
  version: rootPackage.version,
  main: 'index.js',
  module: 'index.esm.js',
  types: 'index.d.ts',
  sideEffects: false
};

fs.writeFileSync(
  path.join('dist/core', 'package.json'),
  JSON.stringify(corePackageJson, null, 2)
);

// 创建 utils 包的 package.json
const utilsPackageJson = {
  name: '@orbitjs/utils',
  version: rootPackage.version,
  main: 'index.js',
  module: 'index.esm.js',
  types: 'index.d.ts',
  sideEffects: false
};

fs.writeFileSync(
  path.join('dist/utils', 'package.json'),
  JSON.stringify(utilsPackageJson, null, 2)
);

console.log('✅ Package.json files created');

console.log('\n🎉 Build completed successfully!');