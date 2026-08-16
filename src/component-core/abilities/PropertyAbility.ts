import { PropertyDefinition } from '@/composable/types';

export const PropertyAbility: PropertyDefinition = {
    isProperty: true,
    __name__: 'PropertyAbility', // 这里可以添加更多的属性或方法

    id: { default: null },
    type: { default: null },
    /** 组件状态 — 控制组件的显示状态 */
    state: { default: null },
    /** 组件状态 — 控制组件的启用状态 */
    disable: { default: false },
    /** 组件行为 -与事件绑定相关，不如发布实体的save事件 */
    action: { default: null },
    /** 控制组件是否隐藏 — 控制组件的显示状态 */
    hidden: { default: false },
    /**
     * 控制组件隐藏模式 - 可根据该值返回对应的css样式，
     * 值包括 'display'、'visibility'、'opacity' 等，具体样式由组件实现。默认为 'display'。
     * */
    hiddenMode: { default: 'display' },
    /** 组件顺序 — 控制组件的显示顺序 */
    order: { default: 0 },
    /** 组件角色 — 控制组件的类型和用途 */
    role: { default: null },
    /** 组件委托事件定义 */
    domEvents: { default: [] },
    /** 组件事件key，用于跨组件通信时发送和订阅事件的唯一标识符 */
    eventKey: { default: null },
    /**
     * 组件实体key — 用于与实体通信时订阅和发送实体事件的唯一标识符
     */
    entityKey: { default: null },
    /** 定义组件角标，可参考BadgeOptions的定义  */
    badge: { default: null },
    /**
     * 组件提示信息 — 控制组件的提示信息
     */
    tooltip: { default: null },
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
    drag: { default: false },
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
    drop: { default: false },
    /**
     * 是否为容器 — 控制组件是否可容纳其他组件
     */
    isItemContainer: { default: false },
    initializing: { default: false },
    templateInitialized: { default: false },
    disposing: { default: false },
} satisfies PropertyDefinition;
