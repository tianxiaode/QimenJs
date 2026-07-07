/**
 * EntityCoreAbility 实体核心能力
 *
 * 提供 EntityManager 实例管理和方法代理功能。
 * 从 EntityAbility 拆分而来，职责单一：
 * - mgr 属性管理（EntityManager 实例的创建与持有）
 * - entityConfig 配置
 * - 方法代理（将 mgr 的公共方法代理到组件实例，支持 before/after 钩子）
 *
 * 配合 EntityEmitAbility（事件转发）、EntityListenAbility（事件监听）和 SelectionAbility（选择状态管理）使用。
 */

import type { AbilityDefinition } from '@qimenjs/composable';

/**
 * 首字母大写
 */
function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const EntityCoreAbility: AbilityDefinition = {
    /**
     * EntityManager 实例
     */
    mgr: {
        get(): any {
            return this.abilityState('EntityCoreAbility:mgr', () => null);
        },
        set(value: any): void {
            this.setAbilityState('EntityCoreAbility:mgr', value);
        },
    },

    /**
     * entityConfig 配置
     */
    entityConfig: {
        get(): any {
            return this.abilityState('EntityCoreAbility:config', () => null);
        },
        set(value: any): void {
            this.setAbilityState('EntityCoreAbility:config', value);
        },
    },

    // ============================================
    // 初始化
    // ============================================

    /**
     * 初始化实体管理
     */
    __init__: '_initEntityCore',

    _initEntityCore(): void {
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
                console.error('EntityCoreAbility: failed to create EntityManager', e);
            }
        }

        // 2. 代理 mgr 的公共方法到组件实例
        if (this.mgr) {
            this._proxyMgrMethods();
        }

        // 3. 初始化选择模式
        if (config.selectionMode && typeof this.selectionMode !== 'undefined') {
            this.selectionMode = config.selectionMode;
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

            if (typeof beforeHook === 'function') {
                const result = beforeHook.apply(this, args);
                if (result === false) return;
            }

            const mgrResult = this.mgr[methodName](...args);

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

    /**
     * 从 props 初始化
     */
    __initProps(props: Record<string, any>): void {
        if (props.entityConfig) this.entityConfig = props.entityConfig;
    },
};
