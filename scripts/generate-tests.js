// scripts/generate-tests.js
const fs = require('fs');
const path = require('path');

class TestDirectoryGenerator {
  constructor(options = {}) {
    this.options = {
      srcDir: options.srcDir || 'src',
      testDir: options.testDir || 'test/unit',
      fileExtensions: options.fileExtensions || ['.ts', '.js', '.tsx', '.jsx'],
      excludeFiles: options.excludeFiles || ['index']
    };
  }

  /**
   * 生成测试目录结构
   */
  generate() {
    console.log(`开始生成测试目录结构...`);
    console.log(`源目录: ${this.options.srcDir}`);
    console.log(`测试目录: ${this.options.testDir}`);

    if (!fs.existsSync(this.options.srcDir)) {
      throw new Error(`源目录不存在: ${this.options.srcDir}`);
    }

    this.createTestDirectoryStructure(this.options.srcDir, this.options.testDir);
    console.log('测试目录结构生成完成!');
  }

  /**
   * 递归创建测试目录结构
   */
  createTestDirectoryStructure(srcPath, testPath) {
    const items = fs.readdirSync(srcPath);

    for (const item of items) {
      const srcItemPath = path.join(srcPath, item);
      const stat = fs.statSync(srcItemPath);

      if (stat.isDirectory()) {
        // 递归处理子目录
        this.createTestDirectoryStructure(
          srcItemPath,
          path.join(testPath, item)
        );
      } else if (this.isSourceFile(item) && !this.isExcludedFile(item)) {
        // 为源文件创建测试文件，但排除特定文件
        this.createTestFile(srcItemPath, testPath, item);
      }
    }
  }

  /**
   * 判断是否为源文件
   */
  isSourceFile(filename) {
    return this.options.fileExtensions.some(ext => filename.endsWith(ext));
  }

  /**
   * 判断是否为需要排除的文件
   */
  isExcludedFile(filename) {
    const basename = path.basename(filename, path.extname(filename));
    return this.options.excludeFiles.includes(basename);
  }

  /**
   * 创建测试文件
   */
  createTestFile(srcFilePath, testDir, filename) {
    // 确保测试目录存在
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // 生成测试文件名
    const testFilename = this.generateTestFileName(filename);
    const testFilePath = path.join(testDir, testFilename);

    // 如果测试文件已存在，则跳过
    if (fs.existsSync(testFilePath)) {
      console.log(`跳过(已存在): ${testFilePath}`);
      return;
    }

    // 生成测试文件内容
    const testContent = this.generateTestFileContent(srcFilePath, filename);
    
    // 写入测试文件
    fs.writeFileSync(testFilePath, testContent);
    console.log(`创建: ${testFilePath}`);
  }

  /**
   * 生成测试文件名
   */
  generateTestFileName(filename) {
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    return `${basename}.test${ext}`;
  }

  /**
   * 生成测试文件内容模板
   */
  generateTestFileContent(srcFilePath, filename) {
    const ext = path.extname(filename);
    const relativeSrcPath = path.relative(this.options.testDir, srcFilePath);
    
    switch (ext) {
      case '.ts':
      case '.tsx':
        return this.generateTypeScriptTestTemplate(relativeSrcPath, filename);
      case '.js':
      case '.jsx':
        return this.generateJavaScriptTestTemplate(relativeSrcPath, filename);
      default:
        return this.generateDefaultTestTemplate(relativeSrcPath, filename);
    }
  }

  /**
   * TypeScript测试文件模板
   */
  generateTypeScriptTestTemplate(relativeSrcPath, filename) {
    const moduleName = path.basename(filename, path.extname(filename));
    return `import { ${moduleName} } from '${relativeSrcPath.replace(/\\/g, '/')}';

describe('${moduleName}', () => {
  beforeEach(() => {
    // 测试前的准备工作
  });

  afterEach(() => {
    // 测试后的清理工作
  });

  it('should be defined', () => {
    expect(${moduleName}).toBeDefined();
  });

  // TODO: 添加更多测试用例
});
`;
  }

  /**
   * JavaScript测试文件模板
   */
  generateJavaScriptTestTemplate(relativeSrcPath, filename) {
    const moduleName = path.basename(filename, path.extname(filename));
    return `const { ${moduleName} } = require('${relativeSrcPath.replace(/\\/g, '/')}');

describe('${moduleName}', () => {
  beforeEach(() => {
    // 测试前的准备工作
  });

  afterEach(() => {
    // 测试后的清理工作
  });

  it('should be defined', () => {
    expect(${moduleName}).toBeDefined();
  });

  // TODO: 添加更多测试用例
});
`;
  }

  /**
   * 默认测试文件模板
   */
  generateDefaultTestTemplate(relativeSrcPath, filename) {
    const moduleName = path.basename(filename, path.extname(filename));
    return `// TODO: 为 ${filename} 实现测试

describe('${moduleName}', () => {
  it('should be defined', () => {
    // 添加测试逻辑
    expect(true).toBe(true);
  });
});
`;
  }
}

// 命令行使用接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--src':
        options.srcDir = args[++i];
        break;
      case '--test':
        options.testDir = args[++i];
        break;
      case '--ext':
        options.fileExtensions = args[++i].split(',');
        break;
      case '--exclude':
        options.excludeFiles = args[++i].split(',');
        break;
    }
  }

  try {
    const generator = new TestDirectoryGenerator(options);
    generator.generate();
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

module.exports = { TestDirectoryGenerator };