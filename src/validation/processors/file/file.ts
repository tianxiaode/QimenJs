import { ValidationRegistry } from '../../core';
import { ValidationErrorBuilder } from '../../errors';
import {
    IValidationError,
    ValidationContext,
    ValidationProcessorHandler,
    ValidationRule,
    ValidationWeight,
} from '../../types';

/** 校验项的基础契约 */
interface ValidatorItem<T, R = ValidationRule> {
    key: keyof R; // 必须是 Rule 中存在的字段
    predicate: (value: T, rule: R) => boolean;
    error: (value: T, rule: R, ctx: ValidationContext) => IValidationError;
}

/** 针对文件列表的校验类型 */
type FileListValidator = ValidatorItem<File[]>;

/** 针对单个文件的校验类型 */
type FileItemValidator = ValidatorItem<File>;

// 文件验证谓词映射对象
const filePredicates = {
    // 验证文件类型（MIME类型）
    allowedTypes: (file: File, rule: ValidationRule) => {
        return rule.allowedTypes.some((allowedType: string) => {
            // 支持通配符，例如 'image/*' 匹配所有图片类型
            if (allowedType.endsWith('/*')) {
                const mainType = allowedType.slice(0, -1); // 获取 'image/'
                return file.type.startsWith(mainType);
            }
            return file.type === allowedType;
        });
    },

    // 验证文件扩展名
    allowedExtensions: (file: File, rule: ValidationRule) => {
        const fileName = file.name.toLowerCase();
        return rule.allowedExtensions.some((ext: string) => {
            const normalizedExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
            return fileName.endsWith(normalizedExt);
        });
    },
};

// 1. 集合级校验（针对文件列表数量）
const LIST_CHECKS: FileListValidator[] = [
    {
        key: 'minFiles',
        predicate: (fs, r) => fs.length >= r.minFiles,
        error: (fs, r, ctx) =>
            ValidationErrorBuilder.too_small(r.minFiles, fs, false, { ...ctx, actual: fs.length }),
    },
    {
        key: 'maxFiles',
        predicate: (fs, r) => fs.length <= r.maxFiles,
        error: (fs, r, ctx) =>
            ValidationErrorBuilder.too_large(r.maxFiles, fs, false, { ...ctx, actual: fs.length }),
    },
];

// 2. 元素级校验项集
const FILE_CHECKS: FileItemValidator[] = [
    {
        key: 'maxSize',
        predicate: (f, r) => f.size <= r.maxSize,
        error: (f, r, ctx) =>
            ValidationErrorBuilder.too_large(r.maxSize, f, false, { ...ctx, actual: f.size }),
    },
    {
        key: 'allowedTypes',
        predicate: (f, r) => r.allowedTypes.length === 0 || filePredicates.allowedTypes(f, r),
        error: (f, r, ctx) =>
            ValidationErrorBuilder.invalid_value(f, { ...ctx, expected: r.allowedTypes.join(',') }),
    },
    {
        key: 'allowedExtensions',
        predicate: (f, r) =>
            r.allowedExtensions.length === 0 || filePredicates.allowedExtensions(f, r),
        error: (f, r, ctx) =>
            ValidationErrorBuilder.invalid_value(f, {
                ...ctx,
                expected: r.allowedExtensions.join(','),
            }),
    },
];
export const FileProcessor: ValidationProcessorHandler = async (context: ValidationContext) => {
    const { value, rule } = context;
    const { allErrors = false, path = '' } = rule;
    const files = Array.isArray(value) ? value : [value];

    // 1. 使用 for...of 代替 forEach，支持真正的中断
    for (const check of LIST_CHECKS) {
        if (rule[check.key] !== undefined && !check.predicate(files, rule)) {
            context.errors.push(check.error(files, rule, context));
            if (!allErrors) return; // 真正的中断：后续 LIST 和 ITEM 都不跑了
        }
    }

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // 类型检查
        if (!(file instanceof File)) {
            context.errors.push(ValidationErrorBuilder.type_mismatch('File', typeof file, context));
            if (!allErrors) return;
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
                    if (!allErrors) return;
                }
            }
        }
    }
};

ValidationRegistry.register({
    name: 'file',
    tags: ['file'],
    weight: ValidationWeight.SEMANTIC,
    offset: 10,
    execute: FileProcessor,
});
