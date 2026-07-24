/**
 * Component — 工厂层基类
 *
 * 纯静态工厂，不持有 el、nodeMap，不挂载能力。
 * 职责：
 *   - withTemplate(templates) → 编译模板 → 返回内部类（真正的 class）
 *   - replace() → 基于已有内部类派生新内部类
 *
 * 直接类模式：withTemplate 返回的就是可以直接 new 的 class，
 * 支持 .create() / .with() / .replace() 链式调用。
 *
 * @example
 * ```ts
 * // 创建组件
 * const ButtonComponent = Component.withTemplate({
 *     tpl: { tag: 'div', cls: 'q-button', children: [...] },
 *     body: { type: 'button' }
 * });
 * const btn = new ButtonComponent({ text: 'OK' });
 *
 * // replace 派生
 * const DropdownComponent = ButtonComponent.replace({
 *     type: 'Dropdown',
 *     cls: 'q-dropdown',
 *     body: { ... }
 * });
 *
 * // with 追加能力
 * const SizeableButton = ButtonComponent.with([SizeAbility]);
 * ```
 */

import type { ComponentTemplate } from './types';
import { createInnerClass, createDerivedInnerClass } from './engine/TemplateFactory';
import { TemplateComponent } from './TemplateComponent';

/**
 * Component — 工厂层基类
 *
 * 静态方法 withTemplate / replace 生成内部类。
 * 返回的内部类是真正的 class，可以直接 new 或 .create()。
 */
export class Component {
    /**
     * 创建组件内部类
     *
     * 单模板模式：withTemplate({ tpl: TplNode, body })
     * 返回的内部类：
     *   - new InnerClass(props) → 创建组件实例
     *   - InnerClass.create(props) → 同上
     *   - InnerClass.with(abilities) → 追加能力后返回同类
     *   - InnerClass.replace(options) → 派生新类
     */
    static withTemplate(this: any, templates: ComponentTemplate): any {
        return createInnerClass(TemplateComponent, templates.tpl, templates.body);
    }

    /**
     * 基于当前内部类创建派生内部类
     *
     * 支持追加 body + nodeOverrides + config
     */
    static replace(
        this: any,
        options: {
            type?: string;
            cls?: string;
            itemsCls?: string;
            config?: Record<string, any>;
            nodeOverrides?: Record<string, Record<string, any>>;
            body?: Record<string, any>;
        }
    ): any {
        return createDerivedInnerClass(this, options);
    }
}
