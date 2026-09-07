import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import './toolbar.css';

class ToolbarComponent extends ItemGroupStaticComponent {
    get defaultOptions(): Record<string, any> {
        return { direction: 'horizontal', gap: '4px' };
    }

    onAfterInit(): void {
        this.addCls('q-toolbar');
        (this as any).itemContainer?.el?.classList.add('q-toolbar__items');

        super.onAfterInit();
    }
}

export { ToolbarComponent };
