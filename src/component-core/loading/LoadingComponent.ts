import { Component } from '../Component';
import type { TemplateDecl } from '../types';
import type { Definitions } from '@/composable';
import { LOADING_TPL } from './loading-tpl';
import './loading.css';

class LoadingComponent extends Component {
    static type = 'loading';

    get tpl(): TemplateDecl {
        return LOADING_TPL;
    }

    _onTextOptionChange(value: string): void {
        this.setNodeText(value, "text");
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
