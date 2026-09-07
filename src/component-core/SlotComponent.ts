/**
 * 内容插槽组件的动态工厂
 *
 * 将运行时传入的 TemplateDecl 作为模板承载宿主插槽内容（如 Card 的 body/footer）。
 *
 * 机制：每次调用生成一个全新子类（闭包捕获 decl），继承 Component 全部能力；
 * 通过 withDefinitions 复制父类 dataMap，保证 option/field/getData 机制可用。
 *
 * 关键点：
 * - 类在函数体内定义（调用时才求值 extends Component），规避
 *   OptionAbility → SlotComponent → Component → Component-abilities 的循环依赖风险。
 * - 组件 el 即 decl 根节点（_buildDOM 取 fragment.firstElementChild），
 *   不会产生额外包裹层；content 通过 { container } 传入自动挂载。
 * - decl 内嵌组件节点时必须带 name（模板编译器约定），否则退化为静态 div。
 */

import { withDefinitions } from '@/composable';
import type { Definitions } from '@/composable';
import { Component } from './Component';
import type { ComponentClass, TemplateDecl } from './types';

export function createSlotComponent(decl: TemplateDecl): ComponentClass {
    const SlotCls = class SlotComponentFactory extends Component {
        static type = 'slot';
        get tpl(): TemplateDecl {
            return decl;
        }
    };
    withDefinitions(SlotCls, {} as Definitions);
    return SlotCls;
}
