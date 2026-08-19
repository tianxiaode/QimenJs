// ============================================================
// types/definitions.ts
// ============================================================

export interface OptionDecl {
    target?: string;
    targetProp?: string;
    default?: any;
}

export type OptionDefinition = Record<string, OptionDecl | any>;

export type Definitions = {
    options?: OptionDefinition;
    property?: Record<string, any>;
    [key: string]: any;
};

// ============================================================
// 类型工具 - 对齐 InferAbilities
// ============================================================

export type InferOptionDefault<T> = T extends { default: infer D } ? D : any;

export type InferOptions<T extends OptionDefinition> = {
    [K in keyof T]: T[K] extends OptionDecl ? InferOptionDefault<T[K]> : T[K];
};

/**
 * ✅ 从 Definitions 推导类型（对齐 InferAbilities）
 */
export type InferDefinitions<T extends Definitions> = (T['options'] extends OptionDefinition
    ? InferOptions<T['options']>
    : object) &
    (T['property'] extends Record<string, any> ? T['property'] : object) & {
        [K in keyof T as K extends 'options' | 'property' ? never : K]: T[K];
    };
