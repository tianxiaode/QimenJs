import { ButtonComponent } from '../button/ButtonComponent';

export let DropdownComponent = ButtonComponent.replace({
    type: 'Dropdown',
    cls: 'q-dropdown',
    nodeOverrides: {
        dropIcon: { hidden: false },
    },
    body: {
        floats: {
            dropIcon: { type: 'Menu', trigger: 'click', placement: 'bottom' },
        },
    },
});

export type DropdownComponent = InstanceType<typeof DropdownComponent>;
