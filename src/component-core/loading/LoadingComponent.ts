import { FloatingComponent } from '../overlay/FloatingComponent';
import type { TemplateDecl } from '../types';
import type { Definitions } from '@/composable';
import { LOADING_TPL } from './loading-tpl';
import './loading.css';

class LoadingComponent extends FloatingComponent {
    static type = 'loading';

    get tpl(): TemplateDecl {
        return LOADING_TPL;
    }

    onOverlayChange(data: any): void {
        if (!data) return;
        const textEl = this.getNodeEl('text');
        if (data.text !== undefined) {
            this.text = data.text; // Update the text property
            if (textEl) textEl.style.display = data.text ? '' : 'none';
        }
        if (data.visible !== undefined) this.hidden = !data.visible;
    }
}

const LoadingComponentDefs: Definitions = {
    targetToOptions: {
        text: { target: 'text', to: 'text' },
    },
};

LoadingComponent.define(LoadingComponentDefs);
LoadingComponent.register();

export { LoadingComponent };
export type LoadingComponentInstance = InstanceType<typeof LoadingComponent>;
