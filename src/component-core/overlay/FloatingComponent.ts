import { Component } from '../Component';
import type { Definitions } from '@/composable/types';

const FloatingComponentDefs: Definitions = {
    options: {
        placement: { target: 'data-placement', to: 'attribute' },
        offset: { target: '--offset', to: 'style' },
        showDelay: { target: 'data-show-delay', to: 'attribute' },
        hideDelay: { target: 'data-hide-delay', to: 'attribute' },
    },
};

export class FloatingComponent extends Component {
    initOverlayHost(): void {
        this.el.style.display = 'none';
        this.el.style.position = 'fixed';
    }
}

FloatingComponent.define(FloatingComponentDefs);