/**
 * EntityAbility 实体管理能力
 *
 * 提供 mgr 属性和 entityConfig 配置，自动代理 mgr 的公共方法到组件实例
 */

import type { AbilityDefinition } from '@qimenjs/composable';

/**
 * 首字母大写
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const EntityAbility: AbilityDefinition = {
    /**
     * EntityManager 实例
     */
    mgr: {
        get(): any {
            return this.abilityState('EntityAbility:mgr', () => null);
        },
        set(value: any): void {
            this.setAbilityState('EntityAbility:mgr', value);
        },
    },

    /**
     * entityConfig 配置
     */
    entityConfig: {
        get(): any {
            return this.abilityState('EntityAbility:config', () => null);
        },
        set(value: any): void {
            this.setAbilityState('EntityAbility:config', value);
        },
    },

    /**
     * 初始化实体管理
     */
    __init__: '_initEntity',

    _initEntity(): void {
        const config = this.entityConfig;
        if (!config) return;

        // 1. 根据 entityConfig 创建 EntityManager
        if (config.domain && config.schema && config.type) {
            try {
                const { createEntityManager } = require('@qimenjs/entity');
                if (typeof createEntityManager === 'function') {
                    this.mgr = createEntityManager(config);
                }
            } catch (e) {
                // EntityManager 创建失败
                console.error('EntityAbility: failed to create EntityManager', e);
            }
        }

        // 2. 代理 mgr 的公共方法到组件实例
        if (this.mgr) {
            this._proxyMgrMethods();
        }

        // 3. 注册 dataChange 事件到 EventSourceRegistrar
        if (this.id && this.mgr) {
            try {
                const { EventSourceRegistrar } = require('@qimenjs/events');
                EventSourceRegistrar.getInstance().register(this.id, this);

                if (typeof this.mgr.on === 'function') {
                    this.mgr.on('dataChange', () => {
                        this.emitUI?.('dataChange', { source: this.id });
                    });
                }
            } catch (e) {
                // EventSourceRegistrar 不可用
            }
        }
    },

    /**
     * 代理 mgr 的公共方法到组件实例
     */
    _proxyMgrMethods(): void {
        const mgr = this.mgr;
        if (!mgr) return;

        const methodNames = this._getMgrMethodNames();
        for (const name of methodNames) {
            if (typeof mgr[name] === 'function' && !this[name]) {
                this[name] = this._createProxyMethod(name);
            }
        }
    },

    /**
     * 创建代理方法（含 before/after 钩子）
     */
    _createProxyMethod(methodName: string): (...args: any[]) => any {
        return function(this: any, ...args: any[]): any {
            const beforeHook = this[`before${capitalize(methodName)}`];
            const afterHook = this[`after${capitalize(methodName)}`];

            // before 钩子：可修改参数，返回 false 阻止调用
            if (typeof beforeHook === 'function') {
                const result = beforeHook.apply(this, args);
                if (result === false) return;
            }

            // 调用 mgr 方法
            const mgrResult = this.mgr[methodName](...args);

            // after 钩子：可处理结果
            if (typeof afterHook === 'function') {
                afterHook.call(this, mgrResult);
            }

            return mgrResult;
        };
    },

    /**
     * 获取 mgr 的公共方法名列表
     */
    _getMgrMethodNames(): string[] {
        const mgr = this.mgr;
        if (!mgr) return [];

        return Object.getOwnPropertyNames(Object.getPrototypeOf(mgr))
            .filter(name => name !== 'constructor' && typeof mgr[name] === 'function');
    },
};
