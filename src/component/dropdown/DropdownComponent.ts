import { ButtonComponent } from '../button/ButtonComponent';

export let DropdownComponent = ButtonComponent.replace({
    type: 'Dropdown',
    cls: 'q-dropdown',
    nodeOverrides: {
        dropIcon: { hidden: false },
    },
});

export type DropdownComponent = InstanceType<typeof DropdownComponent>;
