/**
 * TreeNavItemComponent 树导航项组件
 *
 * 独立组件，支持内联展开子级 + depth 缩进。
 * 子级直接渲染在 children 容器节点（非浮层），展开时创建子 TreeNavItem 实例，折叠时销毁。
 *
 * 深度缩进：
 * - _applyState 设置 --q-item-depth CSS 变量，由 tree-nav.css 的 calc() 消费
 * - 外部通过 --q-indent-step 统调缩进步长
 *
 * 模板节点：
 * - content — 可点击区域
 * - icon — 图标
 * - text — 文本
 * - expand — 展开箭头
 * - children — 子级容器（内联展开）
 */

import { Component, ComponentRegistrar } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';
import { TREE_NAV_ITEM_TPL } from './tree-nav-item-tpl';
import './treenavitem.css.ts';

/** 树导航项属性接口 */
export interface TreeNavItemProps {
    text?: string;
    icon?: string;
    path?: string;
    active?: boolean;
    disabled?: boolean;
    expanded?: boolean;
    depth?: number;
    maxDepth?: number;
    children?: Record<string, any>[];
}

class TreeNavItemComponent extends Component {
    get tpl(): TplNode {
        return TREE_NAV_ITEM_TPL;
    }

    active: boolean = false;
    disabled: boolean = false;
    expanded: boolean = false;
    path: string | undefined = undefined;
    depth: number = 0;
    maxDepth: number = 5;
    children: Record<string, any>[] | undefined = undefined;
    _childInstances: TreeNavItemComponent[] = [];

    onAfterInit(props?: TreeNavItemProps & Record<string, any>): void {
        this.addCls('q-tree-nav-item');

        if (props?.text !== undefined) this.text = props.text;
        if (props?.icon !== undefined) this.icon = props.icon;
        if (props?.path !== undefined) this.path = props.path;
        if (props?.active !== undefined) this.active = props.active;
        if (props?.disabled !== undefined) this.disabled = props.disabled;
        if (props?.expanded !== undefined) this.expanded = props.expanded;
        if (props?.depth !== undefined) this.depth = props.depth;
        if (props?.maxDepth !== undefined) this.maxDepth = props.maxDepth;
        if (props?.children !== undefined) this.children = props.children;

        this._applyState();

        if (this.expanded && this.children?.length && this.depth < this.maxDepth) {
            this._renderChildren();
        }
    }

    select(): boolean {
        if (this.disabled) return false;

        if (this.children?.length && this.depth < this.maxDepth) {
            this.toggleExpand();
            return false;
        }

        return true;
    }

    toggleExpand(): void {
        if (this.expanded) this.collapse();
        else this.expand();
    }

    expand(): void {
        if (this.expanded) return;
        if (!this.children?.length || this.depth >= this.maxDepth) return;

        this.expanded = true;
        this._renderChildren();
        this._applyState();
        this.emit('expand', { item: this });
    }

    collapse(): void {
        if (!this.expanded) return;

        this.expanded = false;
        this._clearChildren();
        this._applyState();
        this.emit('collapse', { item: this });
    }

    private _renderChildren(): void {
        const container = (this as any).nodeMap?.children?.el as HTMLElement | undefined;
        if (!container || !this.children?.length) return;

        const ItemClass = ComponentRegistrar.getInstance().get('TreeNavItem') as any;
        if (!ItemClass) return;

        for (const childData of this.children) {
            const child = new ItemClass({
                ...childData,
                depth: this.depth + 1,
                maxDepth: this.maxDepth,
                expanded: childData.expanded ?? false,
            }) as TreeNavItemComponent;
            container.appendChild(child.el);
            this._childInstances.push(child);
        }
    }

    private _clearChildren(): void {
        for (const child of this._childInstances) {
            child.dispose();
        }
        this._childInstances = [];
        const container = (this as any).nodeMap?.children?.el as HTMLElement | undefined;
        if (container) container.innerHTML = '';
    }

    setExpandArrow(state: 'expanded' | 'collapsed'): void {
        if (state === 'expanded') this.addCls('q-tree-nav-item--expanded');
        else this.removeCls('q-tree-nav-item--expanded');
    }

    _applyState(): void {
        if (this.active) this.addCls('q-tree-nav-item--active');
        else this.removeCls('q-tree-nav-item--active');

        if (this.disabled) this.addCls('q-tree-nav-item--disabled');
        else this.removeCls('q-tree-nav-item--disabled');

        if (this.children?.length) this.addCls('q-tree-nav-item--has-children');
        else this.removeCls('q-tree-nav-item--has-children');

        if (this.expanded) this.addCls('q-tree-nav-item--expanded');
        else this.removeCls('q-tree-nav-item--expanded');

        this.setNodeHidden(!this.children?.length, 'expand');

        const container = (this as any).nodeMap?.children?.el as HTMLElement | undefined;
        if (container) container.hidden = !this.expanded;

        this.el.style.setProperty('--q-item-depth', String(this.depth));

        this.ariaDisabled = this.disabled ? 'true' : false;
        if (this.active) this.setAttr('aria-current', 'page');
        else this.removeAttr('aria-current');
    }

    setActive(value: boolean): void {
        this.active = value;
        this._applyState();
    }

    setDisabled(value: boolean): void {
        this.disabled = value;
        this._applyState();
    }

    update(props?: Partial<TreeNavItemProps> & Record<string, any>): void {
        if (props?.text !== undefined) this.text = props.text;
        if (props?.icon !== undefined) this.icon = props.icon;
        if (props?.path !== undefined) this.path = props.path;
        if (props?.active !== undefined) this.setActive(props.active);
        if (props?.disabled !== undefined) this.setDisabled(props.disabled);
        if (props?.depth !== undefined) this.depth = props.depth;
        if (props?.maxDepth !== undefined) this.maxDepth = props.maxDepth;
        if (props?.expanded !== undefined) {
            if (props.expanded) this.expand();
            else this.collapse();
        }
        if (props?.children !== undefined) {
            this.children = props.children;
            if (this.expanded) {
                this._clearChildren();
                this._renderChildren();
            }
        }
    }

    dispose(): void {
        this._clearChildren();
        super.dispose();
    }
}

export { TreeNavItemComponent };
/** 树导航项实例类型 */
export type TreeNavItemComponentInstance = InstanceType<typeof TreeNavItemComponent>;
