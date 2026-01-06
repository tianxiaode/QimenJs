/**
 * 验证子系统上下文
 */
export interface ValidationContext {
    // --- 核心数据 ---
    value: any;            // 当前正在处理的值（可能是原始值，也可能是清洗后的）
    rawValue: any;         // 初始未动的原始值（用于重置或对比）
    allData: any;          // 整个实体的完整数据（用于 compare 跨字段校验）
    operator?: '===' | '!==' | '>' | '>=' | '<' | '<=';
    target?: any | ((ctx: ValidationContext) => any);
    
    // --- 指令暗示 (Hints/Flags) ---
    // 这些是从 ValidationRule 中提取出来的物理指令
    hints: {
        isCollection: boolean;    // 是否已被 separator 拆分为集合
        shouldBreak: boolean;     // 是否触发了“允许为空”的提前中断
        isAsync: boolean;         // 是否包含异步校验逻辑
    };

    // --- 错误收集 ---
    errors: Array<{
        station: string;   // 报错的检查站名称
        message: string;   // 规则定义的错误文案
        ruleType: string;  // 原始规则类型 (email/password等)
    }>;

    // --- 外部引用 ---
    rule: ValidationRule;  // 当前正在执行的规则引用
    meta: Record<string, any>; // 扩展元数据（如当前字段名、Schema信息）
}