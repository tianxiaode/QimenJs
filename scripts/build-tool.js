'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BuildTool {
    constructor(configPath) {
        this.config = require(configPath);
        this.rootPackage = require('../package.json');
    }

    // 清理目录
    cleanDir(dir) {
        if (this.config.common.cleanBeforeBuild && fs.existsSync(dir)) {
            console.log(`  Cleaning ${dir}...`);
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                if (fs.lstatSync(filePath).isDirectory()) {
                    fs.rmSync(filePath, { recursive: true });
                } else if (
                    file.endsWith('.js') ||
                    file.endsWith('.d.ts') ||
                    file.endsWith('.map')
                ) {
                    fs.unlinkSync(filePath);
                }
            });
        }
    }

    // 执行命令
    executeCommand(command, cwd = process.cwd()) {
        try {
            console.log(`    ↳ ${command}`);
            execSync(command, { stdio: 'inherit', cwd });
            return true;
        } catch (error) {
            console.error(`    ❌ Command failed: ${command}`);
            console.error(`       ${error.message}`);
            return false;
        }
    }

    // 构建单个模块
    buildModule(moduleConfig) {
        console.log(`📦 Building ${moduleConfig.name} module...`);

        const { name, outDir, rootDir, packageName } = moduleConfig;

        // 确保输出目录存在
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        // 清理旧文件
        this.cleanDir(outDir);

        const tsconfig = path.join(__dirname, '..', this.config.common.tsconfig);

        // 按格式构建
        this.config.common.formats.forEach(format => {
            console.log(`  Building ${format.toUpperCase()} version...`);

            const moduleOption = format === 'cjs' ? 'commonjs' : 'esnext';
            const outFileSuffix = format === 'esm' ? '.esm' : '';

            const command =
                `npx tsc --project ${tsconfig} ` +
                `--module ${moduleOption} ` +
                `--outDir ${outDir} ` +
                `--rootDir ${rootDir}`;

            if (!this.executeCommand(command)) {
                throw new Error(`Failed to build ${format} version for ${name}`);
            }

            // 重命名ESM文件
            if (format === 'esm') {
                this.renameEsmFiles(outDir);
            }
        });

        // 生成package.json
        if (this.config.common.generatePackageJson) {
            this.generatePackageJson(moduleConfig);
        }

        console.log(`✅ ${name} module built successfully!\n`);
    }

    // 重命名ESM文件
    renameEsmFiles(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            // 重命名 .js 文件
            if (file.endsWith('.js') && !file.endsWith('.esm.js')) {
                const oldPath = path.join(dir, file);
                const newPath = path.join(dir, file.replace('.js', '.esm.js'));
                fs.renameSync(oldPath, newPath);
            }

            // 重命名 .js.map 文件
            if (file.endsWith('.js.map') && !file.endsWith('.esm.js.map')) {
                const oldPath = path.join(dir, file);
                const newPath = path.join(dir, file.replace('.js.map', '.esm.js.map'));
                fs.renameSync(oldPath, newPath);
            }

            // 重命名 .d.ts.map 文件
            if (file.endsWith('.d.ts.map') && !file.endsWith('.esm.d.ts.map')) {
                const oldPath = path.join(dir, file);
                const newPath = path.join(dir, file.replace('.d.ts.map', '.esm.d.ts.map'));
                fs.renameSync(oldPath, newPath);
            }
        });
    }

    // 生成package.json
    generatePackageJson(moduleConfig) {
        const { name, outDir, packageName, dependencies, external } = moduleConfig;

        const pkgJson = {
            name: packageName,
            version: this.rootPackage.version,
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

        // 添加内部依赖
        if (dependencies && dependencies.length > 0) {
            pkgJson.dependencies = {};
            dependencies.forEach(dep => {
                const depConfig = this.config.modules.find(m => m.name === dep);
                if (depConfig) {
                    pkgJson.dependencies[depConfig.packageName] = this.rootPackage.version;
                }
            });
        }

        // 添加外部依赖
        if (external && external.length > 0 && this.rootPackage.dependencies) {
            if (!pkgJson.dependencies) pkgJson.dependencies = {};
            external.forEach(extDep => {
                if (this.rootPackage.dependencies[extDep]) {
                    pkgJson.dependencies[extDep] = this.rootPackage.dependencies[extDep];
                }
            });
        }

        fs.writeFileSync(path.join(outDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

        console.log(`  Generated ${packageName}/package.json`);
    }

    // 构建所有模块（考虑依赖顺序）
    buildAll() {
        console.log('🚀 Building all modules...\n');

        // 按依赖关系排序（拓扑排序）
        const sortedModules = this.sortByDependencies();

        sortedModules.forEach(moduleConfig => {
            this.buildModule(moduleConfig);
        });

        // 更新主包的exports
        this.updateMainExports();

        console.log('🎉 All modules built successfully!');
    }

    // 拓扑排序：确保依赖的模块先构建
    sortByDependencies() {
        const modules = [...this.config.modules];
        const visited = new Set();
        const result = [];

        function visit(module) {
            if (visited.has(module.name)) return;
            visited.add(module.name);

            if (module.dependencies) {
                module.dependencies.forEach(depName => {
                    const depModule = modules.find(m => m.name === depName);
                    if (depModule) visit(depModule);
                });
            }

            result.push(module);
        }

        modules.forEach(module => visit(module));
        return result;
    }

    // 更新主包的exports配置
    updateMainExports() {
        console.log('\n📄 Updating main package exports...');

        const mainExports = {
            '.': {
                import: './dist/index.esm.js',
                require: './dist/index.js',
                types: './dist/index.d.ts',
            },
        };

        // 添加所有模块到exports
        this.config.modules.forEach(module => {
            const exportKey = `./${module.name}`;
            mainExports[exportKey] = {
                import: `./dist/${module.name}/index.esm.js`,
                require: `./dist/${module.name}/index.js`,
                types: `./dist/${module.name}/index.d.ts`,
            };
        });

        // 如果有需要，可以保存到文件或直接更新package.json
        console.log('✅ Main exports configuration ready');
        return mainExports;
    }
}

module.exports = BuildTool;
