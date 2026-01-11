// registry/Registry.ts
import { ILogger, Logger } from '@orbitjs/logger';
import { KernelError, KernelErrorCode } from '../errors';
import {
    EntityAction,
    DomainConfig,
    EntityEntry,
    ProcessorType,
    PipelineTrigger,
    PIPELINE_MAP,
    ActionStage,
} from '../types';
import { object } from '@orbitjs/utils';

export class Registry {
    private static processorMap = new Map<ProcessorType, EntityAction[]>();
    private static processorIdIndexMap = new Map<string, ProcessorType>();
    private static domainConfigs = new Map<string, DomainConfig>();
    private static systemConfig: Record<string, any> = {};
    private static templates = new Map<string, Partial<EntityEntry>>();
    private static logger: ILogger = Logger.for('Registry');

    /**
     * 注册一个公共模板
     * @param templateName 模板名称，如 "BaseUser", "AuditMapping"
     */
    /**
     * 注册模板
     * @param name 模板名称
     * @param config 配置内容
     * @param override 是否允许覆盖旧配置 (默认 false)
     */
    static registerTemplate(name: string, config: Partial<EntityEntry>, override: boolean = false) {
        if (this.templates.has(name) && !override) {
            throw new KernelError(
                `Template "${name}" already exists`,
                KernelErrorCode.REGISTRY_CONFLICT,
                { templateName: name }
            );
        }

        // 如果是增量更新（覆盖模式），建议执行深合并而非直接 set
        const exist = this.templates.get(name) || {};
        this.templates.set(name, override ? object.deepMerge(exist, config) : config);
    }

    static getTemplate(templateName: string): Partial<EntityEntry> {
        return this.templates.get(templateName) || {};
    }

    /**
     * 设置 Domain 的公共配置 (如 baseUrl)
     */
    static setDomainConfig(domain: string, config: Partial<DomainConfig>) {
        const exist = this.domainConfigs.get(domain);

        if (exist) {
            // 提醒开发者：你正在修改一个已存在的域配置
            // 使用 console.warn 而非 throw，保证程序继续运行但留下痕迹
            this.logger.warn(
                `Domain "${domain}" config is being updated. ` +
                    `Existing properties may be overwritten.`
            );
        }

        const base = exist || { baseUrl: '', timeout: 10000, custom: {} };

        // 执行深度合并，确保 custom 里的子对象不会被直接替换
        const newConfig = object.deepMerge(base, config);

        this.domainConfigs.set(domain, newConfig as DomainConfig);
    }

    /**
     * 系统级兜底配置
     */
    static patchSystem(config: Record<string, any>) {
        this.systemConfig = object.deepMerge(this.systemConfig, config);
    }

    /**
     * 合并获取某个域的最终配置
     */
    static getMergedConfig(domain: string): DomainConfig {
        const dConfig = this.domainConfigs.get(domain) || { baseUrl: '', custom: {} };
        // 优先级：Domain 配置覆盖 System 全局配置
        return {
            ...dConfig,
            custom: object.deepMerge(this.systemConfig, dConfig.custom || {}),
        } as DomainConfig;
    }

    // --- 2. 逻辑层：只管公共/可插拔的处理器 ---

    static registerProcessor(entry: EntityAction) {
        const { id, type, stage: weight, offset = 0 } = entry;

        // 1. 安全限制：Offset 不得超过 999
        // 1. 严格正向约束：不允许“向下潜”
        if (offset < 0) {
            throw new KernelError(
                `Illegal offset for [${id}]: ${offset}. Offset must be >= 0.`,
                KernelErrorCode.REGISTRY_INVALID_CONFIG
            );
        }

        // 2. 范围上限约束：不允许“跨层”
        // 确保偏移量不会让该层级膨胀到下一层
        if (offset > 1999) {
            throw new KernelError(
                `Offset ${offset} is too large. Max allowed is 1999.`,
                KernelErrorCode.REGISTRY_INVALID_CONFIG
            );
        }
        if (id && this.processorIdIndexMap.has(id)) {
            const oldType = this.processorIdIndexMap.get(id)!;
            const pool = this.processorMap.get(oldType) || [];
            const idx = pool.findIndex(p => p.id === id);
            if (idx !== -1) pool.splice(idx, 1);
        }

        // 2. 存入抽屉 & 更新索引
        if (id) this.processorIdIndexMap.set(id, type);
        if (!this.processorMap.has(type)) this.processorMap.set(type, []);
        this.processorMap.get(type)!.push(entry);

        // 3. 抽屉内排序（按 Weight + Offset）
        this.processorMap.get(type)!.sort((a, b) => b.stage - a.stage || b.offset - a.offset);
    }
    /**
     * 注销处理器
     * @param id 处理器的唯一标识
     */
    static unregisterProcessor(id: string) {
        // 1. 通过索引直接拿到它所在的抽屉类型
        const type = this.processorIdIndexMap.get(id);
        if (!type) return;

        // 2. 从对应的抽屉里移除
        const pool = this.processorMap.get(type);
        if (pool) {
            const index = pool.findIndex(p => p.id === id);
            if (index !== -1) {
                pool.splice(index, 1);
                this.logger.debug(`Processor "${id}" removed from ${type}.`);
            }
        }

        // 3. 销毁索引
        this.processorIdIndexMap.delete(id);
    }

    /**
     * 核心：捞取公共流水线零件
     */
    static getPipeline<T = Function>(
        trigger: PipelineTrigger,
        context: { domain?: string; action?: string }
    ): T[] {
        // 1. 强约束：如果 trigger 不在我们的组合表里，直接抛错
        const targetTypes = PIPELINE_MAP[trigger];
        if (!targetTypes) {
            throw new KernelError(
                `The trigger "${trigger}" is not a valid entry point. You must use a primary trigger (e.g., HTTP_BEFORE) instead of a COMMON type.`,
                KernelErrorCode.REGISTRY_INVALID_TRIGGER,
                { trigger, context }
            );
        }

        const allEntries = targetTypes.flatMap(type => this.fetchFromPool(type, context));

        // 3. 全局优先级大排队
        return allEntries
            .sort((a, b) => {
                if (b.weight !== a.weight) {
                    return b.weight - a.weight; // 权重高的排前面
                }
                return b.offset - a.offset; // 权重相同时，偏移量大的排前面
            })
            .map(p => p.handler as T);
    }
    /**
     * 内部方法：执行具体的过滤逻辑
     */
    private static fetchFromPool(
        type: ProcessorType,
        context: { domain?: string; action?: string }
    ): EntityAction[] {
        const pool = this.processorMap.get(type) || [];

        return pool.filter(p => {
            // 只要定义了，就必须匹配；没定义，就是该层级的通用逻辑
            const domainMatch = !p.domain || p.domain === context.domain;
            const actionMatch = !p.action || p.action === context.action;

            return domainMatch && actionMatch;
        });
    }
    /**
     * 获取所有已注册的 Domain 配置列表
     * @returns 一个包含 Domain 名称和对应 BaseUrl 的映射
     */
    static getDomainSummary() {
        const summary: Record<string, string> = {};
        this.domainConfigs.forEach((config, domain) => {
            summary[domain] = config.baseUrl;
        });
        return summary;
    }

    /**
     * 获取当前生效的所有处理器清单（调试用）
     */
    static getProcessorInspector(filter?: Partial<EntityAction>) {
        // 1. 展平 Map 结构
        let allEntries = Array.from(this.processorMap.entries()).flatMap(([type, pool]) => {
            return pool.map(p => ({ ...p, type }));
        });

        // 2. 基础过滤
        if (filter) {
            allEntries = allEntries.filter(p => {
                return Object.entries(filter).every(([key, value]) => (p as any)[key] === value);
            });
        }

        // 3. 进化后的排序逻辑
        return allEntries
            .sort((a, b) => {
                // 维度 1: 阶段排序 (BEFORE 永远在 AFTER 之前)
                const aIsBefore = a.type.includes('BEFORE');
                const bIsBefore = b.type.includes('BEFORE');
                if (aIsBefore !== bIsBefore) return aIsBefore ? -1 : 1;

                // 维度 2: 权重排序 (SYSTEM > SECURITY > CORE > ...)
                if (b.stage !== a.stage) return b.stage - a.stage;

                // 维度 3: 偏移量排序 (同权重下比数字大小)
                return b.offset - a.offset;
            })
            .map(p => ({
                ID: p.id || '--',
                Type: p.type,
                // 将 Weight 数值还原为语义标签，调试更直观
                Weight: this.formatWeightLabel(p.stage),
                Offset: p.offset,
                Scope: this.formatScope(p),
                Domain: p.domain || '*',
                Action: p.action || '*',
            }));
    }

    /**
     * 辅助方法：将数字权重映射回标签
     */
    private static formatWeightLabel(weight: number): string {
        // 寻找枚举中对应的 Key
        return (
            Object.keys(ActionStage).find(key => (ActionStage as any)[key] === weight) ||
            `Custom(${weight})`
        );
    }
    /**
     * 辅助方法：格式化作用域，一眼看出是全局还是专用
     */
    private static formatScope(p: EntityAction): string {
        if (!p.domain && !p.action) return 'Global (All)';
        if (p.domain && !p.action) return `Domain Only (${p.domain})`;
        if (!p.domain && p.action) return `Action Only (${p.action})`;
        return 'Specific (D+A)';
    }

    static inspect() {
        const list = this.getProcessorInspector();

        console.group(
            '%c 🛡️ Kernel Processor Pipeline ',
            'background: #222; color: #00e676; padding: 4px;'
        );

        const befores = list.filter(p => p.Type.includes('BEFORE'));
        const afters = list.filter(p => p.Type.includes('AFTER'));

        if (befores.length > 0) {
            console.log(
                '%c[PRE-PROCESSORS] (Before Execution)',
                'color: #2196f3; font-weight: bold;'
            );
            console.table(befores);
        }

        if (afters.length > 0) {
            console.log(
                '%c[POST-PROCESSORS] (After Execution)',
                'color: #ff9800; font-weight: bold;'
            );
            console.table(afters);
        }

        // 打印 Domain 配置作为参考
        const domains = this.getDomainSummary();
        if (Object.keys(domains).length > 0) {
            console.log('%c[Domain Configs]', 'color: #9c27b0; font-weight: bold;');
            console.table(domains);
        }

        console.groupEnd();
    }
}
