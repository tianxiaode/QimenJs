/**
 * ComponentBase — 组件基类
 *
 * 继承 ComposableBase，在组合能力的基础上增加组件特有职责：
 * - el：根 DOM 元素
 * - meta：组件元数据
 * - onDom：DOM 事件绑定（自动清理）
 * - setProp：通用属性设置
 *
 * 子类通过 static abilities 声明所需能力，
 * ComposableBase 在 constructor 中自动装配。
 * 渲染器通过 setupAbilityDefinition 注入 LayoutNode.abilities。
 */

import { ComposableBase, type AbilityDefinition } from '@/composable';
import { EventAbility, DomEventsAbility } from '@/system-abilities';
import { PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility } from './abilities';
import { RegistryHub } from '@/registry/RegistryHub';
import { HtmlTemplateRegistrar } from '@/registry/registrars/HtmlTemplateRegistrar';

export class ComponentBase extends ComposableBase {
    /**
     * 标准能力声明
     * 子类可 override 追加，ComposableBase 会沿原型链收集
     */
    static readonly abilities: readonly AbilityDefinition[] = [EventAbility, DomEventsAbility, PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility];

    /** 根元素标签名，子类可 override */
    tag: string = 'div';

    /** 组件类型，由渲染器在阶段 1 设置 */
    type!: string;

    /** 根 DOM 元素 */
    el!: HTMLElement;

    /** 组件元数据 */
    meta: Record<string, any> = {};

    /** 组件属性存储 */
    props: Record<string, any> = {};

    /** 脏属性集合 */
    dirtySet: Set<string> = new Set();

    /**
     * data-content 查询结果缓存，按冒号前缀分层
     *
     * data-content="header:text" → contentMap.header.text = el
     * data-content="header:icon" → contentMap.header.icon = el
     * data-content="body:child"  → contentMap.body.child = el
     * data-content="label"       → contentMap.label._ = el（无冒号时用 '_' 作为默认 key）
     */
    contentMap: Record<string, Record<string, HTMLElement>> = {};

    constructor() {
        super();
    }

    // ─── 元素初始化 ──

    /**
     * 创建根 DOM 元素 + 注入模板 + 查询 data-content 缓存
     * 渲染器阶段 2 调用，从 RegistryHub 获取模板片段
     */
    initElement(): void {
        this.el = document.createElement(this.tag);

        // 从模板注册表获取片段并注入
        const templateRegistrar = RegistryHub.get<HtmlTemplateRegistrar>('html');
        if (templateRegistrar) {
            try {
                const fragment = templateRegistrar.getFragment(this.type);
                this.el.appendChild(fragment);
                this.buildContentMap();
            } catch {
                // 没有注册模板，跳过
            }
        }
    }

    /**
     * 查询所有 data-content 元素，按冒号前缀分层缓存
     *
     * "header:text" → contentMap.header.text = el
     * "label"       → contentMap.label._ = el
     */
    private buildContentMap(): void {
        const els = this.el.querySelectorAll('[data-content]');
        if (els.length === 0) return;

        for (const el of els) {
            const htmlEl = el as HTMLElement;
            const value = htmlEl.getAttribute('data-content')!;

            const colonIndex = value.indexOf(':');
            if (colonIndex === -1) {
                // 无冒号：contentMap.label._
                if (!this.contentMap[value]) this.contentMap[value] = {};
                this.contentMap[value]['_'] = htmlEl;
            } else {
                // 有冒号：contentMap.header.text
                const group = value.slice(0, colonIndex);
                const key = value.slice(colonIndex + 1);
                if (!this.contentMap[group]) this.contentMap[group] = {};
                this.contentMap[group][key] = htmlEl;
            }
        }
    }

    // ─── dirty 追踪 + 延时刷新 ──

    /**
     * 标记某个 key 为脏，触发延时刷新
     * 任何 Ability 的 setter 都可调用
     */
    markDirty(key: string): void {
        this.dirtySet.add(key);
        this.debounce('ComponentBase:flush', () => this.flush(), 0);
    }

    /**
     * 统一刷新所有脏属性到 DOM
     * 各 Ability 的 flush 方法只处理自己负责的脏 key
     * flush 完清空 dirty set
     */
    flush(): void {
        if (this.dirtySet.size === 0) return;

        // 依次分发给各 Ability 的 flush 方法
        this.flushStyle();
        this.flushPositionPx();
        this.flushPositionRaw();
        this.flushPositionBool();
        this.flushAccessibility();

        this.dirtySet.clear();
    }

    // ─── 通用属性 ─────────────────────────────────────

    /**
     * 统一属性设置入口
     * 写入 props + 标记脏，Ability setter 应调用此方法而非手动写 this.props + this.markDirty
     */
    setProp(key: string, value: any): void {
        this.props[key] = value;
        this.markDirty(key);
    }

    // ─── 销毁 ─────────────────────────────────────────

    override dispose(): void {
        // 移除 DOM 元素
        this.el?.remove();

        // 释放引用
        this.meta = {};
        this.props = {};
        this.dirtySet.clear();
        this.contentMap = {};

        super.dispose();
    }
}
