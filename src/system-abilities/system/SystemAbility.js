"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemAbility = void 0;
const composable_1 = require("@/composable");
const registry_1 = require("@/registry");
/**
 * SystemAbility - 系统能力类
 *
 * 提供对系统级配置的访问能力，通过封装 SystemRegistrar 实现统一的系统配置管理。
 * 支持获取单项配置或全量配置，适用于需要读取系统信息的组件。
 */
class SystemAbility extends composable_1.AbilityBase {
    constructor() {
        super(...arguments);
        /**
         * 能力名称（使用类名）
         */
        this.name = 'SystemAbility';
    }
    /**
     * 暴露系统配置访问接口
     */
    expose() {
        const registrar = registry_1.SystemRegistrar.getInstance();
        /**
         * 系统配置访问函数
         */
        const systemConfig = (key) => {
            if (key !== undefined) {
                return registrar.get(key);
            }
            return registrar.getAll();
        };
        return {
            /**
             * 系统配置访问器
             */
            systemConfig,
        };
    }
}
exports.SystemAbility = SystemAbility;
/**
 * 能力描述
 */
SystemAbility.description = '系统能力：提供系统配置访问和管理能力';
/**
 * 能力依赖
 */
SystemAbility.deps = [];
//# sourceMappingURL=SystemAbility.js.map