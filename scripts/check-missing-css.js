/**
 * 检查哪些组件缺少CSS文件
 */

const fs = require('fs');
const path = require('path');

const componentDir = path.resolve(__dirname, '../src/component');
const missing = [];

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.name.endsWith('Component.ts')) {
            checkComponent(fullPath);
        }
    }
}

function checkComponent(componentPath) {
    const dir = path.dirname(componentPath);
    const componentName = path.basename(componentPath, '.ts');
    const cssFileName = componentName.replace('Component', '').toLowerCase() + '.css.ts';
    const cssPath = path.join(dir, cssFileName);
    
    const content = fs.readFileSync(componentPath, 'utf-8');
    
    const hasAddCls = content.includes("addCls('q-") || content.includes('addCls("q-');
    const hasRemoveCls = content.includes("removeCls('q-") || content.includes('removeCls("q-');
    const hasClsInTemplate = content.includes("cls: 'q-") || content.includes('cls: "q-');
    
    const usesStyles = hasAddCls || hasRemoveCls || hasClsInTemplate;
    
    if (usesStyles && !fs.existsSync(cssPath)) {
        const relativePath = path.relative(componentDir, componentPath);
        missing.push({
            component: componentName,
            path: relativePath,
            cssFile: cssFileName
        });
    }
}

walk(componentDir);

console.log('缺少CSS文件的组件（使用了样式）:\n');
missing.forEach(item => {
    console.log(`${item.component.padEnd(30)} -> ${item.cssFile}`);
});

console.log(`\n总计: ${missing.length} 个`);