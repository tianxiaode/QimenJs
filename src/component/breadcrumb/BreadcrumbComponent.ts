import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { TemplateDecl } from '@/component-core';
import { Definitions } from '@/composable';
import { BREADCRUMB_TPL } from './breadcrumb-tpl';
import './breadcrumb.css';

const BreadcrumbComponentDefs: Definitions = {
    options: {
        items: null,
        separator: '/',
    },
} as const;

class BreadcrumbComponent extends ItemGroupStaticComponent {
    static type = 'breadcrumb';
    defaultItemType = 'href';

    get tpl(): TemplateDecl {
        return BREADCRUMB_TPL;
    }

    get defaultOptions(): Record<string, any> {
        return {
            ...super.defaultOptions,
            direction: 'horizontal',
        };
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-breadcrumb');
        const separator = this.getData('separator') ?? '/';
        this.el?.style.setProperty('--q-breadcrumb-separator', `"${separator}"`);
    }

    _onSeparatorOptionChange(value: string): void {
        this.el?.style.setProperty('--q-breadcrumb-separator', `"${value}"`);
    }
}

BreadcrumbComponent.define(BreadcrumbComponentDefs);

export { BreadcrumbComponent };
export type BreadcrumbComponentInstance = InstanceType<typeof BreadcrumbComponent>;
