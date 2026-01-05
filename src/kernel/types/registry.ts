import { ENTITY_ACTION, FieldMapping } from './base';

export enum ProcessorPriority {
    CRITICAL = 0,
    SECURITY = 100,
    VALIDATION = 200,
    BUSINESS = 300,
    CORE_EXECUTE = 500, // http 请求通常在这里
    DATA_ALIGN = 600, // Schema 转换
    UI_FEEDBACK = 900,
}

export interface EntityEntry {
    name: string; // 实体唯一标识 (如 'User')
    idKey: string; // 主键名，默认 'id'
    labelKey?: string; // 显示名称字段，默认 'name'
    schema: FieldMapping[]; // 基因映射
    // 还可以扩展
    createdAtKey?: string; // 创建时间字段
    updatedAtKey?: string;
    // --- 新增 UI 行为属性 ---
    defaultSort?: {
        prop: string;
        order: 'ascending' | 'descending';
    };
    filterKeys?: string[]; // 用于本地模糊搜索的字段清单
}
/**
 * 处理器条目：包含逻辑和优先级
 */
export interface ProcessorEntry<T = any> {
    id?: string; // 可选，手动指定可覆盖
    handler: T; // 具体的逻辑函数
    priority: number; // 排序依据

    // --- 归属判定 ---
    domain?: string; // 所属业务域（如 order, user）
    action?: ENTITY_ACTION; // 动作类型

    // --- 流程位标识 (Flags) ---
    isHttp?: boolean;  //是否属于http处理器
    isEntity?: boolean; //是否属于实体管理的处理器
    isBefore?: boolean; //是否前置处理器
    isAfter?: boolean; //是否后置处理器
    isCommon?: boolean; // 为 true 时，匹配该流程下的所有 action 和 domain
}

export interface DomainConfig {
    baseUrl: string; // 必须有，因为这是域的身份
    timeout?: number; // 可选：某些域（如上传域）可能需要更长的超时
    headers?: Record<string, string>; // 可选：一些固定的、非动态的 Header（如 AppID）
    custom?: Record<string, any>; // 预留：给插件或特殊业务存自定义数据
}
