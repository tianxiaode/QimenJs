import { MimeTypeRegistrar } from '@qimenjs/mime';
import { ValidationErrorBuilder } from '../../errors';
import {
    IValidationError,
    ValidationContext,
    ValidationProcessorHandler,
    ValidationRule,
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
        predicate: (f, r) => {
            const mimeTypeRegistrar = MimeTypeRegistrar.getInstance();
            const allowedSet = mimeTypeRegistrar.get(r.allowedTypes as string[]);
            return allowedSet.has(f.type);
        },
        error: (f, r, ctx) =>
            ValidationErrorBuilder.invalid_value(f, { ...ctx, expected: r.allowedTypes.join(',') }),
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
