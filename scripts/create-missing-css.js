/**
 * 批量为缺少CSS的组件创建CSS文件并添加import
 */

const fs = require('fs');
const path = require('path');

const componentDir = path.resolve(__dirname, '../src/component');

const results = {
    created: [],
    imported: [],
    skipped: []
};

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.name.endsWith('Component.ts')) {
            processComponent(fullPath);
        }
    }
}

function processComponent(componentPath) {
    const dir = path.dirname(componentPath);
    const componentName = path.basename(componentPath, '.ts');
    const cssFileName = componentName.replace('Component', '').toLowerCase() + '.css.ts';
    const cssPath = path.join(dir, cssFileName);
    
    let content = fs.readFileSync(componentPath, 'utf-8');
    
    const hasAddCls = content.includes("addCls('q-") || content.includes('addCls("q-');
    const hasRemoveCls = content.includes("removeCls('q-") || content.includes('removeCls("q-');
    const hasClsInTemplate = content.includes("cls: 'q-") || content.includes('cls: "q-');
    
    const usesStyles = hasAddCls || hasRemoveCls || hasClsInTemplate;
    
    if (!usesStyles) {
        return;
    }
    
    if (fs.existsSync(cssPath)) {
        if (!content.includes(`import './${cssFileName}'`)) {
            addImport(componentPath, cssFileName);
            results.imported.push(componentName);
        }
        return;
    }
    
    const className = extractClassName(content, componentName);
    if (!className) {
        results.skipped.push(componentName);
        return;
    }
    
    createCSSFile(cssPath, componentName, className);
    addImport(componentPath, cssFileName);
    
    results.created.push(componentName);
    console.log(`✓ ${componentName} -> ${cssFileName} (${className})`);
}

function extractClassName(content, componentName) {
    const addClsMatches = content.matchAll(/addCls\(['"]([^'"]+)['"]/g);
    const clsMatches = content.matchAll(/cls:\s*['"]([^'"]+)['"]/g);
    
    const classes = new Set();
    
    for (const match of addClsMatches) {
        classes.add(match[1]);
    }
    
    for (const match of clsMatches) {
        classes.add(match[1]);
    }
    
    if (classes.size === 0) return null;
    
    return Array.from(classes).find(cls => cls.startsWith('q-')) || Array.from(classes)[0];
}

function createCSSFile(cssPath, componentName, className) {
    const name = componentName.replace('Component', '');
    
    const content = `/**
 * ${name} 组件样式 — Metro 风格
 */

export const ${name.toLowerCase()}CSS = \`
/* ${name} */
.${className} {
    /* TODO: 添加样式 */
}
\`;
`;
    
    fs.writeFileSync(cssPath, content, 'utf-8');
}

function addImport(componentPath, cssFileName) {
    let content = fs.readFileSync(componentPath, 'utf-8');
    
    if (content.includes(`import './${cssFileName}'`)) {
        return;
    }
    
    const lines = content.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/^import\s+.*from\s+['"]/)) {
            insertIndex = i + 1;
        } else if (insertIndex > 0 && !lines[i].match(/^import\s+/)) {
            break;
        }
    }
    
    const importStatement = `import './${cssFileName}';`;
    lines.splice(insertIndex, 0, importStatement);
    
    fs.writeFileSync(componentPath, lines.join('\n'), 'utf-8');
}

walk(componentDir);

console.log('\n统计:');
console.log(`  创建CSS: ${results.created.length}`);
console.log(`  添加import: ${results.imported.length}`);
console.log(`  跳过: ${results.skipped.length}`);