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
                anchor: 'self',
                placement: 'bottom',
                options: { items: value },
            });
        }
    }

    showPopover(): void {
        super.showPopover();
        const inst = this._getPopoverInstance();
        if (inst) {
            inst.ready.then(() => {
                inst.el?.style.setProperty('min-width', `${this.el?.offsetWidth ?? 0}px`);
            });
        }
    }
}

DropdownComponent.define(DropdownComponentDefs);
