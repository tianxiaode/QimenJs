/**
 * ComponentsPage - 组件展示页
 *
 * 左侧组件导航侧栏 + 右侧组件展示和示例代码。
 * 占位页面，后续阶段完善。
 */

import { Component, type TplNode } from '@qimenjs/component-core';
import { AlertComponent } from '@qimenjs/component';

/** 组件分类数据（i18n key + 组件名列表） */
const CATEGORIES = [
    {
        labelKey: 'componentsPage.categoryBasic',
        items: ['Button', 'Icon', 'Avatar', 'Badge', 'Tag', 'Divider'],
    },
    {
        labelKey: 'componentsPage.categoryForm',
        items: ['Input', 'Select', 'Switch', 'Slider', 'Checkbox', 'Radio'],
    },
    {
        labelKey: 'componentsPage.categoryDataDisplay',
        items: ['Card', 'Table', 'Statistic', 'Progress', 'Rating', 'Timeline'],
    },
    {
        labelKey: 'componentsPage.categoryNavigation',
        items: ['Navbar', 'Nav', 'Breadcrumb', 'Tabs', 'Step', 'TreeNav'],
    },
    {
        labelKey: 'componentsPage.categoryFeedback',
        items: ['Alert', 'Dialog', 'Tooltip', 'Loading', 'Indicator'],
    },
    {
        labelKey: 'componentsPage.categoryLayout',
        items: ['Panel', 'Fieldset', 'Accordion', 'Toolbar', 'Spacer'],
    },
];

/** 组件页模板 */
const COMPONENTS_TPL: TplNode = {
    tag: 'div',
    cls: 'q-components-page',
    flex: { direction: 'row', minHeight: '100%' },
    children: [
        {
            tag: 'aside',
            cls: 'q-components-page__sidebar',
            children: CATEGORIES.map(cat => ({
                tag: 'div',
                cls: 'q-components-page__category',
                children: [
                    { tag: 'h4', cls: 'q-components-page__category-title', i18n: cat.labelKey },
                    {
                        tag: 'ul',
                        cls: 'q-components-page__category-list',
                        children: cat.items.map(item => ({
                            tag: 'li',
                            cls: 'q-components-page__category-item',
                            text: item,
                        })),
                    },
                ],
            })),
        },
        {
            tag: 'main',
            cls: 'q-components-page__main',
            flex: { direction: 'column', gap: '24px', flex: 1 },
            children: [
                {
                    name: 'alert',
                    type: AlertComponent,
                    cls: 'q-components-page__alert',
                    initConfig: {
                        type: 'info',
                        text: 'i18n:componentsPage.hint',
                    },
                },
                {
                    tag: 'div',
                    cls: 'q-components-page__placeholder',
                    i18n: 'componentsPage.placeholder',
                },
            ],
        },
    ],
};

/** 组件展示页组件 */
export class ComponentsPage extends Component {}

ComponentsPage.useTemplate(COMPONENTS_TPL);
export type ComponentsPageInstance = InstanceType<typeof ComponentsPage>;
