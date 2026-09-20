import { ButtonComponent } from '../button/ButtonComponent';
import type { Definitions } from '@/composable';
import './dropdown.css';

const DropdownComponentDefs: Definitions = {
    options: {
        arrowCls: 'q-caret',
        items: null,
    },
    fields: {
        anchorNode: 'dropIcon',
    },
} as const;

export class DropdownComponent extends ButtonComponent {
    static type = 'dropdown';

    get _cssPrefix(): string {
        return 'q-button';
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-dropdown');
        if (!this.getData('arrowHidden')) {
            this.setNodeHidden(false, 'dropIcon');
        }
    }

    _onItemsOptionChange(value: any): void {
        if (value && !this.getData('popover')) {
            this.setData('popover', {
                type: 'menu',
                trigger: 'click',
                anchor: this.anchorNode ?? 'dropIcon',
                placement: 'bottom',
                options: { items: value },
            });
        }
    }
}

DropdownComponent.define(DropdownComponentDefs);
