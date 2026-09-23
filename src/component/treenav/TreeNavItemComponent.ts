import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { TREE_NAV_ITEM_TPL } from './tree-nav-item-tpl';
import { Definitions } from '@/composable';
import './tree-nav-item.css';

const TreeNavItemComponentDefs: Definitions = {
    options: {
        text: null,
        href: null,
        iconCls: null,
        active: false,
        expanded: false,
        hasChildren: false,
    },
    fields: {
        depth: 0,
    },
} as const;

class TreeNavItemComponent extends Component {
    static type = 'tree-nav-item';
    get tpl(): TemplateDecl {
        return TREE_NAV_ITEM_TPL;
    }

    get defaultEventData(): Record<string, any> {
        return { ...super.defaultEventData, href: this.href };
    }

    _onTextOptionChange(value: string): void {
        this.setNodeText(value, 'text');
    }

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

    _onExpandedOptionChange(value: boolean): void {
        value
            ? this.addCls('q-tree-nav-item--expanded')
            : this.removeCls('q-tree-nav-item--expanded');
    }

    _onHasChildrenOptionChange(value: boolean): void {
        value
            ? this.addCls('q-tree-nav-item--has-children')
            : this.removeCls('q-tree-nav-item--has-children');
    }

    setActive(value: boolean): void {
        this.active = value;
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.el?.style.setProperty('--q-item-depth', String(this.depth));
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        if (props?.depth !== undefined) {
            this.depth = props.depth;
            this.el?.style.setProperty('--q-item-depth', String(this.depth));
        }
    }
}

TreeNavItemComponent.define(TreeNavItemComponentDefs);

export { TreeNavItemComponent };
export type TreeNavItemComponentInstance = InstanceType<typeof TreeNavItemComponent>;
