"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomEventsAbility = void 0;
const event_dom_1 = require("@orbitjs/event-dom");
const composable_1 = require("../../composable");
/**
 * DomEventsAbility - DOM事件能力
 *
 * 为类提供绑定DOM事件的能力，创建事件适配器来处理各种手势事件
 */
class DomEventsAbility extends composable_1.AbilityBase {
    constructor() {
        super(...arguments);
        this.name = 'DomEvents';
    }
    /**
     * 获取或创建事件适配器
     *
     * @returns 事件适配器实例
     * @private
     */
    getAdapter() {
        if (!this._adapter) {
            this._adapter = (0, event_dom_1.createEventAdapter)();
        }
        return this._adapter;
    }
    /**
     * 暴露绑定事件的方法
     *
     * @returns 包含bind方法的对象，用于绑定DOM事件
     */
    expose() {
        return {
            /**
             * 绑定DOM事件到目标元素
             *
             * @param target 事件目标元素
             * @param semantic 手势语义类型
             * @param options 绑定选项
             * @returns 绑定结果
             */
            bind: (target, semantic, options) => {
                const scope = this.host.eventScope;
                return this.getAdapter().bind(target, semantic, scope, options, this.host);
            },
        };
    }
    /**
     * 在能力被释放时清理资源
     */
    onDispose() {
        if (this._adapter) {
            this._adapter = undefined;
        }
    }
}
exports.DomEventsAbility = DomEventsAbility;
//# sourceMappingURL=DomEventsAbility.js.map