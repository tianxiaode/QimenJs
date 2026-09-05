import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@/component-core';
import { TREE_NAV_ITEM_TPL } from './tree-nav-item-tpl';
import { Definitions } from '@/composable';
import './tree-nav-item.css';

const TreeNavItemComponentDefs: Definitions = {
    options: {
        text: null,
        icon: null,
        active: false,
        expanded: false,
    },
    fields: {
        path: undefined,
        depth: 0,
        maxDepth: 5,
        children: undefined,
    },
} as const;

class TreeNavItemComponent extends Component {
    static type = 'tree-nav-item';
    get tpl(): TemplateDecl {
        return TREE_NAV_ITEM_TPL;
    }

    _childInstances: TreeNavItemComponent[] = [];

    _onTextOptionChange(value: string): void {
        this._setNodeText('text', value);
    }

    _onIconOptionChange(value: string): void {
        const el = this.getNodeEl('icon');
        if (el) el.textContent = value ?? '';
    }

    _onActiveOptionChange(value: boolean): void {
        value ? this.addCls('q-tree-nav-item--active') : this.removeCls('q-tree-nav-item--active');
        if (value) {
            this.setAttributes({ 'aria-current': 'page' });
        } else {
            this.removeAttributes(['aria-current']);
        }
    }

    _onExpandedOptionChange(value: boolean): void {
        value ? this.addCls('q-tree-nav-item--expanded') : this.removeCls('q-tree-nav-item--expanded');
        value ? this.removeCls('hidden', 'children') : this.addCls('hidden', 'children');
    }

    select(): boolean {
        if (this.disable) return false;
        if (this.children?.length && this.depth < this.maxDepth) {
            this.toggleExpand();
            return false;
        }
        return true;
    }

    toggleExpand(): void {
        this.expanded ? this.collapse() : this.expand();
    }

    expand(): void {
        if (this.expanded) return;
        if (!this.children?.length || this.depth >= this.maxDepth) return;
        this._renderChildren();
        this.expanded = true;
        this.emit('expand', { item: this });
    }

    collapse(): void {
        if (!this.expanded) return;
        this.expanded = false;
        this._clearChildren();
        this.emit('collapse', { item: this });
    }

    setExpandArrow(state: 'expanded' | 'collapsed'): void {
        if (state === 'expanded') this.addCls('q-tree-nav-item--expanded');
        else this.removeCls('q-tree-nav-item--expanded');
    }

    setActive(value: boolean): void {
        this.active = value;
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        if (props?.path !== undefined) this.path = props.path;
        if (props?.depth !== undefined) {
            this.depth = props.depth;
            this.el?.style.setProperty('--q-item-depth', String(this.depth));
        }
        if (props?.maxDepth !== undefined) this.maxDepth = props.maxDepth;
        if (props?.children !== undefined) {
            this.children = props.children;
            this._applyChildrenState();
            if (this.expanded) {
                this._clearChildren();
                this._renderChildren();
            }
        }
    }

    onBeforeDispose(): void {
        this._clearChildren();
        super.onBeforeDispose();
    }

    private _applyChildrenState(): void {
        const hasChildren = !!this.children?.length;
        hasChildren ? this.addCls('q-tree-nav-item--has-children') : this.removeCls('q-tree-nav-item--has-children');
        hasChildren ? this.removeCls('hidden', 'expand') : this.addCls('hidden', 'expand');
    }

    private _renderChildren(): void {
        const container = this.getNodeEl('children');
        if (!container || !this.children?.length) return;

        for (const childData of this.children) {
            const child = new TreeNavItemComponent({
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
        const container = this.getNodeEl('children');
        if (container) container.innerHTML = '';
    }
}

TreeNavItemComponent.define(TreeNavItemComponentDefs);

export { TreeNavItemComponent };
export type TreeNavItemComponentInstance = InstanceType<typeof TreeNavItemComponent>;
