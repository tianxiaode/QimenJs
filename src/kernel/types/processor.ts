import { FlowContext } from "./flow";

/**
 * 处理器类别：定义处理器的核心职责
 */
export enum ProcessorCategory {
    // === 前置准备阶段 (9000档) ===
    PREPARE = 'PREPARE',     // 环境/地址：BaseUrl 拼接、UUID 生成、多语言设置
    ENRICH = 'ENRICH',       // 数据增强：Params 序列化、Header 注入 (如 Token)

    // === 拦截校验阶段 (7000档) ===
    GUARD = 'GUARD',         // 门卫：权限检查、黑白名单、防抖拦截
    VALIDATE = 'VALIDATE',   // 校验：字段规则验证 (Schema Validation)

    // === 执行阶段 (5000档) ===
    TRANSPORT = 'IO',        // 传输：Fetch, WebSocket, LocalStorage 读写
    
    // === 后置处理阶段 (3000档) ===
    TRANSFORM = 'TRANSFORM', // 转换：Raw JSON 转 Entity、数据脱敏、格式化
    FALLBACK = 'FALLBACK',   // 容错：错误翻译、默认值填充、Mock 兜底

    // === 切面监控阶段 (1000档) ===
    SIDE_EFFECT = 'EFFECT'   // 副作用：日志上报、缓存更新、消息广播 (Notification)
}

export enum PriorityWeight {
    /** 9000+: 基础设施层 - 决定请求去哪 (URL 组装、协议转换) */
    INFRA = 9000,
    
    /** 7000-8999: 安全与门卫 - 决定请求能不能发 (Token、加签、权限) */
    SECURITY = 7000,
    
    /** 5100-6999: 请求侧加工 - 发之前的最后修饰 (全局参数注入、Mock 拦截) */
    PRE_PROCESS = 5100,

    /** 5000: 核心锚点 - 真正的 IO 发生地 (内部保留，禁止外部注册) */
    CORE_IO = 5000,

    /** 3100-4999: 响应侧加工 - 拿回数据后的第一手处理 (基因映射、解密) */
    POST_PROCESS = 3100,

    /** 1100-3099: 业务逻辑层 - 具体的业务 UI 响应逻辑 */
    BUSINESS = 1100,

    /** 0-1099: 辅助层 - 不影响数据的副作用 (日志、埋点、性能统计) */
    AUDIT = 0
}

export type ProcessHandler = (ctx: FlowContext) => Promise<void>;

/**
 * 处理器条目：包含逻辑和优先级
 */
export interface ProcessorEntry {
    id: string;
    category: ProcessorCategory; // 明确它的功能属性
    description: string;         // 给人类看的：说明具体业务意图
    
    isHttp?: boolean;            // 场景开关
    
    weight: PriorityWeight;              // 决定它在哪一层 (9000, 7000, 5000...)
    offset: number;              // 同层内的细微排序
    
    domain?: string;             // 业务域
    action?: string;             // 动作
    
    handler: ProcessHandler;
}
