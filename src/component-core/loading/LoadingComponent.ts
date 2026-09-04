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
}

const LoadingComponentDefs: Definitions = {
    targetToOptions: {
        text: { target: 'text', to: 'text' },
    },
    options: {
        persistent: true,
    },
};

LoadingComponent.define(LoadingComponentDefs);

export { LoadingComponent };
export type LoadingComponentInstance = InstanceType<typeof LoadingComponent>;
