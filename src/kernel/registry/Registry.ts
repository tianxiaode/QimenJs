// registry/Registry.ts
import { ILogger, Logger } from '@orbitjs/logger';
import { KernelError, KernelErrorCode } from '../errors';
import { ProcessorEntry, DomainConfig, EntityEntry } from '../types';
import { object } from '@orbitjs/utils';

export class Registry {
    private static processorPool: ProcessorEntry[] = [];
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

    static registerProcessor(entry: ProcessorEntry) {
        if (entry.id) {
            const index = this.processorPool.findIndex(p => p.id === entry.id);
            if (index !== -1) {
                this.processorPool[index] = entry;
                return;
            }
        }
        this.processorPool.push(entry);
    }

    /**
     * 核心：捞取公共流水线零件
     */
    static getPipeline<T = Function>(
        criteria: { isHttp?: boolean; isEntity?: boolean; isBefore?: boolean; isAfter?: boolean },
        context: { domain?: string; action?: string }
    ): T[] {
        return this.processorPool
            .filter(p => {
                // 1. 物理位置强制匹配
                if (p.isHttp !== criteria.isHttp) return false;
                if (p.isEntity !== criteria.isEntity) return false;
                if (p.isBefore !== criteria.isBefore) return false;
                if (p.isAfter !== criteria.isAfter) return false;

                // 2. 作用域判定
                if (p.isCommon) return true; // 全局公共件

                // 3. 按 domain 或 action 精确匹配的公共增强
                const domainMatch = p.domain ? p.domain === context.domain : true;
                const actionMatch = p.action ? p.action === context.action : true;

                return p.domain || p.action ? domainMatch && actionMatch : false;
            })
            .sort((a, b) => a.priority - b.priority)
            .map(p => p.handler as T);
    }
}
