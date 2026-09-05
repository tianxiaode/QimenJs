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

    _onTextOptionChange(value: string): void {
        this._setNodeText('text', value);
    }
}

const LoadingComponentDefs: Definitions = {
    options: {
        text: null,
        persistent: true,
    },
};

LoadingComponent.define(LoadingComponentDefs);

export { LoadingComponent };
export type LoadingComponentInstance = InstanceType<typeof LoadingComponent>;
