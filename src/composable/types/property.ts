/**
 * 属性目标类型
 * - 'root': 当前节点自身
 * - 其他字符串: 子节点名称（通过 _name 或 data-name 查找）
 */
export type PropertyTargetName = 'root' | string;

// ============================================================
// PropertyDecl - 最终版
// ============================================================

export interface PropertyDecl {
    /**
     * 目标节点名称（'root' 表示自身，其他表示子节点）
     * 默认: 'root'
     *
     * @example
     * target: 'title'        // → 查找 [data-name="title"] 的子节点
     * target: 'root'         // → 组件自身 DOM 元素
     */
    target?: string;

    /**
     * 目标属性名
     * 默认: 'textContent'
     *
     * @example
     * targetProp: 'textContent'   // → el.textContent
     * targetProp: 'src'           // → el.src
     * targetProp: 'href'          // → el.href
     * targetProp: 'innerHTML'     // → el.innerHTML
     * targetProp: 'value'         // → el.value
     * targetProp: 'disabled'      // → el.disabled
     * targetProp: 'className'     // → el.className
     */
    targetProp?: string;

    /** 默认值（当属性未设置时返回此值） */
    default?: any;

    /** 是否自动生成 [key]I18n（国际化翻译） */
    isI18n?: boolean;

    /** 是否自动生成 [key]Permission（权限控制） */
    isPermission?: boolean;

    /** 是否自动生成 [key]Cls（默认 true） */
    hasCls?: boolean;

    /** 是否自动生成 [key]Style（默认 true） */
    hasStyle?: boolean;
}

export type PropertyDefinition = {
    isProperty: boolean;
    __name__?: string;
    [key: string]: PropertyDecl | boolean | string | undefined;
};

/**
 * ============================================================
 * 类型工具：从属性定义提取类型
 * ============================================================
 */

/**
 * 提取属性定义中的 default 类型
 */
export type InferPropertyDefault<T> = T extends { default: infer D } ? D : any;

/**
 * 从属性定义提取属性类型
 * - 有 default → 使用 default 类型
 * - 无 default → any
 */
export type InferProperty<T> = {
    [K in keyof T as K extends 'isProperty' | '__name__' | 'onPropertyInit'
        ? never
        : K]: T[K] extends PropertyDecl ? InferPropertyDefault<T[K]> : any;
};

/**
 * 从属性定义数组中提取交叉类型
 */
export type InferProperties<T extends readonly PropertyDefinition[]> = UnionToIntersectionProperty<
    InferProperty<T[number]>
>;

/**
 * 联合类型转交叉类型
 */
export type UnionToIntersectionProperty<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never;
