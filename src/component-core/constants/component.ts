export const SPLIT_OPTIONS_IGNORE_KEYS = new Set([
    'children',
    'i18n',
    'permission',
    'name',
    'tag',
    'type',
]);

export const HIDDEN_MODE_CSS_MAP = {
    display: 'hidden',
    visibility: 'invisible',
    opacity: 'opacity-0',
};

export const HIDDEN_MODE = {
    display: 'display',
    visibility: 'visibility',
    opacity: 'opacity',
};

export const COMPONENT_CORE_OPTIONS = {
    /** 组件状态 — 控制组件的启用状态 */
    disable: false,
    disabledCls: null,
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
    cls: null,
    /** 组件提示信息 — 控制组件的提示信息 */
    hint: null,
    /** 组件属性 — 控制组件的属性 */
    attribute: null,
    /** 组件鼠标样式 — 控制组件的鼠标样式 */
    cursor: null,
} as const;

export const COMPONENT_CORE_OPTIONS_KEYS = Object.keys(COMPONENT_CORE_OPTIONS);

export const COMPONENT_CORE_READONLY_OPTIONS = {
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
};

export const COMPONENT_CORE_READONLY_OPTIONS_KEYS = Object.keys(COMPONENT_CORE_READONLY_OPTIONS);

/**
 * 特殊 key：用于标识带有 target/to 定义的选项
 *
 * 当选项定义中包含 target 和 to 属性时，使用此 key 进行路由
 */
export const OPTION_HANDLER_KEY_TARGET_TO = 'target-to';
