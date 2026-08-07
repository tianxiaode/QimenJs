const { resolve, dirname, basename } = require('path');
const { existsSync, readFileSync, readdirSync } = require('fs');

const componentDir = 'D:/Workspace/projects/QimenJs/src/component';
const map = new Map();

function scanComponentDirectory(dir, map) {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = resolve(dir, entry.name);

        if (entry.isDirectory()) {
            scanComponentDirectory(fullPath, map);
        } else if (entry.name.endsWith('Component.ts')) {
            const componentName = basename(entry.name, '.ts');
            const content = readFileSync(fullPath, 'utf-8');

            const hasImport = content.includes("import './") && content.includes('.css');

            if (hasImport) {
                map.set(fullPath, { componentName, hasImport });
            }
        }
    }
}

scanComponentDirectory(componentDir, map);
console.log('Found:', map.size, 'components with CSS import');
const arr = Array.from(map.entries()).slice(0, 10);
arr.forEach(([path, info]) => console.log('  ', info.componentName));