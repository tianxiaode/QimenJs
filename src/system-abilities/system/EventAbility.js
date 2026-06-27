"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventAbility = void 0;
const composable_1 = require("@/composable");
const events_1 = require("@/events");
/**
 * EventAbility - 事件能力类
 *
 * 提供事件监听、一次性监听和事件发射的能力。
 * 通过创建独立的事件作用域（event scope）来管理事件，避免全局污染。
 * 每个实例拥有独立的事件生命周期。
 */
class EventAbility extends composable_1.AbilityBase {
    constructor() {
        super(...arguments);
        /**
         * 能力名称（使用类名）
         */
        this.name = 'EventAbility';
    }
    /**
     * 暴露事件相关的操作接口
     */
    expose() {
        // 创建事件作用域
        this.scope = events_1.globalEventBus.createEventScope();
        return {
            /**
             * 获取当前事件作用域
             */
            eventScope: { get: () => this.scope },
            /**
             * 监听事件
             */
            on: (event, handler) => this.scope.on(event, handler),
            /**
             * 监听一次性事件
             */
            once: (event, handler) => this.scope.once(event, handler),
            /**
             * 发射事件
             */
            emit: (event, data) => {
                this.scope.emit(event, data, this.host);
            },
        };
    }
    /**
     * 销毁事件作用域
     */
    onDispose() {
        var _a;
        (_a = this.scope) === null || _a === void 0 ? void 0 : _a.dispose();
        this.scope = null;
    }
}
exports.EventAbility = EventAbility;
/**
 * 能力描述
 */
EventAbility.description = '事件能力：提供事件监听、发射和管理能力';
/**
 * 能力依赖
 */
EventAbility.deps = [];
//# sourceMappingURL=EventAbility.js.map