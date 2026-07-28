import { ButtonComponent } from '../button/ButtonComponent';

class DropdownComponent extends ButtonComponent {
    static type = 'Dropdown';

    type = 'Dropdown';

    onAfterInit(props?: any): void {
        super.onAfterInit(props);
        this.addCls('q-dropdown');
        this.setNodeHidden(false, 'dropIcon');
    }

    get floats(): any {
        return {
            dropIcon: { type: 'Menu', trigger: 'click', placement: 'bottom' },
        };
    }
}

export { DropdownComponent };
export type DropdownComponentInstance = InstanceType<typeof DropdownComponent>;
