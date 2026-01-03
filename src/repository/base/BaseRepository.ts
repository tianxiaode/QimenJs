import { WithEvents } from '@orbitjs/event';
import { composeMixins } from '@orbitjs/utils';
import { ActionStrategy, CRUD_ACTION, ProtocolStrategy, SYSTEM_REST_DEFAULTS } from '../types';

const BaseRepoWithEvents = composeMixins(Object as any, [WithEvents]);

export abstract class BaseRepository extends (BaseRepoWithEvents as any) {
    protected repoStrategy: ProtocolStrategy = {};
    protected queryState = {
        page: 1,
        size: 10,
        filters: {} as any,
    };

    async list(params: any) {
        return this.dispatch('list', params);
    }
    async all(params?: any) {
        return this.dispatch('all', params || {});
    }
    async toggle(id: any, field: string, val: boolean) {
        return this.dispatch('toggle', { id, [field]: val, _field: field });
    }

    protected async dispatch<T>(action: CRUD_ACTION, payload: any): Promise<T> {
        // 合并策略时，action 也是小写的，完美匹配 ProtocolStrategy
        const strategy = this.getFinalStrategy(action);
        // ...
        return this.transformResponse(response, strategy);
    }

    /**
     * 获取最终生效的策略
     */
    private getFinalStrategy(action: CRUD_ACTION): ActionStrategy {
        return {
            ...SYSTEM_REST_DEFAULTS[action], // 第一层：系统默认
            ...(this.domainConfig.strategy?.[action] || {}), // 第二层：域名配置
            ...(this.repoStrategy[action] || {}), // 第三层：仓储覆写
        };
    }
}
