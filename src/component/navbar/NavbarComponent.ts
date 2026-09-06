/**
 * NavbarComponent 顶部导航栏组件
 *
 * 从 ItemGroupStaticComponent 派生，本质是横向 ItemGroup + 样式差异。
 * 默认内置两项（order 越小越靠左）：
 *   - companyName (Text, order=0) — 公司名称
 *   - logo        (Icon, order=10) — 品牌 Logo
 * 后续可通过 items 属性或 add() 方法追加自定义组件，如：
 *   new NavbarComponent({ items: [
 *       { type: 'Button', text: '首页', order: 100 },
 *       { type: 'Button', text: '退出', order: 9999 },
 *   ]})
 *
 * 与旧 Sidebar 的区别：
 *   - 仅样式方向不同（横向 vs 纵向）
 *   - 不再自建节点树，复用 ItemGroup 的 itemContainer + order 排序机制
 *   - 直接复用 OverflowAbility（overflowMode='menu' 可折叠溢出项）
 */

import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import { Definitions } from '@/composable';
import './navbar.css';

const NavbarComponentDefs: Definitions = {
    options: {
        companyName: null,
        logo: null,
    },
} as const;

class NavbarComponent extends ItemGroupStaticComponent {
    get defaultOptions(): Record<string, any> {
        return { direction: 'horizontal', gap: '16px' };
    }

    onAfterInit(): void {
        this.addCls('q-navbar');
        (this as any).itemContainer?.el?.classList.add('q-navbar__items');

        const hasUserItems = this.getData('items') && this.getData('items').length > 0;
        if (!hasUserItems) {
            this.add({
                type: 'Text',
                order: 0,
                cls: 'q-navbar__company',
                text: this.getData('companyName') ?? '公司名称',
            });
            this.add({
                type: 'Icon',
                order: 10,
                cls: 'q-navbar__logo',
                icon: this.getData('logo') ?? '🏢',
            });
        }

        super.onAfterInit();
    }
}

NavbarComponent.define(NavbarComponentDefs);

export { NavbarComponent };
/** 导航栏实例类型 */
export type NavbarComponentInstance = InstanceType<typeof NavbarComponent>;
