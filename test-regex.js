const { resolve, relative } = require('path');
const { existsSync, readdirSync } = require('fs');

const pattern = 'src/pages/**/*.ts';
const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*');
const regex = new RegExp('^' + regexPattern + '$');

console.log('pattern:', pattern);
console.log('regexPattern:', regexPattern);
console.log('regex:', regex);

const cwd = 'D:/Workspace/projects/QimenJs/examples/showcase';
const testPaths = [
    'src/pages/HomePage.ts',
    'src/pages/ComponentsPage.ts',
    'pages/HomePage.ts'
];

testPaths.forEach(p => {
    console.log(`  ${p} -> ${regex.test(p)}`);
});