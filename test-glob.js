const { resolve, relative } = require('path');
const { existsSync, readdirSync } = require('fs');

function globSync(pattern, options) {
    const results = [];
    const { cwd } = options;

    if (!pattern.includes('*')) {
        const fullPath = resolve(cwd, pattern);
        if (existsSync(fullPath)) {
            results.push(pattern);
        }
        return results;
    }

    function walk(dir, base) {
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = resolve(dir, entry.name);
            const relPath = relative(base, fullPath).replace(/\\/g, '/');

            if (entry.isDirectory()) {
                walk(fullPath, base);
            } else {
                const regexPattern = pattern
                    .replace(/\./g, '\\.')
                    .replace(/\*\*/g, '.*')
                    .replace(/\*/g, '[^/]*');
                const regex = new RegExp('^' + regexPattern + '$');

                if (regex.test(relPath)) {
                    results.push(relPath);
                }
            }
        }
    }

    walk(cwd, cwd);
    return results;
}

const cwd = 'D:/Workspace/projects/QimenJs/examples/showcase';
const files1 = globSync('src/main.ts', { cwd });
const files2 = globSync('src/pages/**/*.ts', { cwd });

console.log('src/main.ts:', files1);
console.log('src/pages/**/*.ts:', files2);