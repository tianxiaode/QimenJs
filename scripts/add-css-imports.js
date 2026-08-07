/**
 * 批量给组件添加CSS import
 */

const fs = require('fs');
const path = require('path');

const componentDir = path.resolve(__dirname, '../src/component');

const results = {
    added: [],
    skipped: [],
    already: []
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

    if (content.includes(`import './${cssFileName}'`) ||
        content.includes('import \'./') && content.includes('.css')) {
        results.already.push(componentPath);
        return;
    }

    if (!fs.existsSync(cssPath)) {
        results.skipped.push(componentPath);
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
    results.added.push(componentPath);

    console.log(`✓ ${componentName} -> ${cssFileName}`);
}

walk(componentDir);

console.log('\n统计:');
console.log(`  添加: ${results.added.length}`);
console.log(`  已有: ${results.already.length}`);
console.log(`  跳过: ${results.skipped.length}`);