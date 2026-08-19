import { Definitions, OptionDefinition } from '@/composable/types';
import {
    COMPONENT_CORE_OPTIONS,
    COMPONENT_CORE_READONLY_OPTIONS,
    HIDDEN_MODE_CSS_MAP,
} from './constants';

export const ComponentDefs: Definitions = {
    options: { ...COMPONENT_CORE_OPTIONS },

    property: {
        // 内部状态（外部不可见）
        _tplCache: null,
        _dirtyAttributes: null,
        _dirtyStyle: null,
        _initializing: false,
        _templateInitialized: false,
        _disposing: false,

        // 只读标识（由框架/派生类设置）
        id: null,
        type: null,
        el: null,
        /** 组件dom元素，用于管理组件的生命周期和状态管理  */
        nodeElements: null,
        /** 子组件实例对象映射表，用于管理子组件的生命周期和状态管理  */
        nodeInstances: null,
        /** 组件是否为子组件容器 — 控制组件是否可容纳其他组件 */
        isItemContainer: false,
        /** 组件委托事件定义 */
        domEvents: null,
        /** 事件监听 */
        listens: null,
        /** 组件事件key，用于跨组件通信时发送和订阅事件的唯一标识符 */
        ...COMPONENT_CORE_READONLY_OPTIONS,
    },

    _onHintChange(value: any, old: any) {
        if (value === old) return;
        this.setAttribute('root', 'title', value);
    },

    _onHiddenChange(value: any, old: any) {
        if (value === old) return;
        const hiddenMode = this.hiddenMode;
        const css = (HIDDEN_MODE_CSS_MAP as any)[hiddenMode]; // 获取对应的css样式
        value ? this.addCls('root', css) : this.removeCls('root', css);
    },

    _onDisabledChange(value: any, old: any) {
        if (value === old) return;
        value ? this.addCls('root', 'disabled') : this.removeCls('root', 'disabled');
    },

    _onOptionChange(key: string, value: any, old: any, definition: OptionDefinition | any) {
        if (old === value) return;
        //包含节点映射，特殊处理
        if (definition && definition.target) {
            return;
        }

        if (key === 'attribute') {
            this.setAttributes('root', value);
        }

        if (key === 'style') {
            this.setStyles('root', value);
        }

        if (key === 'cls') {
            this.addCls('root', value);
        }

        if (key === 'orle') {
            this.setAttribute('root', 'role', value); // 设置节点属性
        }

        if (key === 'order') {
            value === 0
                ? this.setAttribute('root', 'order', undefined)
                : this.setAttribute('root', 'order', value.toString()); // 设置节点属性
        }

        if (key === 'cursor') {
            this.setStyle('root', 'cursor', value); // 设置节点属性
        }
    },
} satisfies OptionDefinition;
