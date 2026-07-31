/**
 * HomePage - 首页
 *
 * 使用 HeroComponent 展示框架介绍。
 */

import { Component } from '@qimenjs/component-core';
import { HeroComponent } from '@qimenjs/component';

export const HOMT_TPL = {
    tag: 'div',
    cls: 'q-home-page',
    children: [
        {
            name: 'hero',
            type: HeroComponent,
            cls: 'q-home-page__hero',
        },
    ],
};

export class HomePage extends Component {
    onAfterInit(): void {
        const hero = this.nodeMap.hero.component;
        hero.update({
            title: 'QimenJS 组件框架',
            subtitle: '基于模板驱动的下一代 Web 组件开发框架',
            desc: '提供丰富的基础组件、模板系统、路由管理、国际化、主题切换等开箱即用的能力，帮助你快速构建现代化 Web 应用。',
            actionText: '快速开始',
        });

        hero.on('action', () => {
            window.location.hash = '#/components';
        });
    }
}

HomePage.useTemplate(HOMT_TPL);
export type HomePageInstance = InstanceType<typeof HomePage>;
