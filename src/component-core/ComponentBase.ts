/**
 * ComponentBase — 组件基类
 *
 * 通过 ComposableBase.forge() 合并标准能力到原型上，
 * 再从中间类 extends 出 ComponentBase，添加组件特有职责：
 * - el：根 DOM 元素
 * - meta：组件元数据
 * - setProp：通用属性设置
 *
 * 渲染器仍可通过 setupAbilityDefinition 注入 LayoutNode.abilities。
 */

import { ComposableBase, type AbilityDefinition } from '@/composable';
import { EventAbility, DomEventsAbility } from '@/system-abilities';
import { PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility } from './abilities';
import { RegistryHub } from '@/registry/RegistryHub';
import { HtmlTemplateRegistrar } from '@/registry/registrars/HtmlTemplateRegistrar';

/**
 * 标准能力声明
 * 子类可在此基础上追加能力
 */
export const COMPONENT_BASE_ABILITIES: readonly AbilityDefinition[] = [
    EventAbility, DomEventsAbility,
    PositionPxAbility, PositionRawAbility, PositionBoolAbility, PositionDirectAbility, StyleAbility,
];

/**
 * 第一步：合并标准能力到原型上，得到中间类
 */
const ForgedComponentBase = ComposableBase.forge(COMPONENT_BASE_ABILITIES);

/**
 * 在中间类上声明能力接口
 *
 * 派生类 ComponentBase extends ForgedComponentBase 后，
 * 自动拥有这些类型，无需再 export interface。
 */
export interface ForgedComponentBase extends ComposableBase {
    // ===== PositionPxAbility =====
    x: number;
    y: number;
    width: number;
    height: number;
    flushPositionPx(): void;

    // ===== StyleAbility =====
    style: Record<string, string>;
    flushStyle(): void;
    flushAccessibility(): void;

    // ===== EventAbility =====
    readonly eventScope: any;
    on(event: string, handler: any): () => void;
    once(event: string, handler: any): void;
    emit(event: string, data?: any): void;

    // ===== DomEventsAbility =====
    bind(target: EventTarget, semantic: any, options?: any): any;
}

/**
 * 第二步：从中间类 extends 出 ComponentBase，添加组件特有属性和方法
 */
export class ComponentBase extends ForgedComponentBase {
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
     */
    contentMap: Record<string, Record<string, HTMLElement>> = {};

    // ─── 元素初始化 ──

    /**
     * 创建根 DOM 元素 + 注入模板 + 查询 data-content 缓存
     * 渲染器阶段 2 调用，从 RegistryHub 获取模板片段
     */
    initElement(): void {
        this.el = document.createElement(this.tag);

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
     */
    buildContentMap(): void {
        const els = Array.from(this.el.querySelectorAll('[data-content]'));
        if (els.length === 0) return;

        for (const el of els) {
            const htmlEl = el as HTMLElement;
            const value = htmlEl.getAttribute('data-content')!;

            const colonIndex = value.indexOf(':');
            if (colonIndex === -1) {
                if (!this.contentMap[value]) this.contentMap[value] = {};
                this.contentMap[value]['_'] = htmlEl;
            } else {
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
     */
    markDirty(key: string): void {
        this.dirtySet.add(key);
        this.debounce('ComponentBase:flush', () => this.flush(), 0);
    }

    /**
     * 统一刷新所有脏属性到 DOM
     */
    flush(): void {
        if (this.dirtySet.size === 0) return;

        this.flushStyle();
        this.flushPositionPx();
        this.flushPositionRaw();
        this.flushPositionBool();
        this.flushAccessibility();

        this.dirtySet.clear();
    }

    // ─── 通用属性 ──

    /**
     * 统一属性设置入口
     */
    setProp(key: string, value: any): void {
        this.props[key] = value;
        this.markDirty(key);
    }

    // ─── 销毁 ──

    override dispose(): void {
        this.el?.remove();

        this.meta = {};
        this.props = {};
        this.dirtySet.clear();
        this.contentMap = {};

        super.dispose();
    }
}
