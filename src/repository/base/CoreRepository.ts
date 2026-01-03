import { WithEvents } from '@orbitjs/event';
import { composeMixins } from '@orbitjs/utils';
import { ILogger, Logger } from '@orbitjs/logger';
import { CRUD_ACTION, RepositoryConfig, RequestContext, RequestProcessors } from '../types';
import { DefaultRequestProcessors } from '../processors/request/DefaultRequestProcessors';

// 假设你已有的 Mixin 工具
const BaseWithEvents = composeMixins(Object as any, [WithEvents]);

export abstract class CoreRepository extends (BaseWithEvents as any) {
    protected abstract repoRequestProcessors: RequestProcessors;
    protected rowKey: string = 'id'; // 默认前端/数据库主键
    protected basePath: string = ''; // 默认 API 路径前缀
    protected logger: ILogger;

    constructor(protected config: RepositoryConfig) {
        super();
        this.logger = Logger.for(this.constructor.name);
    }

    /**
     * 核心分发器
     */
    protected async sendRequest(action: CRUD_ACTION, payload: any): Promise<any> {
        // 1. 发送前先过一遍“洗菜”逻辑
        const processedPayload = this.transformRequestData(payload, action);

        // 2. 交给“搬运工”装箱
        const context = this.buildRequest(action, processedPayload);

        this.logger.debug(`[${action}] Request Prep:`, {
            url: context.url,
            method: context.method,
            params: context.options.pathParams,
            query: context.options.queryParams,
        });

        // 2. 事件与请求
        this.emit(`${action}:loading`, true);
        try {
            const res = await this.config.httpClient.request(
                context.method,
                context.url,
                context.options
            );
            this.emit(`${action}:success`, res);
            return res;
        } catch (err) {
            this.emit(`${action}:error`, err);
            throw err;
        } finally {
            this.emit(`${action}:loading`, false);
        }
    }

    protected buildRequest(action: CRUD_ACTION, payload: any): RequestContext {
        // 1. 三方取值 & 深度合并 (优先级：Repo > Domain > System)
        // 这里我们合并的是 Processor 或者是包含 Processor 的配置对象
        const processor =
            this.repoRequestProcessors[action] ||
            this.config.requestProcessors?.[action] ||
            DefaultRequestProcessors[action];

        // 2. 初始化标准“集装箱”
        const context: RequestContext = {
            method: 'GET', // 默认，具体会在 processor 内部被修正
            url: this.basePath,
            meta: {
                basePath: this.basePath,
                rowKey: this.rowKey,
                action: action,
            },
            options: { pathParams: [], queryParams: {}, body: undefined },
        };

        // 3. 执行搬运
        if (!processor) {
            throw new Error(`[Repo Error]: Action "${action}" 没有任何可用的处理器。`);
        }

        return processor(context, payload);
    }

    /**
     * [生命周期钩子] 转换请求载荷
     * 默认原样返回。子类可覆写此方法统一处理日期、空值等。
     */
    protected transformRequestData(payload: any, action: CRUD_ACTION): any {
        return payload;
    }
}
