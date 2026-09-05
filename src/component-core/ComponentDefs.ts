import { Definitions } from '@/composable/types';
import { HIDDEN_MODE } from './constants';
import { OPTION_ATTRIBUTE_PROPS, OPTION_STYLE_PROPS } from './constants';

export const ComponentDefs: Definitions = {
    /** 组件类型 — 控制组件的类型和用途 */
    options: {
        /** 组件状态 — 控制组件的启用状态 */
        disable: false,
        /** 控制组件是否隐藏 — 控制组件的显示状态 */
        hidden: false,
        /**
         * 控制组件隐藏模式 - 可根据该值返回对应的css样式，
         * 值包括 'display'、'visibility'、'opacity' 等，具体样式由组件实现。默认为 'display'。
         * */
        hiddenMode: HIDDEN_MODE.display,
        /** 组件顺序 — 控制组件的显示顺序 */
        order: 0,
        /** 组件行为 -与事件绑定相关，不如发布实体的save事件 */
        action: null,
        /** 组件角色 — 控制组件的类型和用途 */
        role: null,
        /** 组件样式 — 控制组件的样式 */
        style: null,
        /** 组件类名 — 控制组件的类名 */
        classes: null,
        /** 组件提示信息 — 控制组件的提示信息 */
        hint: null,
        /** 组件属性 — 控制组件的属性 */
        attributes: null,
        /** 组件鼠标样式 — 控制组件的鼠标样式 */
        cursor: null,
        /** 组件圆角 — 档位名(none/xs/sm/md/lg/xl/round)或直接CSS值(如4px)，null跟随全局 */
        radius: null,
        /** 是否浮动组件 — 浮动组件初始化时不播放进入动画 */
        isFloat: false,
        /** 定位样式 */
        left: null,
        top: null,
        right: null,
        bottom: null,
        width: null,
        height: null,
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
        position: null,
        zIndex: null,
        transform: null,
        /** 权限配置 — 控制组件的访问权限 */
        permission: null,
        cssPrefix: null,
    },

    fields: {
        /** 组件id — 控制组件的唯一标识符 */
        id: null,
        /** 是否有父组件 — 控制组件是否为子组件容器 */
        hasParent: false,
        /** 组件容器 — 控制组件的容器，用于管理组件的生命周期和状态管理  */
        container: null,
        /** 组件el */
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
        /** 组件事件key- 用于组件之间订阅和发送事件的唯一标识符  */
        eventKey: null,
        /**
         * 组件实体key — 用于与实体通信时订阅和发送实体事件的唯一标识符
         */
        entityKey: null,
        /** 组件动画配置 */
        animation: null,
        /** 定义组件角标，可参考BadgeOptions的定义  */
        badge: null,
        /**
         * 组件提示信息 — 控制组件的提示信息
         */
        tooltip: null,
        /** 对话框 */
        dialog: null,
        /** 弹出层 */
        popover: null,
        /** 指示器配置 */
        indicator: null,
        /** 加载配置 */
        loading: null,
        /**
         * 拖拽开关 — 控制组件是否可拖拽
         *
         * 两种使用场景：
         * 1. **Self-Drag（自身拖动）**：如 Dialog 窗口拖动
         *    - drag: true → 启用，使用 dragHandle 或模板中的 drag 节点作为手柄
         *    - drag: false → 禁用
         *
         * 2. **Drag & Drop（拖放交互）**：如卡片拖入容器
         *    - drag: true → 启用，dragType 自动使用 component.type
         *    - drag: { type: 'item' } → 启用，伪装为 'item' 类型
         *
         * @example
         * class DialogComponent extends Component {
         *   _drag = { handle: 'header' };                    // 启用拖拽
         *   // new DialogComponent({ drag: false }) → 禁用
         * }
         *
         * class CardComponent extends Component {
         *   _drag: true
         * };                    // 拖拽类型自动为 'Card'（类名派生）
         *   // 拖到容器时，容器 accept: [CardComponent] 即可匹配
         * }
         */
        drag: null,
        /**
         * 放置区开关 — 控制组件是否可接收拖放
         *
         * - `true`：启用，使用 dropZone 或模板中的 drop 节点作为放置区
         * - `false`：禁用（覆盖模板中的 drop 声明）
         * - `DropDecl`：启用并带配置（accept、activeClass 等）
         * - `undefined`：使用模板中的默认声明
         *
         * @example
         * class ContainerComponent extends Component {
         *   drop = { accept: [CardComponent], zone: 'content' };   // 启用放置区
         *   // new ContainerComponent({ drop: false }) → 禁用
         * }
         */
        drop: null,
        /**
         * 是否为容器 — 控制组件是否可容纳其他组件
         */
    },

    privateFields: {
        _initializing: false,
        _templateInitialized: false,
        _disposing: false,
    },

    overrides: {
        _onOptionChange(key: string, value: any, old: any): void {
            if (value === old) return;
            if (OPTION_STYLE_PROPS.has(key)) {
                this.setStyles({ [key]: value });
                return;
            }
            if (OPTION_ATTRIBUTE_PROPS.has(key)) {
                this.setAttributes({ [key]: value });
                return;
            }
        },
    },
};
