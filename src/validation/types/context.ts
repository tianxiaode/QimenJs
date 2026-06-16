import type { ValidationRule } from '@orbitjs/schema';

export interface ExecutionStep {
    processor: string; // 处理器名称
    weight?: number; // 权重
    offset?: number; // 偏移量
    action: 'executed' | 'skipped' | 'terminated'; // 执行动作
    reason?: string; // 跳过或中断的原因（如：Guard Clause 拦截、值为空、规则不匹配）
    duration?: number; // 执行耗时（可选，用于性能分析）
    error?: any; // 错误信息
}

/**
 * 验证错误信息接口
 * 用于描述单个验证错误的结构
 */
export interface IValidationError {
    /**
     * 错误代码，用于标识错误类型
     * 例如: 'required', 'minLength', 'patternMismatch' 等
     */
    code: string;

    /**
     * 错误参数，可选字段，用于提供错误详情
     * 例如: { min: 5, max: 10 } 用于描述数值范围限制
     */
    params?: Record<string, any>;

    /**
     * 错误上下文，指示验证失败的上下文信息
     */
    context?: ValidationContext;
}

export interface ValidationContext {
    // --- 数据双轨制 ---
    /** 当前值：在管道中流转，可能被 transform 修改 */
    value: any;
    /** 初始值：从进入验证器那一刻起就锁死，不可变，用于对比 */
    readonly rawValue: any;

    // --- 规则引用 ---
    /** 当前正在跑的规则，开发者带的“私货”都在这上面 */
    readonly rule: ValidationRule;

    // --- 状态收集 ---
    /** 错误信息收集桶 */
    errors: IValidationError[];
    path?: string;
    terminate?: boolean; // 逻辑熔断信号：真则停止当前字段的所有后续 Processor
    status: {
        isUndefined: boolean;
        isNull: boolean;
        isNaN: boolean;
        /** 辅助：是否为空（undefined | null | "" | [] | {}） */
        isEmpty: boolean;
        /** 辅助：值是否被 transform 改动过 */
        isModified: boolean;
    };
    steps: ExecutionStep[];
    metadata: Record<string, any> & {
        hasError?: boolean; // 是否有错误（符合 IExecutableContext）
    };
    isChild?: boolean;
}

/**
 * 验证错误上下文信息
 *
 * 提供了以下常用字段作为参考，您也可以添加任意自定义字段：
 *
 * @property {string|string[]} path - 数据路径，如 'user.email' 或 ['user', 'email']
 * @property {string} field - 字段名称
 * @property {any} value - 字段当前值
 * @property {string} label - 字段显示标签
 * @property {any} parent - 父级数据
 * @property {any} root - 根级数据
 * @property {number} index - 数组索引（如果是数组项）
 * @property {string|number} key - 对象键（如果是对象属性）
 *
 * 除了上述字段，您可以通过任意键添加自定义上下文信息。
 */
export interface ValidationErrorContext {
    // 常用基础字段（作为参考和默认使用）
    context?: ValidationContext;
    field?: string;
    value?: any;
    label?: string;
    type?: string;
    parent?: any;
    root?: any;
    index?: number;
    key?: string | number;
    functionName?: string;
    arguments?: any[];

    // 允许任意自定义字段
    [key: string]: any;
}
