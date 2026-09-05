import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import './toolbar.css';

class ToolbarComponent extends ItemGroupStaticComponent {
    onAfterInit(props?: Record<string, any>): void {
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
/** 工具栏实例类型 */
export type ToolbarComponentInstance = InstanceType<typeof ToolbarComponent>;
