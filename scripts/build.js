#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 解析命令行参数
const args = process.argv.slice(2);
const cleanFirst = args.includes('--clean') || args.includes('-c');
const targetModule = args.find(a => !a.startsWith('-')); // 第一个非选项参数为模块名

console.log('🚀 QimenJS Builder');
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
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                this.renameEsmFiles(filePath);
                return;
            }
            // .js -> .esm.js
            if (file.endsWith('.js') && !file.endsWith('.esm.js')) {
                fs.renameSync(filePath, filePath.replace('.js', '.esm.js'));
            }
            // .js.map -> .esm.js.map
            if (file.endsWith('.js.map') && !file.endsWith('.esm.js.map')) {
                fs.renameSync(filePath, filePath.replace('.js.map', '.esm.js.map'));
            }
        });
    },

    // 递归复制 ESM 文件到最终目录
    copyEsmFiles(srcDir, destDir) {
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        const files = fs.readdirSync(srcDir);
        for (const file of files) {
            const srcPath = path.join(srcDir, file);
            const destPath = path.join(destDir, file);
            const stat = fs.statSync(srcPath);
            if (stat.isDirectory()) {
                this.copyEsmFiles(srcPath, destPath);
            } else if (file.endsWith('.esm.js') || file.endsWith('.esm.js.map')) {
                fs.copyFileSync(srcPath, destPath);
            }
        }
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
                    types: './index.d.ts',
                },
            },
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

    // 修复产物中的 @qimenjs/xxx 和 @/ 引用，替换为相对路径
  fixModuleImports(dir, currentModule) {
    const projectRoot = process.cwd();
    const srcRoot = path.resolve(projectRoot, 'src');
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        this.fixModuleImports(filePath, currentModule);
        continue;
      }
      const isEsm = file.endsWith('.esm.js');
      const isCjs = file.endsWith('.js') && !file.endsWith('.esm.js');
      const isDts = file.endsWith('.d.ts');
      if (!isEsm && !isCjs && !isDts) continue;

      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;

      // 替换 @qimenjs/xxx 为相对路径
      for (const [modName, modConfig] of Object.entries(config.modules)) {
        if (modName === currentModule) continue;
        const pattern = new RegExp(`@qimenjs/${modName}`, 'g');
        if (pattern.test(content)) {
          const targetDir = path.resolve(projectRoot, modConfig.outDir);
          const currentDir = path.dirname(filePath);
          let relPath = path.relative(currentDir, targetDir).replace(/\\/g, '/');
          if (!relPath.startsWith('.')) relPath = './' + relPath;

          if (isEsm) {
            content = content.replace(pattern, `${relPath}/index.esm.js`);
          } else if (isCjs) {
            content = content.replace(pattern, `${relPath}/index.js`);
          } else {
            content = content.replace(pattern, `${relPath}/index.d.ts`);
          }
          modified = true;
        }
      }

      // 替换 @/xxx 为相对路径（@/ 映射到 src/，但 dist 中模块直接在 dist/ 下）
      // 注意：深层路径（如 @/registry/registrars/RegistrarBase）没有 ESM 版本，
      // 统一替换为模块根入口（如 ../registry/index.esm.js），因为 index.esm.js re-export 了所有内容
      const atSlashPattern = /@\/([a-zA-Z0-9_/.-]+)/g;
      let match;
      const replacements = [];
      while ((match = atSlashPattern.exec(content)) !== null) {
        const fullMatch = match[0];
        const srcPath = match[1];
        // 跳过注释中的引用
        const lineStart = content.lastIndexOf('\n', match.index) + 1;
        const line = content.substring(lineStart, match.index);
        if (line.trimStart().startsWith('*') || line.trimStart().startsWith('//')) continue;

        const currentDir = path.dirname(filePath);
        const distRoot = path.resolve(projectRoot, 'dist');
        // 取模块名（路径第一段）
        const moduleName = srcPath.split('/')[0];
        const moduleOutDir = config.modules[moduleName] ? path.resolve(projectRoot, config.modules[moduleName].outDir) : null;

        if (moduleOutDir) {
          // 统一替换为模块根入口
          let relPath = path.relative(currentDir, moduleOutDir).replace(/\\/g, '/');
          if (!relPath.startsWith('.')) relPath = './' + relPath;
          if (isEsm) relPath += '/index.esm.js';
          else if (isCjs) relPath += '/index.js';
          else relPath += '/index.d.ts';
          replacements.push({ fullMatch, relPath });
        }
      }
      for (const { fullMatch, relPath } of replacements) {
        content = content.split(fullMatch).join(relPath);
        modified = true;
      }

      // ESM 文件：给模块内部的相对路径引用加上 .esm.js 扩展名
      // 例如 export * from './registrars' → export * from './registrars/index.esm.js'
      // 避免 Vite 解析到 CJS 文件导致循环依赖
      if (isEsm) {
        const relImportPattern = /from\s+['"](\.\.?\/[^'"]+)['"]/g;
        let relMatch;
        const relReplacements = [];
        while ((relMatch = relImportPattern.exec(content)) !== null) {
          const importPath = relMatch[1];
          // 跳过已有扩展名的
          if (importPath.endsWith('.esm.js') || importPath.endsWith('.js') || importPath.endsWith('.d.ts')) continue;
          // 跳过注释
          const lineStart2 = content.lastIndexOf('\n', relMatch.index) + 1;
          const line2 = content.substring(lineStart2, relMatch.index);
          if (line2.trimStart().startsWith('*') || line2.trimStart().startsWith('//')) continue;

          const currentDir2 = path.dirname(filePath);
          const targetPath = path.resolve(currentDir2, importPath);
          // 判断目标是文件还是目录
          if (fs.existsSync(targetPath + '.esm.js')) {
            // 目标是文件：./xxx → ./xxx.esm.js
            relReplacements.push({ old: importPath, new: importPath + '.esm.js' });
          } else if (fs.existsSync(path.join(targetPath, 'index.esm.js'))) {
            // 目标是目录：./xxx → ./xxx/index.esm.js
            relReplacements.push({ old: importPath, new: importPath + '/index.esm.js' });
          }
        }
        for (const { old, new: newPath } of relReplacements) {
          content = content.split(`'${old}'`).join(`'${newPath}'`);
          content = content.split(`"${old}"`).join(`"${newPath}"`);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(filePath, content);
      }
    }
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
    },
};

// 构建单个模块
function buildModule(moduleName, moduleConfig) {
    console.log(`📦 Building ${moduleName} (${moduleConfig.packageName})`);

    const { outDir, rootDir } = moduleConfig;
    const { formats } = config.build;

    // 准备输出目录
    utils.clean(outDir);

    // 为该模块生成临时 tsconfig
    const tmpTsconfigPath = path.join(__dirname, `tsconfig.${moduleName}.tmp.json`);
    const baseTsconfig = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'tsconfig.json'), 'utf8')
    );
    const projectRoot = path.resolve(__dirname, '..').replace(/\\/g, '/');

    // rootDir 设为 src，允许跨包引用（相对路径如 ../crypto）
    // 但 include 只包含当前包的文件，避免编译其他包
    // 输出会到 dist/{moduleName}/{moduleName}/... 需要后处理
    const tmpOutDir = `${projectRoot}/dist/.tmp-${moduleName}`;
    const moduleTsconfig = {
        compilerOptions: {
            ...baseTsconfig.compilerOptions,
            outDir: tmpOutDir,
            rootDir: `${projectRoot}/src`,
            declaration: config.build.declaration ?? true,
            declarationMap: config.build.declarationMap ?? true,
            sourceMap: config.build.sourceMap ?? true,
            baseUrl: projectRoot,
            paths: baseTsconfig.compilerOptions.paths || {},
        },
        include: [`${projectRoot}/${rootDir}/**/*`],
        exclude: ['node_modules', 'dist', 'test/**/*', '**/*.test.ts', '**/*.spec.ts'],
    };

    fs.writeFileSync(tmpTsconfigPath, JSON.stringify(moduleTsconfig, null, 2));

    // 按格式构建
    try {
        // 准备最终输出目录
        const finalOutDir = path.resolve(projectRoot, outDir);
        utils.clean(finalOutDir);

        // CJS 构建
        console.log('  CJS...');
        let cmd = `npx tsc --project ${tmpTsconfigPath} --module commonjs`;
        if (!utils.exec(cmd)) {
            throw new Error(`Failed to build cjs for ${moduleName}`);
        }
        // 从临时目录移动到最终目录
        const cjsTmpDir = path.resolve(projectRoot, `dist/.tmp-${moduleName}`, moduleName);
        if (fs.existsSync(cjsTmpDir)) {
            // 确保目标目录不存在（Windows rename 要求目标不存在）
            if (fs.existsSync(finalOutDir)) {
                fs.rmSync(finalOutDir, { recursive: true, force: true });
            }
            fs.renameSync(cjsTmpDir, finalOutDir);
        }
        // 清理临时根目录
        const tmpRoot = path.resolve(projectRoot, `dist/.tmp-${moduleName}`);
        if (fs.existsSync(tmpRoot)) {
            fs.rmSync(tmpRoot, { recursive: true, force: true });
        }

        // ESM 构建
        console.log('  ESM...');
        const esmTmpOutDir = `${projectRoot}/dist/.tmp-${moduleName}-esm`;
        // 更新临时 tsconfig 的 outDir
        moduleTsconfig.compilerOptions.outDir = esmTmpOutDir;
        fs.writeFileSync(tmpTsconfigPath, JSON.stringify(moduleTsconfig, null, 2));

        cmd = `npx tsc --project ${tmpTsconfigPath} --module esnext`;
        if (!utils.exec(cmd)) {
            throw new Error(`Failed to build esm for ${moduleName}`);
        }
        // 从临时目录移动 .esm.js 文件到最终目录
        const esmTmpDir = path.resolve(projectRoot, `dist/.tmp-${moduleName}-esm`, moduleName);
        if (fs.existsSync(esmTmpDir)) {
            utils.renameEsmFiles(esmTmpDir);
            // 递归将 ESM 文件复制到最终目录
            utils.copyEsmFiles(esmTmpDir, finalOutDir);
        }
        // 清理 ESM 临时目录
        const esmTmpRoot = path.resolve(projectRoot, `dist/.tmp-${moduleName}-esm`);
        if (fs.existsSync(esmTmpRoot)) {
            fs.rmSync(esmTmpRoot, { recursive: true, force: true });
        }
    } finally {
        // 清理临时 tsconfig
        if (fs.existsSync(tmpTsconfigPath)) {
            fs.unlinkSync(tmpTsconfigPath);
        }
    }

    // 生成package.json
    utils.generatePackageJson(moduleName, moduleConfig);

    // 修复 ESM 产物中的 @qimenjs/xxx 引用，替换为相对路径
    utils.fixModuleImports(outDir, moduleName);

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
            Object.fromEntries(Object.entries(config.modules).filter(([name]) => toBuild.has(name)))
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

    // 不生成根入口 "."，每个子模块作为独立包通过子路径导出
    const mainExports = {};

    // 添加所有模块
    Object.keys(config.modules).forEach(moduleName => {
        const exportKey = `./${moduleName}`;
        mainExports[exportKey] = {
            import: `./dist/${moduleName}/index.esm.js`,
            require: `./dist/${moduleName}/index.js`,
            types: `./dist/${moduleName}/index.d.ts`,
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
