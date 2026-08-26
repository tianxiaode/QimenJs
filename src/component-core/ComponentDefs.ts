import { Definitions, OptionDefinition } from '@/composable/types';
import {
    COMPONENT_CORE_OPTIONS,
    COMPONENT_CORE_READONLY_OPTIONS,
    OPTION_HANDLER_KEY_TARGET_TO,
} from './constants';
import { OptionHandlerRegistrar } from './engine';

export const ComponentDefs: Definitions = {
    options: { ...COMPONENT_CORE_OPTIONS },

    property: {
        // 内部状态（外部不可见）
        _tplCache: null,
        _dirtyAttributes: null,
        _dirtyStyle: null,
        _dirtyI18n: null,
        _initializing: false,
        _templateInitialized: false,
        _disposing: false,

        // 只读标识（由框架/派生类设置）
        id: null,
        type: null,
        el: null,
        /** 组件dom元素，用于管理组件的生命周期和状态管理  */
        nodeElements: {},
        /** 子组件实例对象映射表，用于管理子组件的生命周期和状态管理  */
        nodeInstances: {},
        /** 组件是否为子组件容器 — 控制组件是否可容纳其他组件 */
        isItemContainer: false,
        /** 组件委托事件定义 */
        domEvents: null,
        /** 事件监听 */
        listens: null,
        /** 组件事件key，用于跨组件通信时发送和订阅事件的唯一标识符 */
        ...COMPONENT_CORE_READONLY_OPTIONS,
    },

    _onOptionChange(key: string, value: any, old: any, definition: OptionDefinition | any) {
        if (old === value) return;
        if (
            this._beforeOptionChange &&
            this._beforeOptionChange(key, value, old, definition) === false
        )
            return;
        const name = definition ? OPTION_HANDLER_KEY_TARGET_TO : key;
        const handler = OptionHandlerRegistrar.getInstance().get(name);
        if (!handler) {
            this.logger.warn('handler not found:', name, key, value, old, definition);
            return;
        }
        const result = handler.handler(value, this as any, definition);
        this.logger.info('[_onOptionChange]', name, key, value, old, definition, result);
        if (this._afterOptionChange) {
            this._afterOptionChange(name, result, key, value, old, definition);
        }
    },
} satisfies OptionDefinition;
