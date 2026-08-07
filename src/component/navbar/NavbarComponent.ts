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
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import './navbar.css.ts';

/** 导航栏属性接口 */
export interface NavbarProps extends ItemGroupProps {
    /** 公司名称（默认 companyName 项的 text） */
    companyName?: string;
    /** Logo 图标（默认 logo 项的 icon，如 '🏢' 或 URL） */
    logo?: string;
}

/** 导航栏组件 */
class NavbarComponent extends ItemGroupStaticComponent {
    onAfterInit(props?: NavbarProps): void {
        console.log(
            '[Navbar] onAfterInit props:',
            JSON.stringify({
                hasItems: !!props?.items,
                itemsLen: props?.items?.length,
                companyName: props?.companyName,
                logo: props?.logo,
            })
        );
        // 1. 基础外观（横向、间距）
        this.addCls('q-navbar');
        (this as any).itemContainer?.el?.classList.add('q-navbar__items');

        // 2. 默认内置项（如果用户未显式提供 items，则注入默认项）
        const hasUserItems = props?.items && props.items.length > 0;
        if (!hasUserItems) {
            // companyName（order=0，最左）
            this.add({
                type: 'Text',
                order: 0,
                cls: 'q-navbar__company',
                text: props?.companyName ?? '公司名称',
            });
            // logo（order=10，紧挨公司名右侧；后续可自定义替换）
            this.add({
                type: 'Icon',
                order: 10,
                cls: 'q-navbar__logo',
                icon: props?.logo ?? '🏢',
            });
        }

        // 3. 交给基类处理（direction/gap/items/overflow…）
        super.onAfterInit({
            ...props,
            direction: props?.direction ?? 'horizontal',
            gap: props?.gap ?? '16px',
        });
    }
}

NavbarComponent.register();
export { NavbarComponent };
/** 导航栏实例类型 */
export type NavbarComponentInstance = InstanceType<typeof NavbarComponent>;
