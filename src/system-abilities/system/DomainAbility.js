"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainAbility = void 0;
const composable_1 = require("@/composable");
const registry_1 = require("@/registry");
const abilities_1 = require("../types/abilities");
/**
 * DomainAbility - 域能力类
 *
 * 该能力为宿主对象提供域（Domain）相关的配置信息访问功能。
 * 它通过 DomainRegistrar 单例获取域配置，并利用静态缓存机制提升性能。
 */
class DomainAbility extends composable_1.AbilityBase {
    constructor() {
        super(...arguments);
        /**
         * 能力名称（使用类名）
         */
        this.name = 'DomainAbility';
    }
    /**
     * 暴露域配置供宿主对象使用
     */
    expose() {
        return {
            /**
             * 域配置属性
             *
             * 使用 getter 延迟获取配置，并在 getter 中访问 this.host
             */
            domainConfig: {
                get: () => {
                    var _a, _b;
                    // 1. 尝试从缓存获取
                    let config = this.host.getStatic(abilities_1.DOMAIN_CACHE_SYMBOL);
                    // 2. 如果没有缓存，则初始化
                    if (!config) {
                        const domainName = this.host.domain;
                        if (domainName) {
                            config = registry_1.DomainRegistrar.getInstance().get(domainName);
                            this.host.setStatic(abilities_1.DOMAIN_CACHE_SYMBOL, config);
                            (_b = (_a = this.host.logger) === null || _a === void 0 ? void 0 : _a.debug) === null || _b === void 0 ? void 0 : _b.call(_a, `Domain [${domainName}] initialized and cached.`);
                        }
                    }
                    return config;
                },
                enumerable: true,
            },
        };
    }
}
exports.DomainAbility = DomainAbility;
/**
 * 能力描述
 */
DomainAbility.description = '域能力：提供域配置访问和管理能力';
/**
 * 能力依赖
 */
DomainAbility.deps = [];
//# sourceMappingURL=DomainAbility.js.map