/**
 * Component — 闭包基类（工厂层）
 *
 * 纯闭包工厂，不持有 el、nodeMap，不挂载能力。
 * 职责：
 *   - withTemplate(templates) → 编译模板 → 生成内部类 → 闭包保存
 *   - replace() → 基于已有内部类派生新内部类
 *   - 构造函数 / create() → 根据 when 条件选择内部类，返回内部类实例
 *
 * 内部类（InnerComponent / TemplateComponent 子类）才是真正的组件，
 * 拥有完整初始化流程、能力、el、nodeMap。
 * new Component({ labelPosition: 'top' }) 直接返回内部类实例（JS 规范支持）。
 *
 * @example
 * ```ts
 * // 单模板
 * const ButtonComponent = Component.withTemplate({
 *     tpl: { tag: 'div', cls: 'q-button', children: [...] },
 *     body: { type: 'button' }
 * });
 * const btn = new ButtonComponent({ text: 'OK' });
 *
 * // 多模板（条件选择）
 * const InputComponent = Component.withTemplate({
 *     tpl: [
 *         { tpl: INPUT_TOP_TEMPLATE, when: (cfg) => cfg.labelPosition === 'top' },
 *         { tpl: INPUT_LEFT_TEMPLATE, when: (cfg) => cfg.labelPosition === 'left' },
 *         { tpl: INPUT_DEFAULT_TEMPLATE },  // 兜底
 *     ],
 *     body: { type: 'input' }
 * });
 * const input = new InputComponent({ labelPosition: 'top' });
 *
 * // replace 派生
 * const DropdownComponent = ButtonComponent.replace({
 *     type: 'Dropdown',
 *     cls: 'q-dropdown',
 *     body: { ... }
 * });
 * ```
 */

import type { ComponentTemplate } from './types';
import { createComponentFactory, createReplaceFactory } from './utils/template-factory';

/**
 * Component — 闭包基类
 *
 * 静态方法 withTemplate / replace 生成闭包类（工厂函数），
 * 闭包类构造时根据 when 条件选择对应内部类实例。
 */
export class Component {
    /**
     * 创建组件闭包类
     *
     * 支持两种模式：
     * 1. 单模板：withTemplate({ tpl: TplNode, body })
     * 2. 多模板：withTemplate({ tpl: TplVariant[], body })
     *
     * 返回的闭包类：
     *   - new ClosureClass(props) → 根据 when(props) 选择内部类实例
     *   - ClosureClass.create(props) → 同上
     *   - ClosureClass.with(abilities) → 追加能力后返回新闭包类
     */
    static withTemplate(this: any, templates: ComponentTemplate): any {
        return createComponentFactory(templates);
    }

    /**
     * 基于当前闭包类创建派生闭包类
     *
     * 支持追加 body + nodeOverrides
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
        return createReplaceFactory(this, options);
    }
}
