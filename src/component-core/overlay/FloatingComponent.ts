import { Component } from '../Component';
import { ZIndexAbility, ViewportPositionAbility } from '../abilities/overlay';
import type { Definitions } from '@/composable/types';
import { OverlayRoot } from './OverlayRoot';

const FloatingComponentDefs: Definitions = {
    options: {
        anchor: null,
        placement: null,
        offset: null,
        showDelay: null,
        hideDelay: null,
        left: null,
        top: null,
        right: null,
        bottom: null,
        width: null,
        height: null,
        position: null,
        zIndex: null,
        viewportPosition: null,
        transform: null,
    },
    property: {
        _overlayOpen: false,
    },
};

export class FloatingComponent extends Component {
    get overlayRoot(): HTMLElement | null {
        if (typeof document === 'undefined') return null;
        return OverlayRoot.getInstance().getRoot();
    }

    mountToOverlay(el: HTMLElement): void {
        const root = this.overlayRoot;
        if (root) {
            root.appendChild(el);
        }
    }

    unmountFromOverlay(el: HTMLElement): void {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
}

FloatingComponent.define(FloatingComponentDefs);
FloatingComponent.use([ZIndexAbility, ViewportPositionAbility]);
