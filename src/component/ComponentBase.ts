/**
 * UI 组件基类
 *
 * 从 ComposableBase 派生，所有 UI 组件的根类。
 * 通过 Ability 组合获得各种 UI 能力。
 *
 * ComponentBase 默认提供以下通用能力：
 * - ThemeAbility：主题感知，自动响应主题切换
 * - StyleAbility：样式管理，className/style/addClass/removeClass
 * - EventAbility（来自 system-abilities）：事件监听/发射，on/once/emit/emitUI
 * - DomEventsAbility（来自 system-abilities）：DOM 手势事件绑定，bind(target, semantic)
 *
 * 子类通过 static abilities 声明额外能力，派生组件根据特有属性添加对应能力。
 *
 * @example
 * ```typescript
 * class ButtonComponent extends ComponentBase {
 *     static readonly abilities = [TextAbility, ClickAbility, DisableAbility, SizeAbility];
 * }
 * ```
 */

import { ComposableBase, type AbilityDefinition } from '@qimenjs/composable';
import { string } from '@qimenjs/utils';
import { EventAbility, DomEventsAbility } from '@qimenjs/system-abilities';
import { ThemeAbility } from './abilities/ThemeAbility';
import { StyleAbility } from './abilities/StyleAbility';
import { EventBridgeAbility } from './abilities/EventBridgeAbility';
import { mergePropAliases, applyPropAliases, initAbilitiesFromProps } from './abilities/PropAlias';

/** 组件 DOM 元素上挂载组件引用的属性名 */
const Q_COMPONENT_REF = '__qComponent';

/** 组件 DOM 元素上设置 id 标识的属性名 */
const Q_DATA_ID = 'data-q-id';

/** 所有 UI 组件共享的基础能力 */
const BASE_ABILITIES: readonly AbilityDefinition[] = [
    EventAbility,
    DomEventsAbility,
    ThemeAbility,
    StyleAbility,
    EventBridgeAbility,
];

/**
 * UI 组件基类
 *
 * 提供 el/cid/id/type/parent/mounted/destroyed 属性和
 * mount/unmount/update/dispose/markDirty/up 方法
 */
export class ComponentBase extends ComposableBase {
    /**
     * 子类应该重写此属性声明所需能力
     *
     * ComponentBase 默认提供 ThemeAbility、StyleAbility、EventBindingAbility
     * 子类可以覆盖此属性添加更多能力
     */
    static override readonly abilities: readonly AbilityDefinition[] = [];

    /** 组件根 DOM 元素 */
    el!: HTMLElement;

    /** 自动生成的唯一 ID */
    readonly cid: string;

    /** 开发者指定的业务标识（多重职责：查找/事件前缀/source/target） */
    id: string | undefined;

    /** 组件类型标识（来自 ComponentRegistrar 注册时的 type） */
    type: string = '';

    /** 父组件引用（渲染 Pipeline BIND_CHILDREN 步骤自动设置） */
    parent: ComponentBase | null = null;

    /** 是否已挂载 */
    mounted: boolean = false;

    /** 是否已销毁 */
    destroyed: boolean = false;

    /** 原始 props 引用（供能力初始化使用） */
    readonly props: Record<string, any>;

    constructor(props?: Record<string, any>) {
        super();
        this.cid = string.getId('q-comp');
        this.props = props || {};

        // 如果 props 中有 id，设置到实例
        if (this.props.id) {
            this.id = this.props.id;
        }

        // 如果 props 中有 type，设置到实例
        if (this.props.type) {
            this.type = this.props.type;
        }
    }

    /**
     * 收集能力：合并基础能力 + 子类声明的能力
     */
    protected override collectAbilities(): AbilityDefinition[] {
        const subAbilities = super.collectAbilities();
        // 基础能力在前，子类能力在后（子类可覆盖基础能力的同名属性）
        const all = [...BASE_ABILITIES, ...subAbilities];

        // 去重
        const seen = new Set<any>();
        return all.filter(a => {
            if (seen.has(a)) return false;
            seen.add(a);
            return true;
        });
    }

    /**
     * 应用属性别名和能力初始化
     *
     * 在 setupAbilities 之后调用，将 props 中的值通过别名映射设置到组件属性
     * 注意：__initProps 延迟到 mount() 时调用，因为此时 el 才可用
     */
    protected override applyOverrides(): void {
        super.applyOverrides();

        const allAbilities = this.collectAbilities();

        // 1. 应用属性别名（不依赖 el 的属性）
        const aliasMap = mergePropAliases(allAbilities);
        applyPropAliases(this, this.props, aliasMap);

        // 2. __initProps 延迟到 mount() 中调用，因为能力初始化可能依赖 el
    }

    /**
     * 挂载到目标容器
     *
     * @param container - 目标容器，可以是 HTMLElement 或 CSS 选择器
     */
    mount(container: HTMLElement | string): void {
        const target = typeof container === 'string'
            ? document.querySelector(container) as HTMLElement
            : container;

        if (target && this.el) {
            target.appendChild(this.el);
            this.mounted = true;

            // 在 el 上挂载组件引用
            (this.el as any)[Q_COMPONENT_REF] = this;

            // 设置 data-q-id 属性（如果有 id）
            if (this.id) {
                this.el.setAttribute(Q_DATA_ID, this.id);
            }

            // 注册到 ComponentManager
            const { ComponentManager } = require('./ComponentManager');
            ComponentManager.getInstance().register(this);

            // 初始化能力 props（此时 el 已可用）
            const allAbilities = this.collectAbilities();
            initAbilitiesFromProps(this, allAbilities, this.props);
        }
    }

    /**
     * 从 DOM 卸载
     */
    unmount(): void {
        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
        this.mounted = false;
    }

    /**
     * 更新组件（由子类实现具体逻辑）
     *
     * @param _props - 可选的更新属性
     */
    update(_props?: Record<string, any>): void {
        // 子类覆盖
    }

    /**
     * 沿父链向上查找指定类型的祖先组件
     *
     * 从 this.parent 开始，逐级向上检查 type，返回第一个匹配的祖先组件或 null。
     *
     * @param type - 要查找的组件类型
     * @returns 匹配的祖先组件，未找到返回 null
     */
    up(type: string): ComponentBase | null {
        let current = this.parent;
        while (current) {
            if (current.type === type) return current;
            current = current.parent;
        }
        return null;
    }

    /**
     * 标记需要更新，同一微任务内只执行一次 update
     */
    private _dirty = false;
    markDirty(): void {
        if (this._dirty) return;
        this._dirty = true;
        queueMicrotask(() => {
            this._dirty = false;
            this.update();
        });
    }

    /**
     * 销毁组件
     *
     * 执行顺序：
     * 1. 从 ComponentManager 注销
     * 2. 从 DOM 元素移除引用
     * 3. 清除父引用
     * 4. 调用 ComposableBase.dispose() 清理 abilities 和事件
     */
    override dispose(): void {
        if (this.destroyed) return;

        // 从 ComponentManager 注销（延迟导入避免循环依赖）
        const { ComponentManager } = require('./ComponentManager');
        ComponentManager.getInstance().unregister(this);

        // 从 DOM 元素移除引用
        if (this.el) {
            (this.el as any)[Q_COMPONENT_REF] = undefined;
            if (this.el.hasAttribute(Q_DATA_ID)) {
                this.el.removeAttribute(Q_DATA_ID);
            }
        }

        // 清除父引用
        this.parent = null;

        this.destroyed = true;

        // 调用 ComposableBase.dispose() 清理 abilities 和事件
        super.dispose();
    }
}
