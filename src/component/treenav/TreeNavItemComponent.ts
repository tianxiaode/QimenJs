import { HrefComponent } from '../text/HrefComponent';
import type { TemplateDecl } from '@qimenjs/component-core';
import { TREE_NAV_ITEM_TPL } from './tree-nav-item-tpl';
import { Definitions } from '@/composable';
import { ExpandCollapseAbility } from '@/system-abilities';
import './tree-nav-item.css';

const TreeNavItemComponentDefs: Definitions = {
    options: {
        iconCls: null,
        active: false,
        expanded: false,
        size: null,
    },
    fields: {
        depth: 0,
        maxDepth: 5,
        children: undefined,
    },
} as const;

class TreeNavItemComponent extends HrefComponent {
    static type = 'tree-nav-item';
    get tpl(): TemplateDecl {
        return TREE_NAV_ITEM_TPL;
    }

    domEvents = {};

    _childInstances: TreeNavItemComponent[] = [];

    _onTextOptionChange(value: string): void {
        this.setNodeText(value, 'text');
    }

    _onHrefOptionChange(_value: string): void {}

    _onTargetOptionChange(_value: string): void {}

    _onIconClsOptionChange(value: string): void {
        const el = this.getNodeEl('icon');
        if (el) el.className = `q-tree-nav-item__icon ${value ?? ''}`;
    }

    _onActiveOptionChange(value: boolean): void {
        value ? this.addCls('q-tree-nav-item--active') : this.removeCls('q-tree-nav-item--active');
        if (value) {
            this.setAttributes({ 'aria-current': 'page' });
        } else {
            this.removeAttributes(['aria-current']);
        }
    }

    select(): boolean {
        if (this.disable) return false;
        if (this.children?.length && this.depth < this.maxDepth) {
            this.toggleExpand();
            return false;
        }
        return true;
    }

    expand(): void {
        if (this.expanded) return;
        if (!this.children?.length || this.depth >= this.maxDepth) return;
        this.expanded = true;
    }

    collapse(): void {
        if (!this.expanded) return;
        this.expanded = false;
    }

    toggleExpand(): void {
        this.expanded ? this.collapse() : this.expand();
    }

    _onExpandedChange(value: boolean): void {
        value ? this.removeCls('hidden', 'children') : this.addCls('hidden', 'children');
        if (value) this._renderChildren();
        else this._clearChildren();
    }

    setActive(value: boolean): void {
        this.active = value;
    }

    onAfterInit(): void {
        super.onAfterInit();
        this._applyChildrenState();
    }

    update(props?: Record<string, any>): void {
        super.update(props);
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
        hasChildren
            ? this.addCls('q-tree-nav-item--has-children')
            : this.removeCls('q-tree-nav-item--has-children');
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
TreeNavItemComponent.use(ExpandCollapseAbility);

export { TreeNavItemComponent };
export type TreeNavItemComponentInstance = InstanceType<typeof TreeNavItemComponent>;
