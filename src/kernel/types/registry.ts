import { ENTITY_ACTION, FieldMapping } from './base';


export enum ProcessorType {
    // --- HTTP 流水线 (IO 层) ---
    HTTP_BEFORE = 'HTTP_BEFORE', // 特定业务的请求前置
    HTTP_AFTER = 'HTTP_AFTER', // 特定业务的请求后置
    HTTP_BEFORE_COMMON = 'HTTP_BEFORE_COMMON', // 全局请求前置 (如：添加 Token、Restful 路径处理)
    HTTP_AFTER_COMMON = 'HTTP_AFTER_COMMON', // 全局请求后置 (如：错误统一上报、格式预处理)

    // --- Entity 流水线 (逻辑层) ---
    ENTITY_BEFORE = 'ENTITY_BEFORE', // 特定实体的逻辑前置 (如：计算属性补充)
    ENTITY_AFTER = 'ENTITY_AFTER', // 特定实体的逻辑后置 (如：基因映射后的加工)
    ENTITY_BEFORE_COMMON = 'ENTITY_BEFORE_COMMON', // 全局逻辑前置 (如：通用的权限校验)
    ENTITY_AFTER_COMMON = 'ENTITY_AFTER_COMMON', // 全局逻辑后置 (如：自动日志打印)
}

/**
 * 定义执行流与抽屉的组合关系
 * 外部只需指定 Key，Registry 自动提取对应的多个抽屉
 */
export const PIPELINE_MAP: Record<string, ProcessorType[]> = {
    [ProcessorType.HTTP_BEFORE]: [ProcessorType.HTTP_BEFORE, ProcessorType.HTTP_BEFORE_COMMON],
    [ProcessorType.HTTP_AFTER]: [ProcessorType.HTTP_AFTER, ProcessorType.HTTP_AFTER_COMMON],
    [ProcessorType.ENTITY_BEFORE]: [
        ProcessorType.ENTITY_BEFORE,
        ProcessorType.ENTITY_BEFORE_COMMON,
    ],
    [ProcessorType.ENTITY_AFTER]: [ProcessorType.ENTITY_AFTER, ProcessorType.ENTITY_AFTER_COMMON],
};

export type PipelineTrigger =
    | ProcessorType.HTTP_BEFORE
    | ProcessorType.HTTP_AFTER
    | ProcessorType.ENTITY_BEFORE
    | ProcessorType.ENTITY_AFTER;

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

    type: ProcessorType; // 处理器类型
}

export interface DomainConfig {
    baseUrl: string; // 必须有，因为这是域的身份
    timeout?: number; // 可选：某些域（如上传域）可能需要更长的超时
    headers?: Record<string, string>; // 可选：一些固定的、非动态的 Header（如 AppID）
    custom?: Record<string, any>; // 预留：给插件或特殊业务存自定义数据
}
