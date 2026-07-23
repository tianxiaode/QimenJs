module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['@typescript-eslint'],
    env: {
        node: true, // ✅ 启用 Node.js 全局变量
        browser: true, // ✅ 启用浏览器全局变量
        es6: true, // ✅ 启用 ES6 语法支持
        jest: true, // ✅ 启用 Jest 测试全局变量
    },
    parserOptions: {
        ecmaVersion: 2020, // ✅ 使用 ES2020 语法
        sourceType: 'module', // ✅ 允许使用 import/export
    },
    rules: {
        '@typescript-eslint/no-unsafe-declaration-merging': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prettier/endOfLine': 'off',
    },
    overrides: [
        // 针对 JavaScript 文件的特定配置
        {
            files: ['**/*.js', '**/*.jsx'],
            env: {
                node: true, // ✅ 对 JS 文件启用 Node.js 环境
                es6: true, // ✅ 对 JS 文件启用 ES6
            },
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'script', // ✅ JS 文件可以使用 CommonJS
            },
        },
        // 针对构建脚本的配置
        {
            files: ['scripts/**/*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off', // ✅ 允许使用 require()
                'no-console': 'off', // ✅ 构建脚本允许使用 console
            },
        },
    ],
};
