import { Registry } from "../registrars";
import { EntityEntry, FieldMapping, IEntity } from "../types";

// kernel/entities/EntityManager.ts
export abstract class EntityManager<T> {
    // --- 声明区 ---
    protected readonly domain: string = 'global';
    protected readonly entityName: string = '';
    
    // 这里就是你说的：定义需要拉取的公共模板名称
    // 比如：['BaseMapping', 'AuditFields', 'Pagination']
    protected readonly useTemplates: string[] = []; 

    // --- 属性区 ---
    protected idKey?: string;
    protected schema: FieldMapping[] = [];

    constructor() {
        this.initFlowContext();
    }

    private initFlowContext() {
        // 1. 自动拉取声明的模板
        const combinedTemplate = this.useTemplates.reduce((acc, templateName) => {
            const template = Registry.getTemplate(templateName);
            return {
                ...acc,
                ...template,
                // schema 要特殊处理，执行数组合并
                schema: [...(acc.schema || []), ...(template.schema || [])]
            };
        }, {} as Partial<EntityEntry>);

        // 2. 优先级覆盖：子类定义 > 模板定义 > 系统默认
        this.idKey = this.idKey || combinedTemplate.idKey || 'id';
        this.schema = [...combinedTemplate.schema, ...this.schema];
        // ... 其他属性如 defaultSort 等
    }
}