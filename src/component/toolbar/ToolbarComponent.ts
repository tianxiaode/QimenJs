import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import './toolbar.css.ts';

/** 工具栏属性接口 */
export interface ToolbarProps extends ItemGroupProps {}

/** 工具栏组件 */
class ToolbarComponent extends ItemGroupStaticComponent {
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
/** 工具栏实例类型 */
export type ToolbarComponentInstance = InstanceType<typeof ToolbarComponent>;
