import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';

export interface ToolbarProps extends ItemGroupProps {}

class ToolbarComponent extends ItemGroupStaticComponent {
    static type = 'Toolbar';

    type = 'Toolbar';

    onAfterInit(props?: ToolbarProps): void {
        this.addCls('q-toolbar');
        (this as any).itemContainer?.el?.classList.add('q-toolbar__items');

        super.onAfterInit({
            ...props,
            direction: props?.direction ?? 'horizontal',
            gap: props?.gap ?? '4px',
        });
    }
}

export { ToolbarComponent };
export type ToolbarComponentInstance = InstanceType<typeof ToolbarComponent>;
