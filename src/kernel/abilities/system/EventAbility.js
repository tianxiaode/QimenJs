"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventAbility = void 0;
const AbilityBase_1 = require("@/kernel/composable/AbilityBase");
const events_1 = require("@orbitjs/events");
/**
 * EventAbility - 事件能力类
 *
 * 提供事件监听、一次性监听和事件发射的能力。
 * 通过创建独立的事件作用域（event scope）来管理事件，避免全局污染。
 * 每个实例拥有独立的事件生命周期。
 */
class EventAbility extends AbilityBase_1.AbilityBase {
    constructor() {
        super(...arguments);
        this.name = 'Event';
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
//# sourceMappingURL=EventAbility.js.map