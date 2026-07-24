import { ButtonComponent } from '../button/ButtonComponent';

export let DropdownComponent = ButtonComponent.replace({
    type: 'Dropdown',
    body: {
        nodes: {
            root: { addCls: 'q-dropdown' },
            dropIcon: { hidden: false },
        },
        floats: {
            dropIcon: { type: 'Menu', trigger: 'click', placement: 'bottom' },
        },
    },
});

export type DropdownComponent = InstanceType<typeof DropdownComponent>;
