#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 解析命令行参数
const args = process.argv.slice(2);
const targetModule = args[0]; // 可选的模块名称
const cleanFirst = args.includes('--clean') || args.includes('-c');

console.log('🚀 OrbitJS Builder');
console.log('=================\n');

// 加载配置
const configPath = path.join(__dirname, 'build-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const rootPackage = require('../package.json');

// 工具函数
const utils = {
  // 执行命令
  exec(cmd, cwd = process.cwd()) {
    console.log(`  ↳ ${cmd}`);
    try {
      execSync(cmd, { stdio: 'inherit', cwd });
      return true;
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
      return false;
    }
  },
  
  // 清理目录
  clean(dir) {
    if (fs.existsSync(dir)) {
      console.log(`  Cleaning ${dir}...`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
  },
  
  // 重命名ESM文件
  renameEsmFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      // .js -> .esm.js
      if (file.endsWith('.js') && !file.endsWith('.esm.js')) {
        fs.renameSync(
          path.join(dir, file),
          path.join(dir, file.replace('.js', '.esm.js'))
        );
      }
      // .js.map -> .esm.js.map
      if (file.endsWith('.js.map') && !file.endsWith('.esm.js.map')) {
        fs.renameSync(
          path.join(dir, file),
          path.join(dir, file.replace('.js.map', '.esm.js.map'))
        );
      }
    });
  },
  
  // 生成package.json
  generatePackageJson(moduleName, moduleConfig) {
    const pkg = {
      name: moduleConfig.packageName,
      version: rootPackage.version,
      main: 'index.js',
      module: 'index.esm.js',
      types: 'index.d.ts',
      sideEffects: false,
      exports: {
        '.': {
          import: './index.esm.js',
          require: './index.js',
          types: './index.d.ts'
        }
      }
    };
    
    // 添加依赖
    if (moduleConfig.dependencies?.length) {
      pkg.dependencies = {};
      moduleConfig.dependencies.forEach(dep => {
        const depConfig = config.modules[dep];
        if (depConfig) {
          pkg.dependencies[depConfig.packageName] = rootPackage.version;
        }
      });
    }
    
    const pkgPath = path.join(moduleConfig.outDir, 'package.json');
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    console.log(`  Generated ${path.basename(pkgPath)}`);
  },
  
  // 拓扑排序（依赖关系）
  topologicalSort(modules) {
    const visited = new Set();
    const result = [];
    
    function visit(name) {
      if (visited.has(name)) return;
      visited.add(name);
      
      const module = modules[name];
      if (module.dependencies) {
        module.dependencies.forEach(dep => visit(dep));
      }
      
      result.push({ name, ...module });
    }
    
    Object.keys(modules).forEach(name => visit(name));
    return result;
  }
};

// 构建单个模块
function buildModule(moduleName, moduleConfig) {
  console.log(`📦 Building ${moduleName} (${moduleConfig.packageName})`);
  
  const { outDir, rootDir } = moduleConfig;
  const { tsconfig, formats } = config.build;
  
  // 准备输出目录
  utils.clean(outDir);
  
  // 按格式构建
  formats.forEach(format => {
    console.log(`  ${format.toUpperCase()}...`);
    
    const isEsm = format === 'esm';
    const moduleType = isEsm ? 'esnext' : 'commonjs';
    
    // 构建命令
    let cmd = `npx tsc --project ${tsconfig} ` +
              `--module ${moduleType} ` +
              `--outDir ${outDir} ` +
              `--rootDir ${rootDir}`;
    
    if (config.build.declaration) cmd += ' --declaration';
    if (config.build.declarationMap) cmd += ' --declarationMap';
    if (config.build.sourceMap) cmd += ' --sourceMap';
    
    if (!utils.exec(cmd)) {
      throw new Error(`Failed to build ${format} for ${moduleName}`);
    }
    
    // 重命名ESM文件
    if (isEsm) {
      utils.renameEsmFiles(outDir);
    }
  });
  
  // 生成package.json
  utils.generatePackageJson(moduleName, moduleConfig);
  
  console.log(`✅ ${moduleName} built\n`);
  return true;
}

// 主函数
async function main() {
  // 清理dist目录
  if (cleanFirst) {
    console.log('🧹 Cleaning dist directory...');
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true });
    }
    fs.mkdirSync('dist', { recursive: true });
  }
  
  // 确定要构建的模块
  let modulesToBuild;
  
  if (targetModule) {
    // 构建指定模块及其依赖
    if (!config.modules[targetModule]) {
      console.error(`❌ Module "${targetModule}" not found in config`);
      console.log('Available modules:', Object.keys(config.modules).join(', '));
      process.exit(1);
    }
    
    // 收集指定模块及其所有依赖
    const toBuild = new Set();
    function collectDeps(name) {
      toBuild.add(name);
      const module = config.modules[name];
      if (module.dependencies) {
        module.dependencies.forEach(dep => collectDeps(dep));
      }
    }
    collectDeps(targetModule);
    
    // 转换为数组并排序
    modulesToBuild = utils.topologicalSort(
      Object.fromEntries(
        Object.entries(config.modules)
          .filter(([name]) => toBuild.has(name))
      )
    );
    
    console.log(`🎯 Building ${targetModule} and its dependencies:`);
    console.log('  ' + modulesToBuild.map(m => m.name).join(' → '));
  } else {
    // 构建所有模块（按依赖排序）
    console.log('🔨 Building all modules...');
    modulesToBuild = utils.topologicalSort(config.modules);
  }
  
  // 执行构建
  try {
    for (const module of modulesToBuild) {
      await buildModule(module.name, module);
    }
    
    // 更新主package.json的exports
    if (!targetModule || targetModule === 'all') {
      updateMainExports();
    }
    
    console.log('🎉 Build completed successfully!');
  } catch (error) {
    console.error(`❌ Build failed: ${error.message}`);
    process.exit(1);
  }
}

// 更新主package.json的exports字段
function updateMainExports() {
  console.log('\n📄 Updating main package exports...');
  
  const mainExports = {
    '.': {
      import: './dist/index.esm.js',
      require: './dist/index.js',
      types: './dist/index.d.ts'
    }
  };
  
  // 添加所有模块
  Object.keys(config.modules).forEach(moduleName => {
    const exportKey = `./${moduleName}`;
    mainExports[exportKey] = {
      import: `./dist/${moduleName}/index.esm.js`,
      require: `./dist/${moduleName}/index.js`,
      types: `./dist/${moduleName}/index.d.ts`
    };
  });
  
  // 读取主package.json
  const mainPkgPath = path.join(__dirname, '..', 'package.json');
  const mainPkg = JSON.parse(fs.readFileSync(mainPkgPath, 'utf8'));
  
  // 更新exports
  mainPkg.exports = mainExports;
  
  // 写回文件
  fs.writeFileSync(mainPkgPath, JSON.stringify(mainPkg, null, 2));
  console.log('✅ Main package.json updated');
}

// 显示帮助
function showHelp() {
  console.log(`
Usage:
  node scripts/build.js [module] [options]

Arguments:
  [module]    Module to build (core, utils, validation, etc.)
              If omitted, builds all modules

Options:
  --clean, -c Clean dist directory before building
  --help, -h  Show this help message

Examples:
  node scripts/build.js              # Build all modules
  node scripts/build.js --clean      # Clean and build all
  node scripts/build.js validation   # Build validation module only
  node scripts/build.js core -c      # Clean and build core + deps
  `);
  process.exit(0);
}

// 检查是否需要显示帮助
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
}

// 启动构建
main().catch(console.error);