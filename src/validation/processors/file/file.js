"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProcessor = void 0;
const registry_1 = require("@orbitjs/registry");
const errors_1 = require("../../errors");
// 1. 集合级校验（针对文件列表数量）
const LIST_CHECKS = [
    {
        key: 'minFiles',
        predicate: (fs, r) => fs.length >= r.minFiles,
        error: (fs, r, ctx) => errors_1.ValidationErrorBuilder.too_small(r.minFiles, fs, false, { ...ctx, actual: fs.length }),
    },
    {
        key: 'maxFiles',
        predicate: (fs, r) => fs.length <= r.maxFiles,
        error: (fs, r, ctx) => errors_1.ValidationErrorBuilder.too_large(r.maxFiles, fs, false, { ...ctx, actual: fs.length }),
    },
];
// 2. 元素级校验项集
const FILE_CHECKS = [
    {
        key: 'maxSize',
        predicate: (f, r) => f.size <= r.maxSize,
        error: (f, r, ctx) => errors_1.ValidationErrorBuilder.too_large(r.maxSize, f, false, { ...ctx, actual: f.size }),
    },
    {
        key: 'allowedTypes',
        predicate: (f, r) => {
            const mimeTypeRegistrar = registry_1.MimeTypeRegistrar.getInstance();
            const allowedSet = mimeTypeRegistrar.get(r.allowedTypes);
            return allowedSet.has(f.type);
        },
        error: (f, r, ctx) => errors_1.ValidationErrorBuilder.invalid_value(f, { ...ctx, expected: r.allowedTypes.join(',') }),
    },
];
const FileProcessor = async (context) => {
    const { value, rule } = context;
    const { allErrors = false, path = '' } = rule;
    const files = Array.isArray(value) ? value : [value];
    // 1. 使用 for...of 代替 forEach，支持真正的中断
    for (const check of LIST_CHECKS) {
        if (rule[check.key] !== undefined && !check.predicate(files, rule)) {
            context.errors.push(check.error(files, rule, context));
            if (!allErrors)
                return; // 真正的中断：后续 LIST 和 ITEM 都不跑了
        }
    }
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // 类型检查
        if (!(file instanceof File)) {
            context.errors.push(errors_1.ValidationErrorBuilder.type_mismatch('File', typeof file, context));
            if (!allErrors)
                return;
            continue;
        }
        const currentPath = Array.isArray(value) ? `${path}[${i}]` : path;
        for (const check of FILE_CHECKS) {
            // 只有 Rule 里配了才跑
            if (rule[check.key] !== undefined) {
                if (!check.predicate(file, rule)) {
                    // 仅在这里创建 itemContext，节省内存
                    const itemContext = { ...context, path: currentPath };
                    context.errors.push(check.error(file, rule, itemContext));
                    if (!allErrors)
                        return;
                }
            }
        }
    }
};
exports.FileProcessor = FileProcessor;
//# sourceMappingURL=file.js.map